# Visual Reference Refinement - 2026-06-08

Reference image: `C:/Users/JEONG/Downloads/ChatGPT Image 2026년 6월 8일 오후 03_08_30.png`

## Required Corrections

- The background must look like real outer space, not a tiled UI pattern.
- Do not use repeating `background-size` star grids for the visible starfield.
- Stars should have irregular density, mixed brightness, and a few sparse bright points.
- Visible pin-point stars must belong to the R3F scene so they rotate with OrbitControls.
- R3F background stars must use a circular shader mask, not square point sprites.
- Background stars should twinkle by alpha/size modulation while staying fixed in world position.
- CSS background layers may provide only smooth nebula, vignette, or glow. They must not render star dots.
- Background motion is limited to opacity/brightness twinkle only. Star positions stay fixed.
- UI panels should feel like modern glass blocks: darker fill, soft inner border, larger visual padding, subtle highlight on the top edge.
- The top search area should read as a command bar, not a multi-field admin form.
- Search results should use compact album rows with strong hierarchy: cover, title, artist, add button.
- Analysis axes should use switch controls and axis color accents. Axis values are not shown in this panel.
- Song nodes should read as glowing music points, not plastic 3D balls.
- Node geometry should be small, flat-lit, emissive, and softened by glow. Use scale and emissive intensity rather than large sphere detail.
- Song nodes should be only slightly larger than the brightest background stars.
- Track title, artist, and album cover appear in a small popup anchored above the hovered song node.
- Song nodes are single-layer markers. Do not stack a separate core and halo mesh for each song.
- The central scene should prioritize a sparse 3D coordinate volume, faint grid/axis lines, and readable glowing nodes.

## Concrete Style Rules

```css
:root {
  --radius-panel: 14px;
  --radius-control: 10px;
  --panel-fill: rgba(10, 16, 26, 0.76);
  --panel-border: rgba(173, 190, 220, 0.14);
  --panel-highlight: rgba(255, 255, 255, 0.08);
}
```

- Panels may use `14px` radius because this design system intentionally follows the rounded glass block reference.
- Controls use `10px` radius, while tiny icon buttons may remain circular.
- Avoid visible repeated dots, checker patterns, tiled gradients, and regular star spacing.
- The starfield may be CSS-only, but every visible star layer must be non-repeating.
- Prefer asymmetric positions such as `13% 22%`, `61% 7%`, `84% 41%`, not evenly spaced rows or columns.

# SoundCluster UI Design Brief

> Codex 전달용 UI/UX 구현 명세  
> 프로젝트명: **SoundCluster**  
> 목적: 곡명/아티스트 검색 → iTunes API 기반 후보 조회 → 앨범/아티스트/커버/가사 수집 → LLM 감성 축 값 추출 → 3D 공간에 곡 간 거리관계 시각화

![SoundCluster UI Mockup](./SoundCluster_UI_Mockup.png)

---

## 1. 핵심 컨셉

**SoundCluster**는 음악을 감성 좌표계 위에 배치하는 3D 인터랙티브 웹앱이다.

사용자가 곡명 또는 아티스트를 검색하면 iTunes API에서 검색 가능한 곡 후보를 보여준다. 사용자가 특정 곡을 선택하고 **Extract** 버튼을 누르면, 서버가 곡 메타데이터와 가사를 기반으로 LLM API에 분석 요청을 보내고, 결과로 나온 감성 축별 `0.0 ~ 1.0` 값을 3D 좌표로 변환한다. 변환된 곡은 우주 공간의 별/행성처럼 3D 렌더링 영역에 추가된다.

---

## 2. 전체 레이아웃

### 화면 구조

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ SoundCluster          [ Search by song title or artist... ] [ Extract ]       │
│                                                                              │
│ ┌───────────────┐        ┌───────────────────────────────┐   ┌────────────┐ │
│ │ Search Results│        │                               │   │ Analysis   │ │
│ │               │        │      3D Song Cluster View      │   │ Axes       │ │
│ │ song candidates        │                               │   │ toggles    │ │
│ └───────────────┘        └───────────────────────────────┘   └────────────┘ │
│                                                                              │
│                                            ┌───────────────────────────────┐ │
│                                            │ Share Your Cluster            │ │
│                                            │ [ generated URL            ]  │ │
│                                            │ [ Share ]                     │ │
│                                            └───────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 고정 배치

