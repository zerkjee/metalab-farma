# Arquitetura de Reconciliação — Integração ERP Tiny/Olist

> Documento do **Agente 1 (Arquiteto de Integração)**. Escopo: auditoria + plano de
> reconciliação. **Nenhum código de aplicação foi alterado.**
>
> **Fato central:** o projeto **já tem** uma integração Tiny parcial (Waves 1 e 2A),
> construída e mergeada em produção, porém **DESLIGADA** (sem `TINY_API_TOKEN`). A spec
> do usuário foi escrita como se fosse greenfield e usa nomes de campo diferentes dos que
> já existem. A recomendação global é **REUSAR o que existe + adição mínima**, nunca criar
> uma integração paralela duplicada.

---

## 1. Estado atual (o que já existe)

### 1.1 Campos Tiny no model `Pedido` (`prisma/schema.prisma`, tabela `pedidos`)

| Campo | Tipo Prisma | Semântica |
|---|---|---|
| `tinyPedidoId` | `String?` | ID do pedido gerado pelo Tiny na criação |
| `tinyStatus` | `String?` | Situação mais recente retornada pelo Tiny |
| `tinySyncStatus` | `TinySyncStatus @default(PENDENTE)` | Estado do sync interno (enum, lock) |
| `tinySyncAt` | `DateTime?` | Última tentativa de sincronização |
| `tinyErro` | `String? @db.Text` | Mensagem de erro p/ debug |
| `nfNumero` | `String?` | Número da NF-e emitida pelo Tiny |
| `nfChave` | `String?` | Chave de acesso NF-e (44 dígitos) |
| `nfUrl` | `String?` | URL do DANFE/PDF |
| `tinyPayload` | `String? @db.Text` | Payload bruto da última resposta Tiny |
| `tinyLastWebhookAt` | `DateTime?` | Último webhook recebido do Tiny |

Índices existentes: `@@index([tinySyncStatus])`, `@@index([tinyPedidoId])`.

Enum existente:

```prisma
enum TinySyncStatus {
  PENDENTE     // aprovado, ainda não enviado ao Tiny
  PROCESSANDO  // sync em andamento (lock atômico)
  ENVIADO      // criado no Tiny com sucesso
  ERRO         // falhou após todas as tentativas
  IGNORADO     // cancelado antes de ser enviado
}
```

### 1.2 Camadas já implementadas

- **Client** — `lib/tiny.ts`. API Tiny v2 (`https://api.tiny.com.br/api2`), corpo
  `x-www-form-urlencoded` com `token`, `formato=json`, recurso serializado como JSON.
  Trata o padrão "HTTP 200 + `retorno.status === 'Erro'`". Funções:
  `tinyConfigurado()` (guard: `Boolean(process.env.TINY_API_TOKEN)`),
  `localizarPedidoTiny(numero)`, `criarOuLocalizarPedidoTiny(input: TinyPedidoInput)`
  (idempotente: pesquisa antes de incluir), `consultarPedidoTiny(tinyPedidoId)`.
  Constante-guarda `TINY_DISABLED`. Tipos `TinyItemInput`, `TinyPedidoInput`, `TinyOutcome`.
- **Enfileiramento** — `lib/qstash.ts`: `enqueueTinySync(pedidoId, delay=5, retries=5)`
  publica no QStash em `/api/jobs/tiny-sync-pedido`. No-op silencioso sem `QSTASH_TOKEN`
  (sem fallback síncrono, por design). Payload: `TinySyncJobPayload { pedidoId: string }`.
- **Job consumer** — `app/api/jobs/tiny-sync-pedido/route.ts`. Autentica assinatura
  Upstash; valida payload; **guard `tinyConfigurado()`**; **lock atômico idempotente**
  (`updateMany where tinySyncStatus in [PENDENTE, ERRO] → PROCESSANDO`); carrega pedido +
  itens; chama `criarOuLocalizarPedidoTiny`; em sucesso grava `tinyPedidoId`/`ENVIADO`;
  em erro grava `ERRO` + responde 500 (QStash retenta); Tiny desligado → volta a `PENDENTE`
  e responde 200 (sem retry).
- **Webhook Mercado Pago** — `app/api/pagamento/webhook/route.ts`. **JÁ chama
  `enqueueTinySync(pedido.id)` (linha 94)** após pagamento aprovado e `updated.count > 0`,
  como fire-and-forget (`void`). Ou seja: o "passo 1 da Wave 3" **já está no código**; a
  integração continua inerte apenas porque `TINY_API_TOKEN`/`QSTASH_TOKEN` não estão no
  ambiente.
- **Re-sync manual** — `app/api/admin/pedidos/[id]/resync/route.ts`. `requireAdmin`,
  exige `pedido.pago`, re-enfileira via `enqueueTinySync`. Botão já existe na UI.
