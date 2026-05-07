# METALAB Farma — Status do Projeto

## Onde paramos
Homepage completa e funcionando. Frontend-only, sem backend ainda.

## O que foi feito
- Layout completo: Header, Footer
- 7 sections: Hero, Benefícios, Categorias, Produtos, Institucional, Depoimentos, Newsletter
- Dados mockados: 8 produtos, 5 categorias, 6 depoimentos
- Animações com Framer Motion
- Design system: verde #2d7a4f, tipografia DM Sans + Playfair Display

## Próximos passos sugeridos
1. Página de produto individual (`/produto/[slug]`)
2. Página de listagem com filtros (`/produtos`)
3. Carrinho funcional (Context API ou Zustand)
4. Checkout (Stripe ou MercadoPago)
5. Painel admin (produtos, pedidos)
6. Integração com backend/banco de dados

## Stack
Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion + Lucide

## Rodar
```bash
pnpm install --ignore-scripts
pnpm dev  # → http://localhost:3000
```

## Workaround ativo
`.pnpmfile.cjs` ignora `@next/swc-win32-x64-msvc` (binário nativo com falha de rede).
Scripts usam `--webpack`. Funciona 100%, só build mais lento.
