# SoundCluster Architecture

SoundCluster는 곡 검색 결과와 가사 정보를 기반으로 Gemini가 5차원 감정 벡터를 추출하고, React Three Fiber가 이를 3D 공간에 배치하는 음악 감정 클러스터링 앱이다.

## Directory Map

```text
soundcluster-jhu/
|-- client/                     # React + Vite frontend
|   `-- src/
|       |-- canvas/             # R3F/WebGL scene, star nodes, relation lines
|       |-- components/         # 2D HUD, search, result panel, controls, share modal
|       |-- constants/          # frontend-only UI constants
|       |-- context/            # analysis stream context
|       |-- hooks/              # EventSource and stream state hooks
|       |-- utils/              # projection, snapshot, API client helpers
|       |-- data/               # initial mock tracks
|       `-- types/              # frontend-specific aliases
|
|-- server/                     # Express backend
|   `-- src/
|       |-- app.ts              # Express app, CORS, route mounting, health route
|       |-- config/             # env, DB, Gemini, iTunes, LRCLIB clients
|       |-- controllers/        # request orchestration, SSE response handling
|       |-- routes/             # route bindings
|       |-- services/           # analysis pipeline and Gemini integration
|       |-- repositories/       # MySQL persistence for cache and snapshots
|       |-- database/           # schema bootstrap
|       `-- validation/         # LLM response validation
|
|-- shared/                     # contracts shared by FE and BE
|   |-- constants/              # route prefixes, model defaults, server constants
|   |-- types/                  # API payload and domain types
|   `-- utils/                  # pure validation and mapping helpers
|
|-- tests/                      # node:test contract tests
|-- docs/                       # project planning and operating documents
`-- codex/skills/               # project-specific Codex skills
```

## Runtime Layers

### Frontend

- `App.tsx` is the main state coordinator.
- Search input calls the backend iTunes proxy.
- Result rows trigger lyrics lookup and Gemini analysis streaming.
- The render source of truth is `ClusterShareSnapshot`.
- Track emotion values are not user-editable; users only toggle which axes are used for projection.
- `StarsCanvas.tsx` projects 5D emotion vectors into 3D coordinates and renders:
  - background starfield
  - track nodes
  - selected track state
  - nearest and farthest relation lines
  - hover and pinned metadata popups

### Backend

- Express exposes API routes under `/api/*`.
- CORS is currently open for local frontend development.
- iTunes and LRCLIB are called only from the backend.
- Gemini is called only from the backend.
- MySQL stores:
  - analysis cache keyed by normalized title and artist
  - share snapshots keyed by `nanoid`
  - snapshot hash to reuse existing share ids for identical data

### Shared

- Shared route constants prevent frontend/backend path drift.
- Shared types define iTunes metadata, lyrics results, SSE events, music analysis results, and share snapshots.
- Shared validation verifies share snapshot shape before server persistence.

## Data Model Summary

```text
Track
|-- id
|-- itunesTrackId?
|-- itunesUrl?
|-- title
|-- artist
|-- albumImageUrl?
`-- emotions
    |-- energy
    |-- valence
    |-- tempoDensity
    |-- spaceDepth
    `-- tension
```

```text
ClusterShareSnapshot
|-- version
|-- selectedTrackId
|-- cameraPosition
|-- cameraTarget
`-- tracks[]
```

## Placement Rules

- R3F or Three.js rendering code goes under `client/src/canvas/`.
- Ordinary React HUD components go under `client/src/components/`.
- Frontend API clients and pure projection helpers go under `client/src/utils/`.
- Backend route bindings go under `server/src/routes/`.
- Request orchestration goes under `server/src/controllers/`.
- Gemini/cache/business flow goes under `server/src/services/`.
- MySQL persistence goes under `server/src/repositories/`.
- Cross-layer constants, payload types, and pure validators go under `shared/`.

## Current Constraints

- The app uses iTunes Search API, not Spotify.
- Lyrics are optional. LRCLIB failure does not block Gemini analysis.
- Gemini response values must remain in the `0.0` to `1.0` range.
- Share URLs store only the compact snapshot id in the URL; the snapshot body is stored in MySQL.
- Camera POV is restored from snapshot defaults or stored snapshot values, while projection is recomputed on the frontend.
