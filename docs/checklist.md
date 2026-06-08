- [x] #2 [Env] Node.js 환경 구축 및 패키지 매니저(pnpm) 초기화
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
로컬 컴퓨터에 아무런 개발 도구가 없는 상태에서 출발하여, 프로젝트 구동을 위한 최신 Node.js 환경을 세팅하고 고속 패키지 매니저인 pnpm 인프라를 구축합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] Node.js 공식 LTS 버전(v22 이상) 설치 및 터미널 검증 (`node -v`)
- [x] Corepack 활성화 또는 글로벌 명령어로 pnpm v9 이상 설치 (`npm i -g pnpm`)
- [x] 프로젝트 루트 디렉토리에서 `pnpm init` 실행하여 기본 `package.json` 생성
- [x] `.gitignore` 파일 생성하여 `node_modules` 및 환경변수 보안 격리 설정

  </details>
- [x] #3 [Feat] Express 기본 서버 구동 및 헬스체크 엔드포인트 구현
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
Express와 TypeScript를 개발 의존성으로 설치하고, 서버를 켰을 때 브라우저에서 접속이 잘 되는지 확인하는 최소한의 뼈대를 만듭니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `express`, `typescript`, `@types/node`, `@types/express` 패키지 설치
- [x] `tsconfig.json` 초기화 및 빌드/실행 환경 설정
- [x] `server/src/app.ts` 파일 생성 및 포트 기본 바인딩
- [x] `GET /api/health` 엔드포인트 테스트 (브라우저 접속 시 `{"status": "ok"}` 반환 확인)

  </details>
- [x] #4 [Env] MySQL 로컬 설치 및 커넥션 풀(Connection Pool) 연결
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
로컬 컴퓨터에 데이터베이스 엔진을 설치하고, Express 서버가 구동될 때 DB와 끊어지지 않고 안전하게 통신할 수 있도록 커넥션 풀 설정을 완료합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] MySQL Community Server 로컬 설치 및 root 비밀번호 세팅
- [x] `dotenv` 패키지 설치 및 보안을 위한 `server/.env` 파일 분리
- [x] `mysql2` 라이브러리 설치 및 `server/src/config/db.ts` 커넥션 풀 모듈 구현
- [x] 서버 구동 시 DB 연결 성공 메시지(`Database Connected!`) 로그 출력 검증

  </details>
- [x] #5 [Feat] Gemini SDK 연동 및 단순 텍스트 프롬프트 테스트
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
구글 인공지능 API를 사용하기 위한 SDK 설정을 마치고, 가볍게 질문을 던졌을 때 인공지능이 대답을 잘 받아오는지 파이프라인 작동 여부만 검증합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] Google AI Studio에서 API Key 발급 및 `.env` 파일에 안전하게 등록
- [x] 구글 공식 `@google/genai` 패키지 설치
- [x] `server/src/config/gemini.ts` 공통 클라이언트 인스턴스 생성 로직 구현
- [x] 콘솔에 AI의 답변이 정상 출력되는지 임시 라우터로 테스트

  </details>
- [x] #6 [Feat] agents.md 지침 바인딩 및 5차원 JSON 출력 강제화
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
앞서 설계한 `docs/agents.md`의 에이전트 운영 가드레일과 `docs/prompt-guideline.md`의 System Instruction을 주입하고, 대답 형식을 오직 Raw JSON 객체 하나로만 고정하도록 하드웨어 가드레일을 칩니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `docs/agents.md`의 운영 수칙과 `docs/prompt-guideline.md`의 `[Role & Context]`, `[Constraints]` 문자열을 시스템 프롬프트 상수로 추출
- [x] `responseMimeType: "application/json"` 옵션 활성화
- [x] 곡명, 아티스트, 가사를 더미 데이터로 던졌을 때 0.0 ~ 1.0 범위의 5차원 수치가 포함된 깔끔한 JSON 객체가 반환되는지 검증

  </details>