| 영역 | 위치 | 설명 |
|---|---:|---|
| Logo / Project Name | 좌상단 | `SoundCluster` 텍스트 고정 표시 |
| Search Bar | 상단 중앙 | 곡명/아티스트 검색 입력창 |
| Extract Button | Search Bar 오른쪽 | 선택된 곡을 LLM 분석 후 3D에 추가 |
| Search Results Panel | 좌측 | iTunes 검색 후보 리스트 |
| 3D Cluster View | 중앙 | 곡들의 감성 좌표 시각화 영역 |
| Analysis Axes Panel | 우측 | 분석 축 on/off 토글 |
| Share Panel / Button | 우하단 | 현재 클러스터 저장 및 공유 URL 생성 |
| Star Background | 전체 배경 | 검은 우주 배경 + 고정된 흰 점 + 미세한 깜빡임 |

---

## 3. Visual Direction

### 분위기

- 검은 우주 배경
- 흰 별점들이 화면 전체에 고정 배치
- 별은 위치가 움직이지 않고, opacity 또는 brightness만 부드럽게 변화
- 3D 곡 노드는 별/행성/글로우 포인트처럼 표현
- 전체 UI는 glassmorphism 스타일의 반투명 패널
- 포인트 컬러는 보라색/청록색/노란색 계열 네온

### 컬러 토큰

```css
:root {
  --color-bg: #02040a;
  --color-panel: rgba(12, 18, 28, 0.72);
  --color-panel-border: rgba(255, 255, 255, 0.10);
  --color-text-primary: #f7f8ff;
  --color-text-secondary: #a9b0c3;
  --color-accent-purple: #7c4dff;
  --color-accent-cyan: #34e5d6;
  --color-accent-yellow: #ffd84a;
  --color-accent-pink: #ff6ba8;
  --color-danger: #ff5570;
}
```

### 폰트

- 기본: `Inter`, `Pretendard`, `system-ui`, `sans-serif`
- 로고: 굵은 sans-serif, letter spacing 약간 좁게

---

## 4. 주요 컴포넌트 명세

## 4.1 App Shell

### 요구사항

- 전체 화면은 `100vw × 100vh` 고정형 대시보드로 구성한다.
- 배경은 `StarfieldBackground` 컴포넌트로 분리한다.
- UI 패널은 배경 위에 overlay된다.
- 3D canvas는 중앙 전체 영역을 차지하되, 좌우 패널과 겹치지 않게 safe area를 둔다.

### 컴포넌트 예시

```tsx
<App>
  <StarfieldBackground />
  <TopBar />
  <SearchResultsPanel />
  <ClusterScene />
  <AnalysisAxesPanel />
  <SharePanel />
</App>
```

---

## 4.2 TopBar

### 위치

- 좌상단: `SoundCluster`
- 상단 중앙: Search Bar
- Search Bar 오른쪽: Extract Button

### UI

```text
SoundCluster                         [ Search by song title or artist... 🔍 ] [ ✨ Extract ]
```

### 동작

1. 사용자가 검색어 입력
2. debounce 후 서버 또는 클라이언트에서 iTunes 검색 호출
3. 결과를 좌측 `SearchResultsPanel`에 표시
4. 사용자가 결과 하나를 선택
5. `Extract` 버튼 활성화
6. 클릭 시 LLM 분석 요청 시작

### 상태

| 상태 | UI |
|---|---|
| 검색어 없음 | placeholder 표시 |
| 검색 중 | input 오른쪽 spinner |
| 결과 있음 | 좌측 패널에 후보 표시 |
| 곡 선택됨 | Extract 버튼 활성화 |
| LLM 분석 중 | Extract 버튼에 loading state |
| 분석 실패 | toast 또는 inline error 표시 |

---

## 4.3 SearchResultsPanel

### 위치

- 좌측 고정
- 상단에서 약간 내려온 위치
- 너비 약 `280px ~ 340px`

### 표시 정보

각 검색 결과 item:

- 앨범 커버 썸네일
- 곡명
- 아티스트명
- 앨범명 또는 발매연도 optional
- `+` 버튼 또는 선택 상태 표시

### 예시

```text
Search Results                       12
------------------------------------------------
[cover]  Dandelions
         Ruth B.                         [+]

[cover]  Yellow
         Coldplay                        [+]

[cover]  Photograph
         Ed Sheeran                      [+]
```

