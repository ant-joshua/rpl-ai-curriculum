# AI-Assisted Documentation & Spec Generation

![Banner](https://images.pexels.com/photos/8386437/pexels-photo-8386437.jpeg)

> **Level:** Advanced  
> **Prerequisites:** Module 38 — AI Code Review & Refactoring  
> **Output:** AI-generated docs, tech specs, context files, and rule files

## Overview

Dokumentasi dan spesifikasi teknis sering jadi afterthought dalam siklus pengembangan. Modul ini ngajarin cara pakai AI untuk bikin, maintain, dan update dokumentasi secara otomatis — dari tech spec, API docs, context files buat AI agents, sampai rule files buat IDE.

## Learning Outcomes

Setelah modul ini, peserta bisa:

- Generate tech spec lengkap dari PRD pake AI
- Bikin API docs otomatis dari kode (JSDoc/TSDoc, OpenAPI)
- Buat context files (AGENTS.md, CLAUDE.md, SOUL.md) untuk AI agents
- Configure rule files (.cursorrules, copilot-instructions) untuk project
- Setup auto-update docs saat kode berubah

## Sessions

| # | Session | File | Description |
|---|---------|------|-------------|
| 01 | [Tech Spec with AI](./01-tech-spec-with-ai.md) | [view](01-tech-spec-with-ai.md) | Generate & maintain technical specifications using AI, ADRs, sequence diagrams |
| 02 | [Documentation Generation](./02-doc-generation.md) | [view](02-doc-generation.md) | README, API docs, changelog, auto-update documentation from code changes |
| 03 | [Context Files](./03-context-files.md) | [view](03-context-files.md) | AGENTS.md, CLAUDE.md, SOUL.md — context files for AI coding agents |
| 04 | [Rules Files](./04-rules-files.md) | [view](04-rules-files.md) | .cursorrules, copilot-instructions, IDE config for AI-assisted coding |

## Key Concepts

- **Tech Spec AI**: AI-assisted generation dari PRD → structured tech spec
- **ADR**: Architecture Decision Records — dokumentasi keputusan arsitektur
- **Auto-Docs**: Dokumentasi yang digenerate otomatis dari kode
- **Context Files**: File khusus buat AI agents biar paham konteks project
- **Rule Files**: Konfigurasi IDE/editor buat ngontrol perilaku AI coding tools

## Tools & Technologies

- AI assistants (Claude, ChatGPT, Copilot)
- Documentation generators: TypeDoc, Swagger-JSDoc, JSDoc
- Mermaid.js untuk diagram
- Conventional Commits + changelog generators
- Cursor, Windsurf, VS Code

## Project Structure

```
55-ai-docs-spec/
├── README.md
├── 01-tech-spec-with-ai.md
├── 02-doc-generation.md
├── 03-context-files.md
├── 04-rules-files.md
└── labs/                    # Lab workspace (peserta)
    └── express-api/         # Contoh project Express untuk latihan
```

## Related Modules

- **Module 38** — AI Code Review & Refactoring (prerequisite)
- **Module 52** — AI-Powered Pull Request Review
- **Module 53** — Test Generation
- **Module 54** — AI CLI Agents
