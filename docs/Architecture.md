# SoundCluster Architecture

이 문서는 SoundCluster의 기준 디렉토리 구조와 각 레이어의 책임을 정의합니다. 새 파일을 만들거나 기존 파일을 이동할 때는 이 구조를 우선합니다.

```text
soundcluster/
├── client/                              # Frontend Layer: Vite + React + TS + R3F
│   ├── public/                          # 정적 에셋
│   └── src/
│       ├── canvas/                      # 3D WebGL / React Three Fiber 컴포넌트
│       │   ├── GridBase.tsx             # 바닥 그리드
│       │   ├── StarsCanvas.tsx          # R3F 메인 캔버스와 카메라 컨트롤
│       │   ├── StarNode.tsx             # 개별 음악 노드
│       │   └── StarNodeCollection.tsx   # 음악 노드 그룹 관리
│       ├── components/                  # 2D HUD 및 일반 React 컴포넌트
│       │   ├── ControlPanel.tsx         # 5차원 감성 축 제어
│       │   ├── SearchBar.tsx            # 곡과 아티스트 검색 입력
│       │   ├── ShareModal.tsx           # 공유 링크 모달
│       │   └── StreamingLogViewer.tsx   # SSE 분석 상태 로그
│       ├── context/                     # 전역 상태 컨텍스트
│       ├── hooks/                       # 클라이언트 커스텀 훅
│       ├── styles/                      # CSS Modules 및 디자인 토큰
│       ├── App.tsx                      # 앱 루트
│       └── main.tsx                     # Vite 진입점
│
├── server/                              # Backend Layer: Express
│   └── src/
│       ├── config/                      # 환경 설정, DB, Gemini 클라이언트
│       ├── controllers/                 # 요청 처리와 스트리밍 제어
│       ├── routes/                      # API 라우팅
│       └── app.ts                       # Express 서버 진입점
│
├── shared/                              # Shared Layer
│   ├── constants/                       # 클라이언트와 서버가 공유하는 상수
│   ├── types/                           # 공통 타입
│   └── utils/                           # 순수 유틸리티
│
├── docs/                                # 프로젝트 문서
│   ├── agents.md                        # AI 에이전트 작업 지침
│   ├── Architecture.md                  # 아키텍처 기준 문서
│   ├── checklist.md                     # 구현 체크리스트
│   └── prompt-guideline.md              # Gemini 분석 프롬프트 명세
│
├── .gitignore
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## Layer Responsibilities

### `client/`

사용자 인터페이스와 3D 시각화를 담당합니다.

- 서버와 통신해 음악 분석 스트림을 수신합니다.
- 수신한 감성 벡터를 상태에 반영합니다.
- 5차원 데이터를 3D 좌표로 변환해 R3F 캔버스에 렌더링합니다.
- UI 스타일은 CSS Modules로 격리합니다.

### `server/`

외부 API 연동, 분석 파이프라인, 캐싱, SSE 스트리밍을 담당합니다.

- Spotify와 Gemini API Key를 서버에서만 관리합니다.
- Gemini 응답을 JSON으로 검증합니다.
- MySQL 캐시를 조회하고 저장합니다.
- 분석 진행 상태와 결과를 SSE로 클라이언트에 전달합니다.

### `shared/`

클라이언트와 서버가 공유하는 계약을 보관합니다.

- 감성 벡터, 음악 메타데이터, SSE 이벤트 타입을 정의합니다.
- API 경로와 고정 상수를 관리합니다.
- 순수 계산 함수와 데이터 정규화 유틸을 제공합니다.

### `docs/`

프로젝트 의사결정과 에이전트 작업 기준을 보관합니다.

- `agents.md`: Codex와 Gemini 등 AI 에이전트가 따를 작업 지침
- `Architecture.md`: 디렉토리와 레이어 책임
- `checklist.md`: 구현 순서와 이슈 단위 작업
- `prompt-guideline.md`: Gemini 분석 프롬프트와 JSON 출력 계약

---

## File Placement Rules

- 화면에 직접 렌더링되는 React 컴포넌트는 `client/src/components/`에 둡니다.
- R3F 또는 Three.js 렌더링 컴포넌트는 `client/src/canvas/`에 둡니다.
- 클라이언트 전용 API 구독 로직은 `client/src/hooks/`에 둡니다.
- 서버 라우트는 `server/src/routes/`, 요청 처리 로직은 `server/src/controllers/`에 둡니다.
- 환경 변수, DB 연결, Gemini 클라이언트 초기화는 `server/src/config/`에 둡니다.
- 양쪽에서 공유하는 타입과 상수는 `shared/`에 둡니다.

새 레이어나 최상위 디렉토리가 필요하면 기존 구조로 해결할 수 없는 이유를 먼저 확인합니다.