### 동작

- 리스트 item 클릭 시 selected 상태가 된다.
- 이미 3D에 추가된 곡은 `Added` 상태로 표시한다.
- 결과가 많으면 내부 스크롤.
- 검색 결과가 없으면 empty state:

```text
No tracks found.
Try another song title or artist.
```

---

## 4.4 ClusterScene

### 핵심 역할

곡별 감성 벡터를 3D 좌표로 변환해 시각화한다.

### 배치

- 중앙 전체
- WebGL canvas 사용 권장
- 사용자는 마우스 드래그로 회전 가능
- 마우스 휠로 zoom 가능
- 곡 node hover 시 label 표시

### 인터랙션

| 인터랙션 | 동작 |
|---|---|
| Drag | 3D 클러스터 회전 |
| Wheel | zoom in/out |
| Hover node | 곡명, 아티스트, 감성값 tooltip 표시 |
| Click node | 상세 패널 또는 tooltip 고정 |
| Extract 완료 | 새 곡 node가 `pop-in` 애니메이션으로 등장 |

### 시각 요소

- 3D 축 라인
- 축 label
- 곡 node
- 곡 간 거리감을 보여주는 faint grid / bounding box
- 선택된 곡은 더 큰 glow
- 동일 아티스트 또는 비슷한 감성값은 가까운 위치에 배치

### 좌표 변환 예시

기본적으로 3개의 활성 축을 `x, y, z`에 매핑한다.

```ts
const x = normalizeAxisValue(song.axes.brightness);
const y = normalizeAxisValue(song.axes.energy);
const z = normalizeAxisValue(song.axes.melancholy);
```

좌표 범위는 `0 ~ 1` 값을 `-1 ~ 1` 또는 `-clusterRadius ~ +clusterRadius`로 변환한다.

```ts
function toSceneCoord(value: number, radius = 5) {
  return (value - 0.5) * 2 * radius;
}
```

### Pop-in 애니메이션

Extract 완료 후 node 추가 시:

1. scale `0 → 1.2 → 1.0`
2. opacity `0 → 1`
3. point light 또는 glow가 순간적으로 강해졌다가 안정화
4. label이 짧게 fade-in

---

## 4.5 AnalysisAxesPanel

### 위치

- 우측 고정
- 너비 약 `260px ~ 320px`

### 목적

LLM이 추출하는 감성/음악 분석 축을 켜고 끌 수 있다.

### 기본 축 예시

| Axis Key | Label | 설명 | 기본값 |
|---|---|---|---:|
| `energy` | Energy | 강도, 추진력, 역동성 | on |
| `melancholy` | Melancholy | 슬픔, 쓸쓸함, 정서적 깊이 | on |
| `brightness` | Brightness | 밝음, 따뜻함, 긍정성 | on |
| `danceability` | Danceability | 리듬감, 그루브 | off |
| `acousticness` | Acousticness | 어쿠스틱/전자음악 성향 | off |
| `instrumentalness` | Instrumentalness | 보컬 중심/연주 중심 | off |

### UI 예시

```text
Analysis Axes
------------------------------------------------
⚡ Energy          [on]
💧 Melancholy      [on]
☀ Brightness      [on]
〰 Danceability    [off]
🎸 Acousticness    [off]
♫ Instrumentalness[off]

[ Reset Axes ]
```

### 동작

- on/off 변경 시 3D 좌표계가 재계산된다.
- 3개 이상의 축이 켜져 있으면:
  - 기본 3D 좌표는 대표 3개 축 사용
  - 나머지 축은 node color, size, glow intensity 등으로 매핑 가능
- 3개 미만 축이 켜져 있으면:
  - 1D/2D 모드로 축소하거나
  - 비활성 축은 중앙값 `0.5`로 처리

---

## 4.6 SharePanel

### 위치

- 우하단 고정

### 목적

현재 클러스터 상태를 저장하고 공유 URL을 생성한다.

### UI 예시

```text
Share Your Cluster
Your cluster is ready to share.
[ https://soundcluster.app/c/9f8a2b      copy ]
[ Share ]
```

### 동작

1. 사용자가 Share 클릭
2. 현재 cluster state를 서버에 저장
3. 서버가 `clusterId` 반환
4. URL 생성
5. input에 URL 표시
6. copy 버튼으로 클립보드 복사