- **Logging** — usa `AuditLog` via `logAudit()` (`lib/audit.ts`). Ações já usadas:
  `tiny.pedido.sincronizado` e `tiny.pedido.erro`, `recurso: 'Pedido'`, ator de sistema
  `{ adminId: 'system', adminEmail: 'tiny-sync@sistema' }`.
- **Auth admin** — `lib/adminGuard.ts` → `requireAdmin()` (ADMIN/SUPER_ADMIN). Padrão já
  adotado pela rota de resync.
- **UI admin** — `app/admin/pedidos/[id]/page.tsx` já tem seção "Tiny ERP": badge de
  sincronização (`tinyBadgeMeta` mapeia PENDENTE/PROCESSANDO/ENVIADO/ERRO), exibição do
  `tinyPedidoId`, bloco de NF-e (`nfNumero`/`nfUrl`) e botão "Re-sincronizar". A lista
  `app/admin/pedidos/page.tsx` **não** tem badge Tiny.
- **Env** — `.env.example` já documenta `TINY_API_TOKEN=""` (Wave 1: vazio) e
  `TINY_WEBHOOK_SECRET=""` (Wave 4). Token real está apenas no `.env.local` do usuário.

### 1.3 Migration
`20260604130000_add_tiny_erp_fields` (aditiva, já aplicada) criou os 10 campos + enum.

---

## 2. Mapa dos models (campos relevantes ao Tiny)

### `Pedido` (dados do comprador ficam no próprio pedido — snapshot)
- Identidade: `numero` (unique, enviado ao Tiny como `numero_pedido_ecommerce`),
  `idempotencyKey`.
- Comprador (snapshot, **usados hoje pelo job**): `compradorNome`, `compradorEmail`,
  `compradorCpf` (obrigatório), `compradorTelefone?`.
- Endereço: `enderecoId` (FK → `Endereco`) **e** `enderecoSnap` (`String? @db.Text`, JSON
  serializado). O client atual aceita `enderecoSnap` em `TinyPedidoInput` mas **não** o
  mapeia para o payload Tiny — o endereço **não é enviado hoje** (ver Riscos).
- Valores: `subtotal`, `desconto`, `frete`, `total` (`Decimal`).

### `ItemPedido`
- `produtoSku` (snapshot → enviado como `item.codigo`), `produtoNome` (`item.descricao`),
  `quantidade`, `precoUnit`. Suficiente para criar o pedido no Tiny.

### `Produto`
- **Existe:** `sku` (unique, obrigatório), `ean` (`String?`), `marca`, `preco`,
  `pesoGramas?`, `alturaCm?`, `larguraCm?`, `comprimentoCm?`.
- **FALTA (dados fiscais NF-e):** `ncm`, `origem` (0–8), `unidade` (UN/CX...),
  `cest`. Nenhum existe no schema. Esses dados são exigidos para **emissão de NF-e**, não
  para criar o pedido — normalmente residem no cadastro do produto **dentro do Tiny**.
  Tratar como **opcional / Wave 4 (NF-e)**, não como bloqueio da criação de pedido.

### `Usuario`
- Tem `cpf?` (unique) e `telefone?`, mas o fluxo Tiny **não** lê de `Usuario` — usa os
  snapshots `comprador*` do `Pedido` (correto, pois há checkout de convidado com
  `usuarioId` nulo).

### `Endereco`
- `cep`, `logradouro`, `numero`, `complemento?`, `bairro`, `cidade`, `estado` (Char(2)).
  Estrutura completa para o `endereco.entrega` do Tiny, mas hoje não é enviada.

---

## 3. Reconciliação spec ↔ existente

| Item da spec (greenfield) | Equivalente existente | Decisão |
|---|---|---|
| `tinyOrderId` | `tinyPedidoId` (`String?`) | **REUSAR** — não adicionar |
| `tinyOrderNumber` | *(inexistente)* | **ADICIONAR** `tinyNumero String?` (nº do pedido no Tiny, ≠ do `numero` interno e ≠ do id) |
| status `TINY_ORDER_CREATED` | `TinySyncStatus.ENVIADO` | **MAPEAR** — manter enum |
| status `NOT_SENT_TO_TINY` | `TinySyncStatus.PENDENTE` | **MAPEAR** — manter enum |
| status `SEND_FAILED`/erro | `TinySyncStatus.ERRO` | **MAPEAR** |
| status "em processamento" | `TinySyncStatus.PROCESSANDO` | **MAPEAR** |
| status "cancelado/ignorado" | `TinySyncStatus.IGNORADO` | **MAPEAR** |
| `TinyIntegrationLog` (model novo) | `AuditLog` + `logAudit()` | **REUSAR** `AuditLog` (ver §3.1) |
| `tinyInvoiceKey` | `nfChave` (`String?`) | **REUSAR** |
| `tinyInvoiceDanfeUrl` | `nfUrl` (`String?`) | **REUSAR** |
| `tinyInvoiceNumber` | `nfNumero` (`String?`) | **REUSAR** |
| `tinyInvoiceXmlUrl` | *(inexistente)* | **ADICIONAR** `nfXmlUrl String?` |
| `invoiceStatus` | *(inexistente)* | **ADICIONAR** `nfStatus String?` |
| `invoiceIssuedAt` | *(inexistente)* | **ADICIONAR** `nfEmitidaEm DateTime?` |
| último webhook Tiny | `tinyLastWebhookAt` | **REUSAR** |
| payload bruto / debug | `tinyPayload`, `tinyErro` | **REUSAR** |

