# SoundCluster Product Plan

## Purpose

SoundCluster는 사용자가 검색한 곡을 감정 벡터로 분석하고, 여러 곡 사이의 감정적 거리를 3D 공간에서 비교하게 하는 음악 탐색 도구다.

## Current Product Scope

- 곡명 또는 아티스트 기반 iTunes 검색
- 검색 결과에서 곡 메타데이터 선택
- LRCLIB 기반 가사 조회
- Gemini 기반 5차원 감정 분석
- MySQL 기반 분석 결과 캐싱
- R3F 기반 3D 감정 공간 렌더링
- 감정 축 on/off 기반 재투영
- 선택 곡 기준 nearest/farthest 관계 계산
- hover 또는 선택 상태에서 곡 정보와 감정값 표시
- nanoid 기반 공유 URL 생성
- 공유 URL을 통한 클러스터 복원

## User Flow

```text
User
  |
  | search by song title or artist
  v
iTunes results
  |
  | click + on a track
  v
Track is added with default emotion values
  |
  | lyrics lookup + Gemini analysis starts
  v
SSE progress animation
  |
  | final 5D JSON is received
  v
Track emotion vector is updated
  |
  | selected axes are applied
  v
3D cluster rerenders
  |
  | select another track
  v
nearest/farthest relation recalculates
  |
  | share
  v
snapshot is stored and short URL is returned
```

## Emotion Vector

The product uses five fixed emotion dimensions.

```text
energy        # intensity and drive
valence       # positive to melancholic tendency
tempoDensity  # rhythmic density
spaceDepth    # wide/deep to intimate spatial feel
tension       # calm to strained emotional pressure
```

Values are produced by Gemini and validated as numbers from `0.0` to `1.0`.
Users do not edit these values directly.
Users only toggle whether each axis participates in the projection.

## Interaction Rules

- Search text is only an iTunes query.
- The `+` button starts extraction for one selected result.
- The selected track is shown in the bottom HUD.
- The selected track can be removed.
- All tracks can be reset after confirmation.
- Hovered tracks show metadata popups.
- Selected, nearest, and farthest tracks remain visually emphasized.
- Nearest relation uses a solid line.
- Farthest relation uses a dashed line.
- Debug response panel is development-only and can have its opacity adjusted.

## Visual Direction

- Dark space background.
- R3F stars rotate with OrbitControls.
- No CSS star grid pattern.
- Track nodes are small glowing points, not large planets.
- UI panels use dark glass surfaces.
- The right panel is named `Emotions`.
- The left panel is named `Search Results`.
- The 3D scene shows sparse XYZ axis lines without text labels.

## Out of Scope For Current Slice

- Spotify API integration.
- User-editable emotion scores.
- Public account system.
- Playlist import.
- Real-time collaboration.
- Server-side 3D projection persistence.