### 저장 데이터

- 추가된 곡 목록
- 각 곡의 감성 축 값
- 활성화된 축 설정
- 카메라 위치 optional
- 생성 시간

---

## 5. Background: Starfield

### 요구사항

- 검은 배경
- 흰 점들이 고정된 위치에 분포
- 점들이 이동하지 않는다.
- 점들의 밝기만 미세하게 변한다.
- 성능을 위해 CSS radial-gradient 또는 Canvas 사용 가능

### CSS 기반 예시

```css
.starfield {
  position: fixed;
  inset: 0;
  background: #02040a;
  overflow: hidden;
  z-index: 0;
}

.star {
  position: absolute;
  width: 1px;
  height: 1px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  animation: twinkle 2.8s ease-in-out infinite alternate;
}

@keyframes twinkle {
  from {
    opacity: 0.35;
    filter: brightness(0.8);
  }
  to {
    opacity: 1;
    filter: brightness(1.5);
  }
}
```

---

## 6. 데이터 모델

## 6.1 Search Result

```ts
export interface ITunesTrackResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  releaseDate?: string;
  primaryGenreName?: string;
}
```

## 6.2 Extracted Song Point

```ts
export interface SongPoint {
  id: string;
  source: 'itunes';
  trackId: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  artworkUrl?: string;
  lyrics?: string;
  axes: EmotionAxes;
  position: {
    x: number;
    y: number;
    z: number;
  };
  createdAt: string;
}
```

## 6.3 Emotion Axes

```ts
export interface EmotionAxes {
  energy: number;
  melancholy: number;
  brightness: number;
  danceability?: number;
  acousticness?: number;
  instrumentalness?: number;
  romanticness?: number;
  aggression?: number;
  nostalgia?: number;
}
```

각 값은 반드시 `0.0 ~ 1.0` 범위여야 한다.

## 6.4 Axis Config

```ts
export interface AxisConfig {
  key: keyof EmotionAxes;
  label: string;
  description: string;
  enabled: boolean;
  color: string;
}
```

## 6.5 Shared Cluster

```ts
export interface SharedCluster {
  id: string;
  name?: string;
  songs: SongPoint[];
  axes: AxisConfig[];
  camera?: {
    position: [number, number, number];
    rotation: [number, number, number];
    zoom: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. API Flow

## 7.1 Search Flow

```text
User input
  ↓
GET /api/tracks/search?q={query}
  ↓
Server calls iTunes Search API
  ↓
Server normalizes result shape
  ↓
Client renders SearchResultsPanel
```

### Endpoint 예시

```http
GET /api/tracks/search?q=yellow coldplay
```

### Response 예시

```json
{
  "results": [
    {
      "trackId": 12345,
      "trackName": "Yellow",
      "artistName": "Coldplay",
      "collectionName": "Parachutes",
      "artworkUrl100": "https://...",
      "previewUrl": "https://...",
      "primaryGenreName": "Alternative"
    }
  ]
}
```

---

## 7.2 Extract Flow

```text
Selected track
  ↓
POST /api/tracks/extract
  ↓
Server fetches lyrics if available
  ↓
Server calls LLM API
  ↓
LLM returns axis scores 0~1
  ↓
Server validates and clamps values
  ↓
Client adds node to ClusterScene with pop animation
```

### Endpoint 예시

```http
POST /api/tracks/extract
Content-Type: application/json
```

```json
{
  "trackId": 12345,
  "trackName": "Yellow",
  "artistName": "Coldplay",
  "albumName": "Parachutes",
  "artworkUrl": "https://..."
}
```

### Response 예시

```json
{
  "song": {
    "id": "song_abc123",
    "source": "itunes",
    "trackId": 12345,
    "trackName": "Yellow",
    "artistName": "Coldplay",
    "albumName": "Parachutes",
    "artworkUrl": "https://...",
    "axes": {
      "energy": 0.62,
      "melancholy": 0.48,
      "brightness": 0.72,
      "danceability": 0.31,
      "acousticness": 0.57,
      "instrumentalness": 0.08
    },
    "position": {
      "x": 2.2,
      "y": 1.2,
      "z": -0.2
    },
    "createdAt": "2026-06-08T00:00:00.000Z"
  }
}
```

---

## 7.3 Share Flow

```text
Client current cluster state
  ↓
