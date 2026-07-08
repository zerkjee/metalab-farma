# Integração Tiny — Loja Metalab

## Objetivo

A integração envia pedidos pagos da loja Metalab para o Tiny/Olist Tiny como pedidos de venda. Nesta etapa, a loja não emite nota fiscal automaticamente, não sincroniza DANFE/XML e não se comunica diretamente com a SEFAZ.

## Variáveis de Ambiente

```env
TINY_API_VERSION=2
TINY_API_BASE_URL=https://api.tiny.com.br/api2
TINY_API_TOKEN=
TINY_WEBHOOK_SECRET=
TINY_INTEGRATION_MODE=test
TINY_AUTO_SEND_ORDERS=false
TINY_AUTO_ISSUE_INVOICES=false
```

O token fica somente em variável de ambiente. Não salve token no banco, não exponha no frontend e não versione `.env.local`.

## Testar Conexão

1. Acesse o admin em `Tiny ERP`.
2. Clique em `Testar Tiny`.
3. Confirme a mensagem de sucesso ou ajuste `TINY_API_TOKEN`/`TINY_API_BASE_URL`.

## Painel Tiny ERP

O cockpit fica em `Admin > Tiny ERP` e centraliza a operação da integração:

- visão de pedidos prontos para enviar ao Tiny;
- pedidos já vinculados ao Tiny;
- pedidos com erro de sincronização;
- ação manual de envio de pedido;
- teste de conexão com a API;
- mapa dos módulos ativos e planejados.

Nesta etapa, o painel mantém `Pedidos` e `NF-e` ativos. `Produtos`, `Estoque` e `Preços` continuam planejados para evitar rotinas de catálogo antes da validação operacional.

## Enviar Pedido Para o Tiny

1. Abra um pedido pago no admin.
2. Clique em `Enviar para Tiny`.
3. Confira o status `Sincronizado` e o ID do pedido Tiny.
4. Abra o Tiny e valide o pedido de venda criado.

O envio é bloqueado para pedido não pago, pedido sem CPF/CNPJ, endereço incompleto, itens inválidos ou pedido já enviado.

## Fase 2 — Envio manual de pedido para o Tiny

Nesta fase, pedidos pagos podem ser enviados manualmente para o Tiny como Pedido de Venda. Ainda não há emissão automática de NF-e, DANFE ou XML, e o webhook do Mercado Pago não dispara envio ao Tiny enquanto `TINY_AUTO_SEND_ORDERS=false`.

### Como testar

1. Criar ou localizar pedido pago na loja.
2. Acessar o admin.
3. Abrir o detalhe do pedido.
4. Clicar em `Enviar para Tiny`.
5. Conferir se o status mudou para `Enviado`.
6. Acessar o Tiny.
7. Verificar se o pedido apareceu corretamente.

### Checklist de conferência no Tiny

- Cliente correto.
- CPF/CNPJ correto.
- Endereço correto.
- Itens corretos.
- Quantidades corretas.
- Valores corretos.
- Frete correto.
- Desconto correto.
- Observação do pedido correta.

### O que esta fase não faz

- Não emite NF-e.
- Não envia DANFE/XML.
- Não aciona automaticamente após pagamento.
- Não sincroniza nota fiscal.

### Logs

O envio manual grava registros em `tiny_integration_logs` com as ações `CREATE_ORDER_VALIDATION_ERROR`, `CREATE_ORDER_REQUEST`, `CREATE_ORDER_RESPONSE` e `CREATE_ORDER_ERROR`. Os payloads salvos não incluem token.

## Fase 3 — Sincronização de NF-e

Nesta fase, a loja busca no Tiny os dados da NF-e emitida manualmente e salva número, série, chave, status, DANFE, XML e data de emissão no pedido.

### Como testar

