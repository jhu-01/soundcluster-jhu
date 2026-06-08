# SoundCluster Routing

## Server Mounts

All backend routes are mounted in `server/src/app.ts`.

```text
/api/health
/api/gemini/test
/api/gemini/analyze/test
/api/itunes
/api/lyrics
/api/analyze
/api/share-snapshots
```

## API Routes

| Method | Route | Source file | Purpose |
|---|---|---|---|
| GET | `/api/health` | `server/src/app.ts` | Server health check. Returns `{ "status": "ok" }`. |
| GET | `/api/gemini/test` | `server/src/app.ts` | Gemini text connectivity test. |
| GET | `/api/gemini/analyze/test` | `server/src/app.ts` | Gemini music analysis contract test route. |
| GET | `/api/itunes/search` | `server/src/routes/itunes.ts` | Search iTunes metadata by title and optional artist. |
| GET | `/api/lyrics/search` | `server/src/routes/lyrics.ts` | Search LRCLIB lyrics by title and optional artist. |
| GET | `/api/analyze/stream` | `server/src/routes/analyze.ts` | Stream analysis progress and final result through SSE. |
| GET | `/api/analyze/history` | `server/src/routes/analyze.ts` | Return persisted analysis history. |
| POST | `/api/share-snapshots` | `server/src/routes/shareSnapshot.ts` | Save a share snapshot and return `shareId`. |
| GET | `/api/share-snapshots/:shareId` | `server/src/routes/shareSnapshot.ts` | Load a saved share snapshot. |

## Route Constants

Route strings live in `shared/constants` so client and server do not duplicate paths.

```text
shared/constants/server.ts         # /api/health
shared/constants/gemini.ts         # /api/gemini/test, /api/gemini/analyze/test
shared/constants/itunes.ts         # /api/itunes + /search
shared/constants/lyrics.ts         # /api/lyrics + /search
shared/constants/analyzeStream.ts  # /api/analyze + /stream + /history
shared/constants/shareSnapshot.ts  # /api/share-snapshots
```

## Request Shapes

### iTunes Search

```http
GET /api/itunes/search?title=midnight&artist=taylor%20swift
```

`title` is required. `artist` is optional.

Response shape is defined in `shared/types/itunes.ts`.

### Lyrics Search

```http
GET /api/lyrics/search?title=Yellow&artist=Coldplay
```

`title` is required. `artist` is optional.

Response shape is defined in `shared/types/lyrics.ts`.

### Analyze Stream

```http
GET /api/analyze/stream?title=Yellow&artist=Coldplay&lyrics=...
```

SSE event statuses:

```text
fetching
analyzing
done
failed
```

Final `done` event includes `MusicAnalysisResponse`.

### Share Snapshot Create

```http
POST /api/share-snapshots
Content-Type: application/json

{
  "snapshot": {
    "version": 1,
    "selectedTrackId": "track-id",
    "cameraPosition": [6.4, 4.8, 7.6],
    "cameraTarget": [0, 0, 0],
    "tracks": []
  }
}
```

Returns:

```json
{
  "shareId": "10_char_id"
}
```

### Share Snapshot Read

```http
GET /api/share-snapshots/<shareId>
```

Returns:

```json
{
  "snapshot": {}
}
```

## CORS

The Express app currently sets:

```text
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Allow-Headers: Content-Type
```

This supports local FE/BE development across different ports.
