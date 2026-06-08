# AI Agent Operating Guide

This document defines how AI agents should work in the SoundCluster repository.

## Project Facts

- Product: SoundCluster
- Frontend: React, TypeScript, Vite, React Three Fiber, Three.js, CSS Modules
- Backend: Express, TypeScript, SSE
- Storage: MySQL
- LLM: Gemini through `@google/genai`
- Metadata: iTunes Search API
- Lyrics: LRCLIB API
- Share URLs: `nanoid` ids stored in MySQL

## Work Rules

1. Check `git status --short --branch` before editing.
2. Do not overwrite user changes.
3. Read the relevant source files before changing code.
4. Keep changes scoped to the request.
5. Prefer existing project patterns over new abstractions.
6. Put cross-layer contracts in `shared/`.
7. Keep API keys and database credentials on the server.
8. Validate changes with the smallest relevant command set.
9. Report modified files, change summary, validation, and residual risk.

## Coding Rules

- Keep TypeScript strict.
- Avoid `any` unless a boundary cannot be typed more safely.
- Use CSS Modules for component styles.
- Do not add UI libraries without a clear reason.
- Do not compress logic into clever one-line expressions.
- Prefer named intermediate values over nested calls inside conditions.
- Use explicit validation at API and persistence boundaries.
- Preserve useful error context without leaking secrets.
- Add comments only for non-obvious algorithms, external constraints, or performance reasons.

## Architecture Rules

- R3F and Three.js rendering code belongs in `client/src/canvas/`.
- General React HUD code belongs in `client/src/components/`.
- Frontend API helpers belong in `client/src/utils/`.
- Express route bindings belong in `server/src/routes/`.
- Request orchestration belongs in `server/src/controllers/`.
- Gemini and analysis flow belongs in `server/src/services/`.
- MySQL access belongs in `server/src/repositories/`.
- Shared route constants, payload types, and pure validators belong in `shared/`.

## Current API Facts

- `GET /api/itunes/search`
- `GET /api/lyrics/search`
- `GET /api/analyze/stream`
- `GET /api/analyze/history`
- `POST /api/share-snapshots`
- `GET /api/share-snapshots/:shareId`

Spotify is not used.

## Commit Rules

Use reflective commits.

```text
<type>: #<issue> <title>

- 확인내용: <implemented or changed facts, validation, impact>
```

Use `feat`, `fix`, `refactor`, `docs`, `test`, `build`, or `chore`.

## Project Skills

Project-specific Codex skills live under `codex/skills/`.

### checklist-generator

Use when the user asks what to implement next, asks to regenerate a checklist, or asks to align checklist items with the current architecture and implementation.

Inputs:

- `docs/Architecture.md`
- `docs/product-plan.md`
- `docs/pipeline.md`
- `docs/routing.md`
- `docs/checklist.md`
- current repository state
- GitHub issue metadata when requested

Output:

- next implementation checklist
- dependencies
- validation plan
- missing issue links

### github-issue-publisher

Use when checklist items need to become GitHub issues or when `docs/checklist.md` must be synchronized with issue numbers.

Important:

- The skill does not write to GitHub by itself.
- Use GitHub MCP or `gh` for actual issue operations.
- Update checklist issue numbers only after issue creation succeeds.

### coding-rules-checker

Use before committing code or when the user asks whether a change follows project rules.

Checks:

- directory boundary
- validation pattern
- error handling
- comments
- duplicated constants or types
- readability
- cohesion
- frontend styling rules
- server secret handling

## Documentation Rules

- Keep `docs/Architecture.md` aligned with folder boundaries.
- Keep `docs/product-plan.md` aligned with actual product behavior.
- Keep `docs/pipeline.md` aligned with real data flow.
- Keep `docs/routing.md` aligned with shared route constants.
- Keep wiki pages factual and consistent with local docs.