1. Envie um pedido pago para o Tiny.
2. Acesse o Tiny.
3. Confira o pedido de venda.
4. Gere/emita a NF-e manualmente no Tiny.
5. Volte ao admin da loja.
6. Abra o pedido.
7. Clique em `Sincronizar NF-e`.
8. Confira se número, chave, DANFE e XML aparecem na loja.

### Resultado esperado

- Status NF-e: Emitida.
- Número da nota visível.
- Série da nota visível quando retornada pelo Tiny.
- Chave da nota visível.
- Link DANFE disponível quando retornado pelo Tiny.
- Link XML disponível quando o XML estiver disponível no Tiny.

### Se aparecer "NF-e não encontrada"

Verifique:

- A nota já foi emitida no Tiny?
- A nota está autorizada?
- O pedido Tiny está vinculado corretamente?
- O número do pedido ecommerce foi enviado corretamente?
- O pedido da loja possui `tinyPedidoId`/`tinyNumero` salvo?

### O que esta fase não faz

- Não emite nota automaticamente.
- Não cancela nota.
- Não envia e-mail para cliente pela loja.
- Não altera pagamento.

Antes de operar NF-e em produção, confirme certificado A1, empresa, natureza de operação, produtos, NCM e regras fiscais com a contabilidade.

## Webhook Tiny

O endpoint de entrada é `POST /api/webhooks/tiny`. Em produção, configure `TINY_WEBHOOK_SECRET`; sem secret a rota falha fechada. O payload é registrado via auditoria e atualiza o pedido quando identifica `tinyPedidoId` ou número interno.

## Automação Futura

O fluxo automático pós-pagamento deve permanecer desligado até validação operacional completa:

```env
TINY_AUTO_SEND_ORDERS=false
TINY_AUTO_ISSUE_INVOICES=false
```

Ative `TINY_AUTO_SEND_ORDERS=true` somente depois de testes reais com pedidos pagos e conferência fiscal. `TINY_AUTO_ISSUE_INVOICES` deve continuar `false` nesta etapa.

## Roadmap Técnico

| Módulo | Status no painel | Possibilidade técnica |
| --- | --- | --- |
| Pedidos | Ativo | Envio manual de pedido pago e gravação do ID Tiny. |
| NF-e | Ativo | Sincronização de nota emitida manualmente no Tiny, DANFE e XML. |
| Produtos | Planejado | Pesquisar/obter produtos por SKU/código e comparar cadastro com a loja. |
| Estoque | Planejado | Consultar saldo por produto e preparar reconciliação controlada. |
| Preços | Planejado | Comparar preço do produto/lista de preço antes de qualquer escrita. |

Qualquer atualização de estoque ou preço deve começar em modo leitura/comparação. Escritas no Tiny ou na loja precisam de confirmação explícita, logs e rollback operacional.

## Checklist Antes de Produção

- Token Tiny válido.
- Certificado A1 configurado no Tiny.
- Empresa e endereço fiscal configurados.
- Natureza de operação revisada.
- Produtos com SKU compatível entre loja e Tiny.
- NCM/tributação revisados no Tiny ou no processo fiscal.
- CPF/CNPJ obrigatório no checkout.
- Frete e descontos conferidos.
- Pedido teste enviado ao Tiny.
- NF-e teste emitida manualmente no Tiny.
- DANFE/XML sincronizados na loja.
- Auditoria funcionando.
- Webhook Tiny configurado com secret.

## Troubleshooting

- `TINY_API_TOKEN não configurado`: defina o token no ambiente do servidor.
- `Cliente sem CPF/CNPJ`: confira dados do pedido no checkout.
- `Endereço sem número/CEP/etc.`: o snapshot de endereço do pedido está incompleto.
- `Produto sem SKU`: ajuste cadastro do produto na loja.
- `Nenhuma NF-e encontrada`: emita a nota no Tiny ou confira o número ecommerce do pedido.
- `Webhook sem secret`: configure `TINY_WEBHOOK_SECRET` e o header de assinatura combinado.