### 3.1 Decisão principal: status e log (menor risco)

- **Status:** **MANTER o enum `TinySyncStatus`** e mapear os nomes da spec para os valores
  existentes na camada de apresentação. **NÃO** migrar para status-string da spec. Motivo:
  já há dados em produção (8 pedidos `PENDENTE`), índice `@@index([tinySyncStatus])`, lock
  atômico e UI dependendo desses valores exatos. Migrar exigiria migration destrutiva +
  reescrever job, mapper e UI — alto risco, zero ganho funcional.
- **Log:** **REUSAR `AuditLog`** (já grava `tiny.pedido.sincronizado`/`tiny.pedido.erro`).
  **NÃO** criar `TinyIntegrationLog`. O `AuditLog` já cobre ator, ação, recurso, `recursoId`
  e `detalhe` (JSON). Um model novo duplicaria infra sem benefício e fragmentaria a
  auditoria. Se for preciso mais granularidade, basta padronizar novas `acao` (ex.:
  `tiny.nf.emitida`, `tiny.webhook.recebido`).

---

## 4. Alterações mínimas no Prisma (para o Agente 2)

**Aditivas, todas nullable, sem default destrutivo, sem tocar no que existe.** Nenhuma
renomeação. Adicionar ao model `Pedido`:

```prisma
model Pedido {
  // ... campos existentes inalterados ...

  // ─── Adições de reconciliação (Agente 2) ───
  tinyNumero  String?    // spec tinyOrderNumber — nº do pedido gerado pelo Tiny (≠ numero interno, ≠ tinyPedidoId)
  nfStatus    String?    // spec invoiceStatus — situação da NF-e (ex.: "emitida", "autorizada")
  nfXmlUrl    String?    // spec tinyInvoiceXmlUrl — URL do XML da NF-e
  nfEmitidaEm DateTime?  // spec invoiceIssuedAt — data/hora de emissão da NF-e
}
```

- Sem novos índices obrigatórios (nenhum desses campos é chave de busca quente).
- **NÃO** adicionar `tinyOrderId` (coberto por `tinyPedidoId`), nem duplicar
  `nfChave`/`nfNumero`/`nfUrl`, nem criar `TinyIntegrationLog`.

**Opcional / diferir para Wave 4 (NF-e) — só se a emissão fiscal for feita pela loja e não
pelo cadastro do Tiny.** No model `Produto`:

```prisma
// ncm       String?
// origem    String?  @default("0")
// unidade   String?  @default("UN")
// cest      String?
```

Recomendação: **não** adicionar agora; a criação de pedido não precisa deles.

Uma única migration aditiva (ex.: `add_tiny_reconciliation_fields`). `prisma generate` +
`migrate deploy`. Zero backfill.

---

## 5. O que reusar vs. criar novo (por camada)

| Camada | Reusar | Criar novo |
|---|---|---|
| Client Tiny | `lib/tiny.ts` inteiro (transporte, idempotência, guard) | Só se a spec exigir emissão de NF-e / consulta de estoque: novas funções **no mesmo arquivo** (`emitirNotaFiscalTiny`, `consultarEstoqueTiny`) |
| Mapper (loja→Tiny) | `TinyPedidoInput` + montagem em `criarOuLocalizarPedidoTiny` | **Completar** o mapeamento de endereço (hoje `enderecoSnap` não vira `endereco` no payload) |
| Validação | guard `tinyConfigurado()`, validação de payload no job | — |
| Service/Job | `app/api/jobs/tiny-sync-pedido/route.ts` (lock, retry, audit) | Job separado só se houver emissão de NF assíncrona (`/api/jobs/tiny-nf-*`) |
| Enfileiramento | `enqueueTinySync` (`lib/qstash.ts`) | — |
| Endpoints admin | `/api/admin/pedidos/[id]/resync` + `requireAdmin` | Endpoint p/ emitir NF, se a spec pedir |
| Webhook saída (MP→Tiny) | webhook MP já chama `enqueueTinySync` (linha 94) | — |
| Webhook entrada (Tiny→loja) | `tinyLastWebhookAt`, `TINY_WEBHOOK_SECRET` (env já previsto) | **Criar** `/api/webhooks/tiny` (NF emitida / mudança de situação) — não existe ainda |
| Logging | `AuditLog` via `logAudit` | Novas strings de `acao`, não novo model |
| UI admin | seção "Tiny ERP" em `pedidos/[id]` + `tinyBadgeMeta` | Badge Tiny na **lista** `pedidos/page.tsx` (falta); exibir novos campos NF |
| API de leitura | — | **Corrigir gap do §7**: expor `tinySyncStatus`/`tinyPedidoId` ao admin |