- [x] #7 [Feat] Vite + React + TS 초기화 및 CSS Modules 세팅
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
Vite를 이용해 엄격한 타입스크립트 기반의 React SPA 환경을 빌드하고, 외부 UI 프레임워크 없이 자립하기 위한 CSS Modules 구조를 세팅합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `client/` 디렉토리 생성 후 `pnpm create vite . --template react-ts`로 초기화
- [x] 글로벌 디자인 토큰 설정을 위한 전역 CSS 파일 구조화
- [x] 컴포넌트별 격리된 스타일 사수를 위한 `.module.css` 네이밍 컨벤션 적용 테스트

  </details>
- [x] #8 [Feat] Three.js 및 R3F(React Three Fiber) 기본 캔버스 구동
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
3D 그래픽스 연산을 위해 R3F 패키지를 설치하고, 마우스로 이리저리 돌려볼 수 있는 가상의 3D 공간과 바닥 격자판(Grid)을 구현합니다.
## 📋 세부 작업 태스크 (Todo)
- [x] `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei` 패키지 설치
- [x] `client/src/canvas/StarsCanvas.tsx` 기본 메인 캔버스 컴포넌트 생성
- [x] 마우스 회전/확대를 위한 `<OrbitControls />` 컴포넌트 이식 및 구동 확인
- [x] 공간 감각을 주기 위한 바닥면 네온 그리드(`GridBase.tsx`) 가이드라인 레이아웃 배치

  </details>
- [x] #9 [Feat] 백엔드 SSE(Server-Sent Events) 스트리밍 API 구현
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
Gemini의 AI 분석 작업이 진행되는 동안 클라이언트가 블로킹(대기)되지 않도록, 서버에서 클라이언트로 실시간 상태를 밀어주는 SSE(Server-Sent Events) 단방향 스트리밍 채널을 구축합니다.
## 📋 세부 작업 태스크 (Todo)
- [x] `server/src/routes/analyze.ts` 라우터에 SSE 전용 헤더(`text/event-stream`) 설정
- [x] 분석 단계별 상태 메세지 구조 설계 (`status: "fetching" | "analyzing" | "done"`)
- [x] 더미 데이터를 활용해 브라우저 `EventSource`로 실시간 데이터가 뚝뚝 떨어지는지 스트리밍 검증

  </details>
- [x] #10 [Feat] 데이터베이스 캐싱 계층(Caching Layer) 및 조회 로직 구현
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
동일한 곡에 대한 중복 분석 요청 시, 비싼 Gemini API를 다시 호출하지 않고 MySQL DB에 적재된 기존 5차원 감성 벡터를 즉시 반환하는 캐싱 로직을 구현합니다.
## 📋 세부 작업 태스크 (Todo)
- [x] 곡명(Title)과 아티스트(Artist) 기준의 고유 해시값 또는 복합 키 조회 쿼리 구현
- [x] `IF EXISTS` 조건문을 활용해 캐시 데이터가 있으면 즉시 SSE로 데이터 쏘고 연결 종료(`close`)
- [x] 캐시 미스(Cache Miss) 발생 시에만 Gemini 파이프라인을 트리거하고 연산 결과를 MySQL에 자동 `INSERT`

  </details>
- [x] #11 [Feat] EventSource 기반 클라이언트 실시간 데이터 수신 및 상태 관리
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
프론트엔드에서 서버의 SSE 엔드포인트를 구독(`EventSource`)하고, 실시간으로 들어오는 분석 진행 상태 및 최종 5차원 데이터를 안전하게 담을 리액트 Context 또는 전역 상태를 구축합니다.
## 📋 세부 작업 태스크 (Todo)
- [x] `client/src/hooks/useEmotionStream.ts` 커스텀 훅 구현
- [x] 연결 시작, 데이터 수신, 에러 발생, 연결 종료(`stream.close()`) 예외 처리 핸들링
- [x] 최종 수신된 5차원 JSON 데이터를 상태(State)에 바인딩하여 렌더링 준비 완료

  </details>
