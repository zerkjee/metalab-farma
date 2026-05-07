---
name: Configuração .claude/ do projeto
description: O que foi configurado via setupdotclaude e decisões tomadas
type: project
originSessionId: dbaba2d9-f209-4f60-b102-47368f79a104
---
Configuração `.claude/` feita em 2026-05-07 via `/setupdotclaude`.

Arquivos presentes:
- `CLAUDE.md` — 13 linhas não-em-branco, comandos pnpm, sem seções desnecessárias
- `.claude/settings.json` — permissões para pnpm (lint, build, dev, start, test, install)
- `.claude/rules/code-quality.md` — padrões de código (universal, sem alterações)
- `.claude/rules/testing.md` — guia de testes (universal, sem alterações)
- `.claude/rules/security.md` — paths: src/app/api/**, **/middleware.ts
- `.claude/rules/error-handling.md` — paths: src/app/api/**
- `.claude/rules/frontend.md` — path-scoped para *.tsx/*.jsx
- `.claude/hooks/` — todos os hooks do template (format-on-save, block-dangerous-commands, etc.)
- `.claude/agents/` — code-reviewer, frontend-designer, security-reviewer, performance-reviewer
- `.claude/skills/` — context-budget, debug-fix, explain, pr-review, refactor, setupdotclaude, ship, tdd, test-writer

Arquivos removidos (não aplicáveis):
- `rules/database.md` — sem banco de dados
- `agents/doc-reviewer.md` — sem diretório docs/

**Why:** Projeto é starter Next.js sem backend, DB ou docs estruturados.
**How to apply:** Não recriar os arquivos deletados a menos que o projeto evolua para ter banco/docs.
