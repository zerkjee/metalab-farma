# Guia de migração de design — MetaLab (Fase 1 → Fase 2)

Este documento é para **quem vai reskinar as páginas** (Fase 2). A Fase 1 só entregou a
**fundação**: tokens em `app/globals.css`, fontes novas em `app/layout.tsx`, a biblioteca
`components/ui/*` e os logos em `public/brand/`. **Nenhuma página foi reestilizada ainda.**

A fonte de verdade do design fica em `.design-preview/` (gitignored — só leitura). O brief
completo está em `.design-preview/readme.md`.

---

## 1. Paleta: antigo → novo

O visual antigo era **navy-escuro + roxo + âmbar** (gradientes escuros, cartões dark-mode). O
novo é **azul-claro amigável (#79BDE3) + navy (#323C64) sobre fundo claro e quente**. O azul-claro
é a cor **principal/CTAs**; navy é texto/header/footer; gold é **só premium**.

Rode `grep -rn "#0f2756\|#1e50a8" app components` para achar os hardcodes. Mapa dos principais
(por frequência no código atual):

| Hex antigo | Onde aparecia | Migra para (token / utilitário Tailwind) |
|---|---|---|
| `#0f2756` (~213x) | navy base, gradiente de botão/hero, texto | `--navy-solid` / `text-navy` / `bg-navy` (#323C64) |
| `#1e50a8` (~26x) | accent azul, 2ª cor do gradiente de CTA | **cor principal agora** → `--brand-solid` / `bg-brand` / `text-brand` (#79BDE3) |
| `#1e293b`, `#0f172a`, `#020617`, `#111827` | fundos slate escuros (dark-mode) | superfícies claras: `--surface-page`/`bg-surface-page` (#FBFBFA), `--surface-card`/`bg-surface-card`; texto forte → `text-navy` |
| `#60a5fa`, `#3b82f6`, `#0ea5e9`, `#dbeafe`, `#eff6ff` | azuis claros / tints | escala brand: `bg-brand-50`…`bg-brand-600` (ex.: `#dbeafe`→`bg-brand-100`, `#eff6ff`→`bg-brand-50`) |
| `#7c3aed`, `#6b21a8`, `#c4b5fd`, `#c084fc`, `#2d1654`, `#1a0533`, `#1e1b4b`, `#312e81` | roxos decorativos (gradientes, glows) | **não há roxo no DS novo** → trocar por navy (`text-navy`/`bg-navy`) ou brand conforme o papel; remover glows roxos |
| `#d4a85a`, `#c4a35a`, `#e0ac55`, `#C9903A`, `#b8722a`, `#7c4a1e`, `#c4906a` | dourados/âmbar | escala gold: `text-gold`/`bg-gold-50`/`text-gold-600` — **só em contexto premium/selo** |
| `#f59e0b`, `#d97706` | âmbar de "warning" | `--warning-500` / `text-warning` (é o mesmo gold) |
| `#fafafa` (~13x) | fundo de página/body | `--surface-page` / `bg-surface-page` (#FBFBFA) |
| `#94a3b8`, `#85868c` | texto secundário/muted cinza | `text-ink-muted` (#85868C) / `text-ink-secondary` (#63646C) — neutros **quentes** |
| `#10b981`, `#059669`, `#16a34a` | verdes de sucesso | `--success-500` / `text-success` (#3B9B5D) |
| `#f87171`, `#c64b4b` | vermelhos de erro | `--danger-500` / `text-danger` (#C64B4B) |
| cinzas puros (`slate-*`, `gray-*`, `#000`) | bordas, sombras, texto | neutros quentes `--neutral-*` / `border-line` (#E1E1DE); **sombra nunca preta** → `--shadow-sm` (navy 8%) |

Regra geral: **nada de preto puro, nada de cinza puro, nada de roxo.** Fundo claro e quente,
azul-claro para ação, navy para texto/blocos fortes.

### Utilitários Tailwind expostos (via `@theme inline` no globals.css)

Cores (usar como `bg-*`, `text-*`, `border-*`):

- **Marca (azul-claro):** `brand` (=DEFAULT #79BDE3), `brand-hover`, `brand-active`, `brand-subtle`, e escala `brand-50`…`brand-900`.
- **Navy:** `navy` (=#323C64), `navy-hover`, `navy-active`, escala `navy-50`…`navy-900`.
- **Gold (premium):** `gold` (=#C9903A), escala `gold-50/100/300/400/500/600`.
- **Neutros quentes:** `neutral-0`…`neutral-900`.
- **Feedback:** `success`, `success-subtle`, `warning`, `warning-subtle`, `danger`, `danger-subtle`, `info`, `info-subtle`.
- **Superfícies:** `surface-page`, `surface-card`, `surface-sunken`, `surface-inverse`.
- **Texto (como cor):** `ink` (texto primário/navy), `ink-secondary`, `ink-muted`, `on-brand` (texto sobre azul), `on-navy` (texto sobre navy), `link`.
- **Bordas (como cor):** `line` (subtle), `line-default`, `line-strong`.

Exemplos:

```tsx
<button className="bg-brand text-on-brand rounded-full px-6 py-3">Comprar</button>
<button className="bg-brand-hover ...">          {/* hover: um tom mais escuro */}
<h2 className="text-navy font-display">Nossa ciência</h2>
<div className="bg-surface-card border border-line rounded-2xl shadow-sm">…</div>
<span className="bg-gold-50 text-gold-600">selo premium</span>
<p className="text-ink-muted">texto de apoio</p>
```

Você também pode consumir os tokens direto por `var(--...)` em `style={{}}` quando precisar
de algo que não virou utilitário (ex.: `font: 'var(--text-display-lg)'`, `boxShadow: 'var(--shadow-md)'`,
`gap: 'var(--space-6)'`, `borderRadius: 'var(--radius-lg)'`). Todos os tokens (`--space-*`,
`--radius-*`, `--shadow-*`, `--text-*`, `--transition-*`) estão em `:root` no globals.css.

---

## 2. Fontes

Trocadas de **Inter** para o par do DS (via `next/font/google` em `app/layout.tsx`):

- **Display = Fredoka** → CSS var `--font-display`. Use em: headings/títulos, **nomes de produto**, números de destaque (estatísticas, contadores). Utilitário: `font-display`, ou `style={{ fontFamily: 'var(--font-display)' }}`, ou os tokens `--text-display-*`.
- **Body = Nunito Sans** → CSS var `--font-body`. É o **default do `<body>`** e do utilitário `font-sans`. Use em todo o resto (parágrafos, labels, botões, UI).

As duas variáveis são aplicadas no `<html>` pelo layout, então já valem globalmente. Para um
heading display: `<h1 className="font-display">…</h1>` ou `style={{ font: 'var(--text-display-lg)' }}`.

Escala tipográfica pronta (shorthand `font:`): `--text-display-xl/lg/md/sm` (Fredoka),
`--text-heading-lg/md/sm`, `--text-body-lg/md/sm`, `--text-label-md/sm`, `--text-caption`.

---

## 3. Componentes (`components/ui/`)

Importe da barrel: `import { Button, Card, Badge } from '@/components/ui';`
Todos já usam os tokens do DS. Quando usar cada um:

| Componente | Quando usar |
|---|---|
| `Button` | Ação principal. Variantes: `primary` (azul, CTA padrão), `navy`, `secondary` (tint azul), `ghost`, `outline`. Sempre pill. |
| `IconButton` | Botão só-ícone (fechar, carrinho, busca). Variantes `ghost`/`subtle`/`solid`. Exige `aria-label`. |
| `Input` | Campo de texto com label, hint e estado de erro. |
| `Select` | Dropdown nativo estilizado (chevron custom), recebe `options`. |
| `Checkbox` | Múltipla escolha / aceite de termos. |
| `Radio` | Escolha única dentro de um `name`. |
| `Switch` | Liga/desliga (preferências, toggles de admin). |
| `Card` | Container branco 16px + border subtle + shadow-sm. Base de qualquer bloco. |
| `Dialog` | Modal centralizado com scrim navy. `open`, `onClose`, `title`, `footer`. |
| `Badge` | Rótulo curto UPPERCASE (ex.: "MAIS VENDIDO"). Variantes incl. `gold` (premium). |
| `Tag` | Chip removível (filtros ativos, categorias). `onRemove` opcional. |
| `Toast` | Notificação transitória. Variantes `success`/`danger`/`info`. |
| `Tooltip` | Dica no hover. `label` + `position` top/bottom. |
| `Tabs` | Navegação por abas (detalhe de produto, seções de admin). |

Presentacionais (`Badge`, `Tag`, `Card`) não têm `'use client'`; os interativos têm.

> Nota: esta biblioteca usa **inline styles + tokens** (espelha 1:1 o `.design-preview`). Ao
> reskinar, você pode usá-la direto ou seguir o mesmo padrão de tokens com classes Tailwind — o
> resultado visual é o mesmo porque ambos consomem as mesmas `var(--...)`.

---

## 4. Regras de estilo do DS (do `.design-preview/readme.md`)

- **Botões:** sempre **pill** (`rounded-full`). Hover = um tom mais escuro (nunca clarear). Press = `scale(0.97)`.
- **Cards:** superfície branca, **radius 16px** (`--radius-lg`), **1px border subtle**, **shadow-sm**. **Sem borda colorida à esquerda** (padrão proibido).
- **Sombras:** quentes/suaves (navy em 6–14% de opacidade). **Nunca preto.** Sem inner shadow.
- **Cantos:** generosos — 12–16px em cards/inputs, 24px em hero/dialog, full pill em botões/tags/badges.
- **Gold:** **só** para premium/exclusivo (selo de qualidade, edição limitada). Não é accent padrão.
- **Texto:** **sentence case** em títulos e botões. UPPERCASE só em eyebrow/badge pequenos, com letter-spacing.
- **Sem emoji.** A marca é credível/pesquisada, não casual.
- **Layout:** conteúdo centralizado, **max-width 1200px** (`--container-max`), header sticky, **footer navy full-bleed** (o único bloco escuro forte por página).
- **Espaçamento:** base 4px; padding de seção generoso (64–96px) para dar respiro/premium.
- **Movimento:** transições rápidas e sutis (120–280ms), sem bounce. Respeita `prefers-reduced-motion` (já tratado no globals.css).
- **Blur/transparência:** só no scrim do dialog/carrinho (`--surface-overlay`, navy 48%).

---

## 5. Referências de página (Fase 2)

Cada agente da Fase 2 deve seguir o **arquivo de desenho correspondente à sua página**. Os desenhos
(protótipos React de alta fidelidade, com o layout/estrutura esperados) estão em:

- **Site público:** `.design-preview/ui_kits/website/*.jsx`
  — ex.: `HomePage.jsx`, `HomeBanners.jsx`, `ProductListingPage.jsx`, `ProductDetailPage.jsx`,
  `ImmersiveProduct.jsx`, `CategoryPage.jsx`, `CartDialog.jsx`, `CheckoutPage.jsx`, `OrdersPage.jsx`,
  `AuthPages.jsx`, `AboutPage.jsx`, `QualityPage.jsx`, `CertificationsPage.jsx`, `ReviewsPage.jsx`,
  `VipPage.jsx`, `LegalPage.jsx`, `StatePages.jsx`, `SiteHeader.jsx`, `SiteFooter.jsx`, `ProductCard.jsx`.
- **Admin:** `.design-preview/ui_kits/admin/*.jsx`
  — ex.: `DashboardPage.jsx`, `AnalyticsPage.jsx`, `OrdersListPage.jsx`, `OrderDetailPage.jsx`,
  `ProductsAdminPage.jsx`, `CustomersPage.jsx`, `CouponsPage.jsx`, `BannersPage.jsx`,
  `ReviewsAdminPage.jsx`, `AdminManagePage.jsx`, `AuditPage.jsx`, `AdminShell.jsx`.

Há `index.html` em cada pasta para abrir o click-through no navegador. Trate os `.jsx` como
**referência visual/estrutural**, não como código a copiar — a implementação real usa os
componentes `components/ui/` e os utilitários Tailwind acima, mantendo os dados/rotas atuais do app.

Logos oficiais para header/footer: `public/brand/metalab-logo-horizontal.png` (lockup) e
`public/brand/metalab-mark.png` (ícone).