- [x] #12 [Feat] 5차원 데이터 ➔ 3D 공간 좌표 변환 (MDS 알고리즘 구현)
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
Gemini가 반환한 벡터 수치(0.0 ~ 1.0)를 3D 우주 공간 상의 가시적인 점(X, Y, Z 물리 좌표)으로 매핑하기 위한 가중치 기반 다차원 축소 알고리즘 함수를 구현합니다.
## 📋 세부 작업 태스크 (Todo)
- [x] `client/src/utils/mds.ts` 다차원 매핑 유틸 함수 작성
- [x] 여러 축의 가중치를 받아 3차원 벡터(`THREE.Vector3`)로 변환하는 연산 가동
- [x] 좌표 변환 시 성단 형태로 예쁘게 모이도록 보정 상수(Scaling Factor) 미세 조정

  </details>
- [x] #13 [Feat] R3F 성단 노드 애니메이션 및 카메라 인스턴스 연동 (lerp)
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
변환된 X, Y, Z 좌표를 바탕으로 R3F 공간에 실제 아티스트 이름이 박힌 별 노드(`StarNode.tsx`)를 생성하고, 카메라가 해당 성단 위치로 부드럽게 이동하는 연출을 구현합니다.
## 📋 세부 작업 태스크 (Todo)
- [x] `useFrame` 훅과 `lerp` 함수를 활용해 별이 지정 좌표로 스무스하게 날아와 안착하는 애니메이션 구현
- [x] 새로운 별 노드 생성 시 R3F `state.camera`를 타겟 좌표로 부드럽게 다가 가도록 가속도 무빙 적용
- [x] 마우스 오버 시 별의 텍스처 색상이 네온 컬러로 하이라이트되는 인터랙션 추가

  </details>
- [x] #14 [Feat] 2D HUD 검색창 및 5축 감성 축 선택 UI 구현
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
3D 우주 공간 위에 오버레이될 2D 컨트롤 패널(HUD)을 CSS Modules로 디자인하고, 곡에 바인딩된 5차원 감성 값은 수정하지 않은 채 렌더링에 사용할 축만 on/off할 수 있도록 결합합니다.
## 📋 세부 작업 태스크 (Todo)
- [x] `client/src/components/SearchBar.tsx` 음악 검색 인풋창 구현 및 백엔드 SSE 트리거 바인딩
- [x] `client/src/components/ControlPanel.tsx` 5차원 축 on/off 토글 UI 배치
- [x] 사용자가 축을 켜고 끄면 선택된 축 조합만 기준으로 3D 공간상의 별들이 다시 배치되는 반응형 렌더링 구현
  </details>

---

## 추가 구현 체크리스트

아래 항목은 #2~#10 구현 이후 완전한 제품 흐름을 만들기 위한 추가 GitHub issue입니다.

- [x] #15 [Feat] EventSource 스트림 상태 훅 및 전역 분석 상태 연결
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
백엔드 `/api/analyze/stream`을 구독하는 클라이언트 훅과 상태 계층을 만들고, 진행 이벤트와 최종 분석 결과를 R3F 캔버스가 사용할 수 있는 형태로 보관합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `client/src/hooks/useEmotionStream.ts`에서 `EventSource` 연결/수신/에러/종료 처리
- [x] `client/src/context/AnalysisContext.tsx` 또는 동등한 상태 계층 생성
- [x] `AnalyzeStreamEvent`와 최종 `MusicAnalysisResponse`를 상태에 저장
- [x] 중복 연결 방지와 컴포넌트 unmount 시 `stream.close()` 처리

## ✅ 검증 방법
- [x] 백엔드: `corepack pnpm run server:build`
- [x] 프론트엔드: `corepack pnpm run build`
- [x] 스트림 시작/완료/재시작 시 현재 연결 가드와 `request`/`isActive` 상태가 누적 오류 없이 갱신되도록 확인

  </details>

