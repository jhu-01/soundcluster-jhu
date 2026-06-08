# SoundCluster

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

SoundCluster maps songs into a 3D emotional space. The app searches track metadata through iTunes, optionally fetches lyrics through LRCLIB, analyzes the song with Gemini, and renders the resulting 5D emotion vector with React Three Fiber.

## Stack

- Frontend: React, TypeScript, Vite, React Three Fiber, Three.js, CSS Modules
- Backend: Express, TypeScript, Server-Sent Events
- LLM: Google `@google/genai`
- External APIs: iTunes Search API, LRCLIB API
- Storage: MySQL
- Tests: TypeScript build + `node:test`

## Current Features

- iTunes track search by title and optional artist
- LRCLIB lyrics lookup with fallback to title/artist-only analysis
- Gemini 5D emotion analysis
- MySQL-backed analysis cache
- SSE progress events for analysis state
- R3F 3D music space rendering
- Axis on/off projection controls for five emotion dimensions
- Hover metadata popup with album image, title, artist, and emotion values
- Selected track HUD with emotion detail panel and remove action
- Nearest/farthest relation calculation and visual connection lines
- `nanoid` share URLs backed by MySQL snapshots
- Response debug panel with opacity control

## Run

Frontend:

```powershell
corepack pnpm dev
```

Backend:

```powershell
.\node_modules\.bin\tsx.cmd server/src/app.ts
```

Default URLs:

```text
Frontend: http://localhost:5173
Backend:  http://127.0.0.1:3001
Health:   http://127.0.0.1:3001/api/health
```

## Validation

```powershell
corepack pnpm run test
corepack pnpm run lint
corepack pnpm run server:build
corepack pnpm run build
```

## Documents

- [Architecture](docs/Architecture.md)
- [Product Plan](docs/product-plan.md)
- [Data Pipeline](docs/pipeline.md)
- [Routing](docs/routing.md)
- [Design](docs/design.md)
- [Checklist](docs/checklist.md)
- [Agent Rules](docs/agents.md)

## Branch Policy

- `main`: integrated stable branch
- `dev`: active integration branch
- `feature/*`: task or milestone branches

Implementation work is tracked through GitHub issues and mirrored in `docs/checklist.md`.

## License

MIT
