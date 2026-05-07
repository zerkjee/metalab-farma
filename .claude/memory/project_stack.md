---
name: Stack do projeto meu-site
description: Tecnologias, estrutura de pastas e comandos do projeto
type: project
originSessionId: dbaba2d9-f209-4f60-b102-47368f79a104
---
Stack: TypeScript + Next.js 16.2.5 (App Router) + Tailwind CSS v4 + ESLint 9
Package manager: pnpm (node_modules/.pnpm store)
Arquitetura: Next.js App Router — código em `src/app/`
Sem banco de dados, sem testes, sem Prettier/Biome configurados.

Comandos principais:
- `pnpm dev` — servidor de desenvolvimento
- `pnpm build` — build + type check
- `pnpm lint` — ESLint

**Why:** Projeto gerado com create-next-app, ainda em estado de starter.
**How to apply:** Usar pnpm (não npm/yarn) em todos os comandos sugeridos.