- [x] #16 [Feat] 검색 입력값을 SSE 분석 query payload로 연결
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
현재 `/api/analyze/stream`은 `title`, `artist`, `lyrics` query를 받을 수 있으므로, FE 검색 입력과 가사 입력값을 EventSource URL로 안전하게 직렬화해 실제 분석 요청을 트리거합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `client/src/components/SearchBar.tsx`에서 곡명/아티스트/가사 입력 상태 관리
- [x] `URLSearchParams`로 EventSource URL 생성
- [x] 같은 곡명/아티스트 요청 시 DB cache hit가 즉시 반환되는지 FE에서 확인
- [x] 빈 입력, 긴 가사, 특수문자 입력에 대한 최소 validation 적용

## ✅ 검증 방법
- [x] `curl.exe -N "http://127.0.0.1:3001/api/analyze/stream?title=...&artist=..."`
- [x] 동일 입력 2회 요청 시 두 번째 요청이 cache hit `done` 이벤트로 즉시 완료되는지 확인

  </details>

- [x] #17 [Feat] 5차원 감성 벡터를 3D 좌표로 변환하는 매핑 유틸 구현
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
Gemini 결과의 `energy`, `valence`, `tempoDensity`, `spaceDepth`, `tension` 값을 실제 R3F 공간 좌표와 시각 속성으로 변환하는 순수 유틸리티를 구현합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `shared/utils/emotionToPoint.ts` 또는 `client/src/utils/mds.ts`에 순수 매핑 함수 작성
- [x] 5차원 값으로 `{ position, color, scale, intensity }` 생성
- [x] 목데이터와 실제 분석 결과가 같은 매핑 함수를 쓰도록 `StarsCanvas.tsx` 정리
- [x] 좌표 범위, 스케일링, 색상 매핑 상수 분리

## ✅ 검증 방법
- [x] `corepack pnpm run build`
- [x] `corepack pnpm run lint`
- [x] 여러 감성 벡터가 겹치지 않고 화면 중앙 주변에 안정적으로 분포하는지 확인

  </details>

- [x] #18 [Feat] SSE visual payload 기반 R3F 진행 애니메이션 연결
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
백엔드가 내려주는 `progress`, `visual.intensity`, `visual.activeNodeCount`, `visual.orbitSpeed`, `visual.color` 값을 R3F 캔버스에 연결해, LLM 분석 대기 시간 동안 별 노드가 단계적으로 밝아지고 움직이는 진행 애니메이션을 구현합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] 스트리밍 진행 중 `activeNodeCount`에 따라 노드가 순차 등장
- [x] `visual.intensity`를 emissive intensity와 bloom 후보 값에 반영
- [x] `visual.orbitSpeed`를 노드 그룹 회전 속도에 반영
- [x] `done` 수신 시 최종 분석 벡터 기반 위치로 부드럽게 안착

## ✅ 검증 방법
- [x] `corepack pnpm run build`
- [x] 분석 시작 후 노드가 단계적으로 나타나고 완료 시 최종 벡터 위치에 고정되도록 상태 연결 확인

  </details>

- [x] #19 [Feat] R3F 노드 컴포넌트 분리 및 인터랙션 구현
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
현재 `StarsCanvas.tsx` 안에 있는 노드 렌더링을 `StarNode.tsx`, `StarNodeCollection.tsx`로 분리하고, hover/click 인터랙션과 선택 상태를 구현합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `client/src/canvas/StarNode.tsx` 개별 별 노드 구현
- [x] `client/src/canvas/StarNodeCollection.tsx` 노드 목록 렌더링 구현
- [x] hover 시 크기/색상/밝기 변화
- [x] click 시 선택된 곡 정보를 HUD 또는 상세 패널로 전달할 수 있는 callback 추가

## ✅ 검증 방법
- [x] `corepack pnpm run build`
- [x] hover/click 선택 상태와 callback 연결 확인

  </details>

