# SoundCluster Data Pipeline

## Search And Analysis Pipeline

```text
[Client]                         [Express Server]                 [MySQL DB]                  [External API]
   |                                      |                              |                              |
   |--- 1. Search request -------------->|                              |                              |
   |    GET /api/itunes/search           |                              |                              |
   |                                      |--- 2. iTunes search ---------------------------------------------->|
   |                                      |                              |                         iTunes Search API
   |                                      |<-- 3. Track metadata ---------------------------------------------|
   |                                      |                              |                              |
   |<-- 4. Search results ---------------|                              |                              |
   |    title, artist, albumImageUrl      |                              |                              |
   |                                      |                              |                              |
   |--- 5. Lyrics request -------------->|                              |                              |
   |    GET /api/lyrics/search           |                              |                              |
   |                                      |--- 6. Lyrics lookup ---------------------------------------------->|
   |                                      |                              |                         LRCLIB API
   |                                      |<-- 7. Lyrics or no match ------------------------------------------|
   |                                      |                              |                              |
   |<-- 8. Lyrics response --------------|                              |                              |
   |    lyrics or fallback info           |                              |                              |
   |                                      |                              |                              |
   |--- 9. Analysis SSE connect -------->|                              |                              |
   |    GET /api/analyze/stream           |                              |                              |
   |                                      |--- 10. Analysis cache lookup ---->|                              |
   |                                      |<-- 11. Cache hit or miss --------|                              |
   |                                      |                              |                              |
   |                                      |--- 12. [Cache miss] Gemini request ------------------------------->|
   |                                      |                              |                         Gemini API
   |                                      |<-- 13. 5D JSON response -------------------------------------------|
   |                                      |                              |                              |
   |                                      |--- 14. Cache analysis result ---->|                              |
   |                                      |                              |                              |
   |<-- 15. SSE progress events ----------|                              |                              |
   |    fetching, analyzing, done         |                              |                              |
   |                                      |                              |                              |
   |<-- 16. Final 5D result --------------|                              |                              |
   |    energy, valence, tempoDensity     |                              |                              |
   |    spaceDepth, tension               |                              |                              |
```

## Frontend State Pipeline

```text
iTunes result selected
  |
  | create temporary track with default emotions
  v
snapshot.tracks updated
  |
  | selectedTrackId = track id
  v
StarsCanvas receives snapshot
  |
  | projectEmotionVectorsByAxes()
  v
5D vectors projected to 3D positions
  |
  | createTrackRelationSummary()
  v
nearest/farthest relation derived from selected track
  |
  | StarNodeCollection renders nodes
  v
Canvas updates with selected node, relation lines, and popups
```

## Share Pipeline

```text
[Client]                         [Express Server]                 [MySQL DB]
   |                                      |                              |
   |--- 1. Create share snapshot ------->|                              |
   |    POST /api/share-snapshots        |                              |
   |                                      |--- 2. Validate snapshot       |
   |                                      |                              |
   |                                      |--- 3. Compute snapshot hash ->|
   |                                      |                              |
   |                                      |--- 4. Lookup existing hash -->|
   |                                      |<-- 5. Existing shareId or miss|
   |                                      |                              |
   |                                      |--- 6. [Miss] save snapshot -->|
   |                                      |                              |
   |<-- 7. Return shareId ---------------|                              |
   |                                      |                              |
   |--- 8. Open shared URL -------------->|                              |
   |    ?share=<shareId>                 |                              |
   |                                      |--- 9. Load snapshot by id --->|
   |                                      |<-- 10. Snapshot JSON ---------|
   |<-- 11. Snapshot response -----------|                              |
```

## Cache Behavior

- Analysis cache key is created from normalized title and artist.
- Cache hit streams a stored `done` result immediately.
- Cache miss calls Gemini, validates the response, and stores the result.
- Share snapshot hash reuses an existing `shareId` for identical snapshot data.

## Failure Behavior

- iTunes failure returns an error to the search panel.
- LRCLIB failure does not block analysis; Gemini runs with title and artist.
- Gemini failure sends a failed SSE event and stores no analysis result.
- Invalid share snapshot payload returns `400`.
- Missing share id returns `404`.