POST /api/clusters
  ↓
DB save
  ↓
Return clusterId
  ↓
Client shows share URL
```

### Endpoint 예시

```http
POST /api/clusters
```

```json
{
  "songs": [],
  "axes": [],
  "camera": {
    "position": [0, 0, 8],
    "rotation": [0, 0, 0],
    "zoom": 1
  }
}
```

### Response 예시

```json
{
  "clusterId": "9f8a2b",
  "url": "https://soundcluster.app/c/9f8a2b"
}
```

---

## 8. LLM Extraction Prompt Contract

서버에서 LLM에 전달할 때는 응답 포맷을 엄격하게 JSON으로 제한한다.

### Prompt 목적

- 곡명, 아티스트, 앨범명, 장르, 가사 정보를 기반으로 감성 축 점수 추출
- 각 점수는 `0.0 ~ 1.0`
- 불확실하면 `0.5`에 가깝게 반환
- 설명 문장 없이 JSON만 반환

### 응답 스키마

```json
{
  "energy": 0.0,
  "melancholy": 0.0,
  "brightness": 0.0,
  "danceability": 0.0,
  "acousticness": 0.0,
  "instrumentalness": 0.0,
  "confidence": 0.0
}
```

### 서버 검증 규칙

- 모든 값은 number인지 확인
- 누락 값은 `0.5`로 대체
- `0` 미만은 `0`, `1` 초과는 `1`로 clamp
- JSON parse 실패 시 retry 또는 fallback 처리

---

## 9. Suggested Frontend Component Structure

```text
src/
  components/
    layout/
      AppShell.tsx
      TopBar.tsx
    background/
      StarfieldBackground.tsx
    search/
      SearchBar.tsx
      SearchResultsPanel.tsx
      SearchResultItem.tsx
    cluster/
      ClusterScene.tsx
      SongNode.tsx
      AxisLines.tsx
      SongTooltip.tsx
    axes/
      AnalysisAxesPanel.tsx
      AxisToggle.tsx
    share/
      SharePanel.tsx
  hooks/
    useTrackSearch.ts
    useExtractTrack.ts
    useClusterState.ts
    useShareCluster.ts
  types/
    track.ts
    cluster.ts
    axes.ts
  utils/
    coordinate.ts
    clamp.ts
```

---

## 10. Suggested Backend Structure

```text
server/
  src/
    config/
      db.ts
      env.ts
    routes/
      track.routes.ts
      cluster.routes.ts
    controllers/
      track.controller.ts
      cluster.controller.ts
    services/
      itunes.service.ts
      lyrics.service.ts
      llm.service.ts
      cluster.service.ts
    repositories/
      cluster.repository.ts
    types/
      track.ts
      cluster.ts
    index.ts
  .env
```

---

## 11. MySQL Tables Draft

### clusters

```sql
CREATE TABLE clusters (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255),
  axes_json JSON NOT NULL,
  camera_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### cluster_songs

```sql
CREATE TABLE cluster_songs (
  id VARCHAR(32) PRIMARY KEY,
  cluster_id VARCHAR(32) NOT NULL,
  source VARCHAR(32) NOT NULL,
  track_id BIGINT NOT NULL,
  track_name VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  album_name VARCHAR(255),
  artwork_url TEXT,
  axes_json JSON NOT NULL,
  position_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE
);
```

---

## 12. UX Detail Requirements

### Search

- debounce: 300ms 권장
- Enter 입력 시 첫 번째 결과 선택 또는 검색 실행
- 검색 중에는 skeleton row 표시
- 검색어가 2자 미만이면 API 호출하지 않기

### Extract

- 선택된 곡이 없으면 비활성화
- 클릭 후 중복 클릭 방지
- 진행 중 버튼 텍스트:

```text
Extracting...
```

- 완료 시:

```text
Added to cluster
```

### Cluster View

- 초기 상태에는 안내 문구 표시:

```text
Search a song and extract its emotional coordinates.
```

- 첫 곡 추가 시 중앙 근처에서 등장
- 두 번째 곡부터 거리관계가 명확히 보이도록 카메라 자동 조정 optional

### Share

- 곡이 1개 이상 있을 때 활성화
- Share 성공 후 URL input 표시
- Copy 클릭 시:

```text
Copied!
```

---