- [x] #20 [Feat] 분석 HUD와 5축 감성 축 선택 패널 완성
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
R3F 캔버스 위에 검색 입력, 분석 버튼, 진행률, 5축 감성 축 선택 패널, 최종 요약을 표시하는 HUD를 구현합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `client/src/components/SearchBar.tsx` 곡명/아티스트/가사 입력 UI 구현
- [x] `client/src/components/ControlPanel.tsx` 5축 축 선택 토글 구현
- [x] `client/src/components/StreamingLogViewer.tsx` 진행 상태를 압축적으로 표시
- [x] 최종 `generatedSummary`와 cache hit 여부를 사용자에게 표시

## ✅ 검증 방법
- [x] 모바일/데스크톱에서 HUD가 캔버스 조작을 과도하게 가리지 않는지 확인
- [x] 빈 입력/분석 중 중복 클릭/완료 후 재분석 플로우 확인

  </details>

- [x] #21 [Refactor] 분석 라우트 controller/service 계층 분리
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
`server/src/routes/analyze.ts`가 SSE 출력, request 파싱, cache 조회, Gemini 호출까지 함께 담당하고 있으므로, Architecture 기준에 맞게 controller/service 계층으로 분리합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `server/src/controllers/analyzeController.ts`로 SSE 요청 처리 이동
- [x] `server/src/services/analyzeService.ts`로 cache miss/hit와 Gemini 분석 흐름 이동
- [x] route 파일은 URL 바인딩만 담당하도록 축소
- [x] 기존 `/api/analyze/stream` 응답 계약 유지

## ✅ 검증 방법
- [x] `corepack pnpm run server:build`
- [x] `corepack pnpm run lint`
- [x] `curl.exe -N http://127.0.0.1:3001/api/analyze/stream`

  </details>

- [x] #22 [Feat] 분석 결과 영속 데이터 모델 확장
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
현재 `analysis_cache`는 JSON 캐시에 집중되어 있으므로, 검색/공유/재사용을 위해 트랙 메타데이터와 감성 벡터를 조회 가능한 컬럼 구조로 확장합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `tracks` 또는 확장된 `analysis_cache` 컬럼 설계
- [x] energy, valence, tempoDensity, spaceDepth, tension 컬럼 인덱싱 여부 검토
- [x] 기존 JSON 캐시와 새 컬럼 간 동기화 로직 추가
- [x] 동일 곡 분석 이력 조회 API 초안 구현

## ✅ 검증 방법
- [x] MySQL에서 테이블 schema 확인
- [x] 같은 곡 분석 후 벡터 컬럼과 JSON 값이 일치하는지 확인

  </details>

- [x] #23 [Feat] 공유 가능한 3D 성단 스냅샷 상태 구현
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
분석된 곡과 감성 벡터, 카메라 위치, 선택 노드 상태를 URL 또는 DB 기반 snapshot으로 저장해 다시 열 수 있게 합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] 공유 상태에 필요한 최소 데이터 구조 정의
- [x] `ShareModal.tsx` 구현
- [x] URL query 또는 백엔드 저장 방식 중 하나 선택
- [x] 공유 링크로 접속 시 같은 성단 위치와 선택 상태 재현

## ✅ 검증 방법
- [x] 공유 링크를 새 브라우저 탭에서 열어 동일한 3D 상태가 재현되는지 확인

  </details>

- [x] #24 [Test] 분석 파이프라인 최소 자동 테스트 추가
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
현재 검증은 수동 명령 위주이므로, 캐시 키 생성, Gemini JSON validation, SSE 이벤트 순서, 5D 좌표 매핑 같은 핵심 계약을 자동 테스트로 고정합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] 테스트 러너 선택 및 최소 설정
- [x] `createAnalysisCacheKey()`가 title/artist 대소문자와 공백을 정규화하는지 테스트
- [x] `parseMusicAnalysisResponse()`가 0.0 ~ 1.0 범위 밖 값을 거부하는지 테스트
- [x] SSE 이벤트 fixture가 `fetching -> analyzing -> done` 순서를 유지하는지 테스트
- [x] 5D 벡터가 안정적인 3D 좌표로 매핑되는지 테스트