---

## 6. Confirmação de compatibilidade (não quebra nada)

- **Checkout:** intocado. O Tiny só entra **após** pagamento aprovado.
- **Webhook Mercado Pago:** o pagamento nunca falha por causa do Tiny — `enqueueTinySync`
  é `void` (fire-and-forget) e **no-op** sem `QSTASH_TOKEN`. Erro no enfileiramento não
  afeta a resposta ao MP.
- **Job Tiny:** protegido por `tinyConfigurado()` — sem `TINY_API_TOKEN` responde 200 e não
  faz chamada real; lock atômico garante idempotência.
- **Admin:** as adições Prisma são nullable → páginas e APIs existentes seguem funcionando.
- **Migration:** puramente aditiva → sem downtime, sem backfill, sem risco em produção.
- **Estado atual verificado:** integração inerte; ligar exige apenas configurar
  `TINY_API_TOKEN` + `QSTASH_TOKEN` no Vercel (o `enqueueTinySync` no webhook **já existe**).

---

## 7. Riscos e pendências

1. **Gap de leitura da UI (bug latente):** `app/admin/pedidos/[id]/page.tsx` lê
   `p.tinySyncStatus` e `p.tinyPedidoId` via `mapApiOrder`, mas o endpoint
   `/api/pedidos/[id]` usa `CUSTOMER_ORDER_SELECT` (`lib/orderSelect.ts`), que **omite
   deliberadamente** esses campos (só expõe `nfNumero/nfChave/nfUrl`). Resultado: o badge
   Tiny sempre renderiza "Não iniciado" e `tinyPedidoId` fica nulo na UI. **Ação p/ Agente
   2:** criar um select/endpoint admin que inclua os campos de plumbing Tiny — **sem**
   vazá-los ao cliente dono do pedido.
2. **Endereço não é enviado ao Tiny:** `enderecoSnap` (JSON string) é aceito em
   `TinyPedidoInput` mas nunca vira `endereco` no payload de `pedido.incluir.php`. Para NF-e
   com entrega correta, o mapeamento precisa ser completado (parse do JSON → campos Tiny).
3. **Produtos sem dados fiscais:** `Produto` não tem `ncm`/`origem`/`unidade`/`cest`. Isso
   bloqueia **emissão de NF-e** (não a criação de pedido). Decidir se o cadastro fiscal vive
   no Tiny (recomendado) ou na loja (exige as colunas do §4).
4. **Divergência de EAN conhecida:** Articulice Cúrcuma tem EAN no banco (`7908408473712`)
   diferente da ficha (`7908645201369`). Confirmar com a Metalab antes que a NF dependa do EAN.
5. **`tinyPedidoId` é `String?` mas o mapper (`utils/adminOrders.ts`) o converte para
   `Number`.** IDs do Tiny cabem em number hoje, mas manter `String` no banco é mais seguro;
   não migrar tipo.
6. **Token só em env:** `TINY_API_TOKEN` fica em `.env.local`/Vercel. Sem rotação
   automatizada. Aceitável, mas documentar quem detém o segredo.
7. **Wave 4 (webhook de entrada Tiny→loja):** ainda não existe rota `/api/webhooks/tiny`
   nem uso de `TINY_WEBHOOK_SECRET`. Necessária para receber "NF emitida" / mudança de
   situação e popular `nfChave`/`nfUrl`/`nfStatus`/`tinyLastWebhookAt`.
8. **Estoque bidirecional (Wave futura):** a spec pode exigir sincronizar estoque
   Tiny→loja; hoje não há client nem job para isso (só criação de pedido). Escopo separado.

---

### Resumo executivo
Reusar quase tudo. Manter o enum `TinySyncStatus` e o `AuditLog` (menor risco). Adicionar
apenas 4 colunas nullable ao `Pedido` (`tinyNumero`, `nfStatus`, `nfXmlUrl`, `nfEmitidaEm`).
Corrigir o gap de leitura admin (§7.1) e completar o mapeamento de endereço (§7.2). A
ativação depende só de configurar as env vars — o gatilho no webhook já está no código.