## 13. Accessibility

- 모든 버튼에 `aria-label` 제공
- toggle은 `role="switch"` 사용
- 색상만으로 상태 구분하지 말고 label도 함께 제공
- Search input은 keyboard focus ring 명확히 표시
- 3D canvas 조작 힌트 제공:

```text
Drag to rotate. Scroll to zoom.
```

---

## 14. Performance Notes

- Starfield는 DOM element를 과도하게 만들지 않도록 주의한다.
- 3D node 수가 많아지면 instancing 고려.
- LLM 분석 결과는 서버 DB 또는 캐시에 저장해 같은 곡 재분석을 줄인다.
- artwork 이미지는 lazy loading.
- 검색 API는 debounce와 request cancellation 적용.

---

## 15. Security Notes

- LLM API key, lyrics API key, DB password는 절대 frontend에 노출하지 않는다.
- `.env`는 server 쪽에만 둔다.
- Share URL은 추측이 어렵도록 random id 사용.
- 저장된 lyrics 전문을 DB에 보관할지 여부는 신중히 결정한다.
- LLM 응답은 반드시 서버에서 schema validation 후 client에 전달한다.

---

## 16. Acceptance Criteria

### UI

- [ ] 좌상단에 `SoundCluster` 로고가 고정 표시된다.
- [ ] 전체 배경은 검은 우주 배경이며 흰 별점이 고정되어 있다.
- [ ] 별점은 위치 이동 없이 밝기만 부드럽게 깜빡인다.
- [ ] 상단 중앙에 곡명/아티스트 검색창이 있다.
- [ ] 검색창 오른쪽에 `Extract` 버튼이 있다.
- [ ] 좌측에 검색 결과 패널이 표시된다.
- [ ] 중앙에 3D 렌더링 영역이 있다.
- [ ] 3D 렌더링 영역은 마우스 드래그로 회전 가능하다.
- [ ] 우측에 분석 축 on/off 패널이 있다.
- [ ] 우하단에 Share 패널 또는 버튼이 있다.

### 기능

- [ ] 검색어 입력 시 iTunes 기반 검색 결과가 표시된다.
- [ ] 검색 결과에서 곡을 선택할 수 있다.
- [ ] Extract 클릭 시 서버가 LLM 분석을 요청한다.
- [ ] LLM 분석 결과는 `0.0 ~ 1.0` 범위의 감성 축 값으로 정규화된다.
- [ ] 분석 완료된 곡은 3D 공간에 pop-in 애니메이션으로 추가된다.
- [ ] 축 on/off 변경 시 시각화가 갱신된다.
- [ ] Share 클릭 시 저장 URL이 생성된다.

---

## 17. Implementation Priority

1. 기본 레이아웃 + 우주 배경
2. 검색창 + iTunes 검색 결과 패널
3. Extract API 연결 + mock LLM response
4. 3D scene에 song node 추가
5. 축 toggle에 따른 좌표 재계산
6. Share URL 저장/복원
7. 애니메이션/tooltip/디테일 polish

---

## 18. Codex Task Prompt

아래 요구사항대로 SoundCluster의 프론트엔드 UI와 필요한 API 연결부를 구현해줘.

- 프로젝트명은 좌상단에 `SoundCluster`로 표시한다.
- 전체 배경은 검은 우주 배경으로 만들고, 흰 별점들은 고정된 위치에서 opacity/brightness만 깜빡이게 한다.
- 상단 중앙에 곡명 또는 아티스트 검색창을 둔다.
- 검색 결과는 좌측 패널에 표시한다.
- 검색 결과에서 곡 하나를 선택한 뒤 `Extract` 버튼을 누르면 `/api/tracks/extract`를 호출한다.
- 추출 결과의 감성 축 값은 `0~1` 범위로 받아서 3D 좌표로 변환한다.
- 중앙 3D 영역에는 곡들이 glow point/node로 표시되어야 한다.
- 새 곡이 추가될 때는 pop-in 애니메이션을 적용한다.
- 3D 영역은 마우스 드래그 회전과 휠 zoom을 지원한다.
- 우측 패널에는 분석 축 on/off toggle을 둔다.
- 우하단에는 Share 버튼과 생성된 URL 표시 영역을 둔다.
- 전체 스타일은 dark sci-fi, glassmorphism, neon accent 기반으로 구현한다.