## ✅ 검증 방법
- [x] `corepack pnpm run test`
- [x] `corepack pnpm run lint`

  </details>

- [x] #25 [Perf] R3F 렌더링 및 번들 크기 최적화
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
Three/R3F 도입 이후 production build에서 큰 chunk 경고가 발생하므로, 렌더링 성능과 초기 로딩 비용을 줄입니다.

## 📋 세부 작업 태스크 (Todo)
- [x] `StarsCanvas` lazy loading 또는 route-level code splitting 재적용
- [x] 반복 생성되는 Three 객체를 `useMemo`, `useRef`로 고정
- [x] 노드 수 증가 시 FPS 저하 여부 확인
- [x] 필요 시 instancing 적용 후보 검토

## ✅ 검증 방법
- [x] `corepack pnpm run build`에서 초기 chunk 크기 확인
- [x] 브라우저에서 50개 이상 노드 렌더링 시 조작감 확인

  </details>

- [x] #26 [Feat] iTunes Search API 기반 곡 메타데이터 조회 구현
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
곡명/가수 입력만으로 iTunes Search API에서 실제 곡 메타데이터를 조회해 곡명, 가수, 앨범 이미지를 확보하고, 이후 Gemini 분석 및 3D 노드 표시에서 동일한 메타데이터를 사용합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] iTunes Search API 서버 프록시 라우트 설계
- [x] 서버 측 iTunes track search API wrapper 구현
- [x] 곡명/가수 기반 track search API wrapper 구현
- [x] 검색 결과에서 title, artist, albumImageUrl, itunesTrackId 정규화
- [x] 프론트 검색 결과 또는 분석 요청 흐름에 iTunes 메타데이터 바인딩
- [x] 앨범 이미지가 있는 경우 노드/HUD/공유 snapshot에서 사용할 필드 구조 확장
- [x] iTunes 결과 없음 또는 요청 실패 fallback 처리

## ✅ 검증 방법
- [x] 실제 곡명/가수로 iTunes 검색 결과가 반환되는지 확인
- [x] 앨범 이미지 URL이 프론트에서 표시 가능한지 확인
- [x] iTunes 결과 없음/요청 실패 시 기존 수동 입력 흐름이 깨지지 않는지 확인
- [x] `corepack pnpm run lint`
- [x] `corepack pnpm run build`

  </details>

- [x] #27 [Perf] 공유 snapshot URL 압축 인코딩 구현
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
공유 링크의 `snapshot` query가 현재 JSON 전체를 base64url로 담아 URL이 과도하게 길어지므로, 같은 snapshot 복원 기능을 유지하면서 URL 길이를 줄이는 압축 인코딩을 구현합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] snapshot payload에서 반복 key를 줄이는 compact schema 설계
- [x] `version` 기반으로 기존 base64 JSON snapshot과 새 압축 snapshot을 모두 decode 가능하게 유지
- [x] 카메라, 선택 노드, 트랙 id/title/artist/emotion vector를 짧은 배열 구조로 직렬화
- [x] emotion float 값을 필요한 소수점 정밀도로 quantize해 URL 길이 절감
- [x] `createShareSnapshotUrl()`이 새 압축 encoder를 사용하도록 변경
- [x] 잘못된 snapshot query fallback 처리 유지

## ✅ 검증 방법
- [x] 같은 snapshot 기준 기존 URL 대비 길이 감소 확인
- [x] 압축 URL을 새 탭에서 열면 동일한 선택 노드/카메라/트랙 값이 복원되는지 확인
- [x] 기존 base64 JSON snapshot URL도 계속 복원되는지 확인
- [x] `corepack pnpm run test`
- [x] `corepack pnpm run lint`
- [x] `corepack pnpm run build`

  </details>

- [x] #28 [Feat] 3D 노드 hover 메타데이터 카드 구현
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
3D 렌더링 상태에서 곡 노드에 hover하면 iTunes Search API로 확보한 곡명, 아티스트, 앨범 이미지를 화면에 표시합니다.

