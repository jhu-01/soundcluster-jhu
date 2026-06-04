soundcluster/
├── client/                          # Frontend Layer (Vite + TS + R3F)
│   ├── public/                      # 3D 텍스처, 오디오 등 정적 에셋 스토리지
│   └── src/
│       ├── canvas/                  # 3D WebGL (React Three Fiber) 컴포넌트 스코프
│       │   ├── GridBase.tsx         # 바닥 네온 가이드라인 격자
│       │   ├── StarsCanvas.tsx      # R3F 배경 및 카메라 컨트롤 메인 캔버스
│       │   ├── StarNode.tsx         # 개별 곡 오브젝트 (매 프레임 lerp 감속 적용)
│       │   └── StarNodeCollection.tsx # Gemini 수집 데이터 기반 별 노드 그룹 관리
│       ├── components/              # Foreground HUD 2D HTML 컴포넌트 스코프
│       │   ├── ControlPanel.tsx     # MDS 차원 축소 감성 축 제어 슬라이더
│       │   ├── SearchBar.tsx        # 곡 및 아티스트 입력 검색창
│       │   ├── ShareModal.tsx       # Short URL (NanoID) 링크 복사 모달
│       │   └── StreamingLogViewer.tsx # SSE 분석 상태 및 수신 실시간 로그 뷰어
│       ├── context/                 # 전역 상태 관리 컨텍스트 레이어
│       ├── hooks/                   # 클라이언트 사이드 커스텀 훅 (API fetch 제어)
│       ├── styles/                  # CSS Modules 전용 디자인 토큰 스타일 규칙
│       ├── App.tsx                  # 클라이언트 라우팅 분기 컨트롤러
│       └── main.tsx                 # 앱 진입점 (Vite DOM Mount)
│
├── server/                          # Backend Layer (Express.js)
│   └── src/
│       ├── config/                  # 외부 인프라 연동 환경 설정 (db.ts, gemini.ts)
│       ├── controllers/             # Spotify 데이터 바인딩, SSE 스트리밍 제어 컨트롤러
│       ├── routes/                  # API 엔드포인트 라우팅 레이어
│       └── app.ts                   # Express 서버 진입점 및 미들웨어 세팅
│
├── shared/                          # Common Shared Layer (중복 제거 및 동기화)
│   ├── constants/                   # 백엔드 경로, 포트 번호, 상용 URL 고정 상수 (const화)
│   ├── types/                       # 5차원 감성 벡터, 스포티파이 메타데이터 Strict Interface
│   └── utils/                       # 순수 함수 기반 유틸리티 (가사 파싱, 데이터 정규화 연산)
│
├── docs/                            # 프로젝트 문서 저장소
│   ├── gemini.md                    # AI 에이전트 자율 가드레일 지침서
│   └── architecture.md              # 본 시스템 구조 명세 문서 (현재 파일)
│
├── .gitignore                       # node_modules 및 .env 등 형상 관리 제외 설정
└── README.md                        # 프로젝트 전반 서술 메인 파일