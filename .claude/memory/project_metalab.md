---
name: Projeto METALAB Farma — Loja Online
description: Frontend completo da loja METALAB Farma desenvolvido com Next.js, Framer Motion e Tailwind v4
type: project
originSessionId: 374da080-982d-4998-9cea-060751528d70
---
Frontend completo de e-commerce farmacêutico/nutracêutico criado do zero.

**GitHub:** https://github.com/zerkjee/metalab-farma

**Why:** Usuário quer uma loja premium para a marca METALAB Farma, focada em conversão, confiança e aparência profissional.

**How to apply:** Ao retomar o projeto, o código está em `C:\Users\Windows 11\meu-site\src\`. Toda a loja está na home page (`src/app/page.tsx`) compondo 7 sections + header/footer.

## Stack
- Next.js 16.2.5 + React 19 + TypeScript
- Tailwind CSS v4 (com `@theme` para tokens customizados)
- Framer Motion 11 (animações scroll-triggered e hover)
- Lucide React (ícones)
- DM Sans + Playfair Display (Google Fonts)

## Workaround crítico
O `@next/swc-win32-x64-msvc` falha ao baixar por instabilidade de rede IPv6. Solução implementada:
- `.pnpmfile.cjs` — hook que remove as dependências SWC do next.js antes do install
- `package.json scripts` — `pnpm dev` e `pnpm build` usam `--webpack` flag
- `.npmrc` — `node-linker=hoisted` + `omit[]=optional`

## Comandos
- `pnpm dev` → http://localhost:3000
- `pnpm build` → build de produção

## Estrutura de componentes
- `src/components/layout/` — Header, Footer
- `src/components/sections/` — Hero, Benefits, Categories, FeaturedProducts, Institutional, SocialProof, Newsletter
- `src/components/ui/` — ProductCard, CategoryCard, StarRating, AnimatedCounter, Badge
- `src/data/` — products.ts (8 produtos), categories.ts (5 cat), testimonials.ts (6 dep)

## Design system
- Verde institucional: `#2d7a4f` (brand-500), `#1a4a32` (brand-800)
- Navy (confiança): `#0f1c2e` (navy-900)
- Fontes custom: `.font-500`, `.font-600`, `.font-700` em globals.css (não são classes Tailwind padrão)