## 📋 세부 작업 태스크 (Todo)
- [x] shared track/snapshot 타입에 title, artist, albumImageUrl, itunesTrackId 필드 정리
- [x] R3F 노드 hover 상태를 App 또는 HUD 레이어로 전달
- [x] `TrackHoverCard` 또는 동등한 오버레이 컴포넌트 구현
- [x] hover 카드에 곡명, 아티스트, 앨범 이미지 표시
- [x] 앨범 이미지가 없거나 로딩 실패할 때 fallback UI 적용
- [x] 모바일/터치 환경에서는 hover 대신 tap/focus fallback 동작 정의

## ✅ 검증 방법
- [x] 노드 hover 시 올바른 곡명/아티스트/앨범 이미지가 표시되는지 확인
- [x] hover 해제 시 카드가 사라지는지 확인
- [x] 앨범 이미지 없음/오류 상황에서 UI가 깨지지 않는지 확인
- [x] `corepack pnpm run lint`
- [x] `corepack pnpm run build`

  </details>

- [ ] #29 [Feat] 선택 곡 기준 최근접/최원거리 곡 강조 구현
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
현재 선택한 곡을 기준으로 5차원 감성 벡터 또는 3D 투영 좌표에서 가장 가까운 곡과 가장 먼 곡을 계산하고, 색상과 연결선으로 관계를 시각화합니다.

## 📋 세부 작업 태스크 (Todo)
- [ ] 거리 계산 기준 선택: 원본 5D 벡터 우선, 필요 시 3D 투영 좌표 fallback
- [ ] selectedTrackId 기준 nearest/farthest 계산 유틸 구현
- [ ] 최근접/최원거리 노드 색상 또는 emissive intensity 차별화
- [ ] 선택 곡과 최근접/최원거리 곡을 잇는 R3F line 렌더링
- [ ] HUD 또는 hover card에 관계 라벨 표시
- [ ] 선택 곡이 없거나 노드가 2개 미만일 때 fallback 처리

## ✅ 검증 방법
- [ ] 선택 곡 변경 시 최근접/최원거리 강조 대상이 갱신되는지 확인
- [ ] 연결선이 올바른 두 노드를 잇는지 확인
- [ ] 250개 노드에서도 조작감이 유지되는지 확인
- [ ] `corepack pnpm run test`
- [ ] `corepack pnpm run lint`
- [ ] `corepack pnpm run build`

  </details>

- [ ] #30 [Feat] 선택 곡 변경 시 관계 재연산 흐름 구현
  <details>
  <summary>🔍 작업 내용 보기</summary>

  ## 🎯 작업 개요
다른 곡을 선택하면 해당 곡을 기준으로 최근접/최원거리 관계, HUD 표시, 공유 snapshot 상태가 즉시 재연산되도록 데이터 흐름을 정리합니다.

## 📋 세부 작업 태스크 (Todo)
- [ ] selectedTrackId를 단일 source of truth로 정리
- [ ] 선택 곡 변경 시 관계 계산 결과를 memoized selector로 재계산
- [ ] 선택 상태가 공유 snapshot URL에 반영되는지 확인
- [ ] 선택 곡 기준 관계 UI/HUD/line이 동시에 갱신되도록 연결
- [ ] 선택 곡이 snapshot URL로 복원된 경우에도 동일 계산이 수행되도록 처리
- [ ] 불필요한 전체 노드 재생성 없이 계산/렌더링이 갱신되도록 최적화

## ✅ 검증 방법
- [ ] 여러 곡을 연속 선택해도 관계 강조가 이전 상태에 남지 않는지 확인
- [ ] 선택 곡이 포함된 공유 URL을 새로 열었을 때 관계가 즉시 복원되는지 확인
- [ ] `corepack pnpm run test`
- [ ] `corepack pnpm run lint`
- [ ] `corepack pnpm run build`

  </details>
