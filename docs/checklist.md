- [ ] #2 [Env] Node.js 환경 구축 및 패키지 매니저(pnpm) 초기화
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
로컬 컴퓨터에 아무런 개발 도구가 없는 상태에서 출발하여, 프로젝트 구동을 위한 최신 Node.js 환경을 세팅하고 고속 패키지 매니저인 pnpm 인프라를 구축합니다.

## 📋 세부 작업 태스크 (Todo)
- [ ] Node.js 공식 LTS 버전(v22 이상) 설치 및 터미널 검증 (`node -v`)
- [ ] Corepack 활성화 또는 글로벌 명령어로 pnpm v9 이상 설치 (`npm i -g pnpm`)
- [ ] 프로젝트 루트 디렉토리에서 `pnpm init` 실행하여 기본 `package.json` 생성
- [ ] `.gitignore` 파일 생성하여 `node_modules` 및 환경변수 보안 격리 설정

  </details>
- [ ] #3 [Feat] Express 기본 서버 구동 및 헬스체크 엔드포인트 구현
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
Express와 TypeScript를 개발 의존성으로 설치하고, 서버를 켰을 때 브라우저에서 접속이 잘 되는지 확인하는 최소한의 뼈대를 만듭니다.

## 📋 세부 작업 태스크 (Todo)
- [ ] `express`, `typescript`, `@types/node`, `@types/express` 패키지 설치
- [ ] `tsconfig.json` 초기화 및 빌드/실행 환경 설정
- [ ] `server/src/app.ts` 파일 생성 및 포트 기본 바인딩
- [ ] `GET /api/health` 엔드포인트 테스트 (브라우저 접속 시 `{"status": "ok"}` 반환 확인)

  </details>
- [ ] #4 [Env] MySQL 로컬 설치 및 커넥션 풀(Connection Pool) 연결
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
로컬 컴퓨터에 데이터베이스 엔진을 설치하고, Express 서버가 구동될 때 DB와 끊어지지 않고 안전하게 통신할 수 있도록 커넥션 풀 설정을 완료합니다.

## 📋 세부 작업 태스크 (Todo)
- [ ] MySQL Community Server 로컬 설치 및 root 비밀번호 세팅
- [ ] `dotenv` 패키지 설치 및 보안을 위한 `server/.env` 파일 분리
- [ ] `mysql2` 라이브러리 설치 및 `server/src/config/db.ts` 커넥션 풀 모듈 구현
- [ ] 서버 구동 시 DB 연결 성공 메시지(`Database Connected!`) 로그 출력 검증

  </details>
- [ ] #5 [Feat] Gemini SDK 연동 및 단순 텍스트 프롬프트 테스트
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
구글 인공지능 API를 사용하기 위한 SDK 설정을 마치고, 가볍게 질문을 던졌을 때 인공지능이 대답을 잘 받아오는지 파이프라인 작동 여부만 검증합니다.

## 📋 세부 작업 태스크 (Todo)
- [ ] Google AI Studio에서 API Key 발급 및 `.env` 파일에 안전하게 등록
- [ ] 구글 공식 `@google/genai` 패키지 설치
- [ ] `server/src/config/gemini.ts` 공통 클라이언트 인스턴스 생성 로직 구현
- [ ] 콘솔에 AI의 답변이 정상 출력되는지 임시 라우터로 테스트

  </details>
- [ ] #6 [Feat] GEMINI.md 지침 바인딩 및 5차원 JSON 출력 강제화
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
앞서 설계한 `GEMINI.md` 가이드라인의 System Instruction을 주입하고, 대답 형식을 오직 Raw JSON 객체 하나로만 고정하도록 하드웨어 가드레일을 칩니다.

## 📋 세부 작업 태스크 (Todo)
- [ ] `GEMINI.md` 문서의 `[Role & Context]`, `[Constraints]` 문자열을 시스템 프롬프트 상수로 추출
- [ ] `responseMimeType: "application/json"` 옵션 활성화
- [ ] 곡명, 아티스트, 가사를 더미 데이터로 던졌을 때 0.0 ~ 1.0 범위의 5차원 수치가 포함된 깔끔한 JSON 객체가 반환되는지 검증

  </details>
- [ ] #7 [Feat] Vite + React + TS 초기화 및 CSS Modules 세팅
  <details>
  <summary>🔍 이슈 내용 보기</summary>

  ## 🎯 작업 개요
Vite를 이용해 엄격한 타입스크립트 기반의 React SPA 환경을 빌드하고, 외부 UI 프레임워크 없이 자립하기 위한 CSS Modules 구조를 세팅합니다.

## 📋 세부 작업 태스크 (Todo)
- [ ] `client/` 디렉토리 생성 후 `pnpm create vite . --template react-ts`로 초기화
- [ ] 글로벌 디자인 토큰 설정을 위한 전역 CSS 파일 구조화
- [ ] 컴포넌트별 격리된 스타일 사수를 위한 `.module.css` 네이밍 컨벤션 적용 테스트

  </details>
- [ ] #8 [Feat] Three.js 및 R3F(React Three Fiber) 기본 캔버스 구동
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
3D 그래픽스 연산을 위해 R3F 패키지를 설치하고, 마우스로 이리저리 돌려볼 수 있는 가상의 3D 공간과 바닥 격자판(Grid)을 구현합니다.
## 📋 세부 작업 태스크 (Todo)
- [ ] `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei` 패키지 설치
- [ ] `client/src/canvas/StarsCanvas.tsx` 기본 메인 캔버스 컴포넌트 생성
- [ ] 마우스 회전/확대를 위한 `<OrbitControls />` 컴포넌트 이식 및 구동 확인
- [ ] 공간 감각을 주기 위한 바닥면 네온 그리드(`GridBase.tsx`) 가이드라인 레이아웃 배치

  </details>
- [ ] #9 [Feat] 백엔드 SSE(Server-Sent Events) 스트리밍 API 구현
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
Gemini의 AI 분석 작업이 진행되는 동안 클라이언트가 블로킹(대기)되지 않도록, 서버에서 클라이언트로 실시간 상태를 밀어주는 SSE(Server-Sent Events) 단방향 스트리밍 채널을 구축합니다.
## 📋 세부 작업 태스크 (Todo)
- [ ] `server/src/routes/analyze.ts` 라우터에 SSE 전용 헤더(`text/event-stream`) 설정
- [ ] 분석 단계별 상태 메세지 구조 설계 (`status: "fetching" | "analyzing" | "done"`)
- [ ] 더미 데이터를 활용해 브라우저 `EventSource`로 실시간 데이터가 뚝뚝 떨어지는지 스트리밍 검증

  </details>
- [ ] #10 [Feat] 데이터베이스 캐싱 계층(Caching Layer) 및 조회 로직 구현
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
동일한 곡에 대한 중복 분석 요청 시, 비싼 Gemini API를 다시 호출하지 않고 MySQL DB에 적재된 기존 5차원 감성 벡터를 즉시 반환하는 캐싱 로직을 구현합니다.
## 📋 세부 작업 태스크 (Todo)
- [ ] 곡명(Title)과 아티스트(Artist) 기준의 고유 해시값 또는 복합 키 조회 쿼리 구현
- [ ] `IF EXISTS` 조건문을 활용해 캐시 데이터가 있으면 즉시 SSE로 데이터 쏘고 연결 종료(`close`)
- [ ] 캐시 미스(Cache Miss) 발생 시에만 Gemini 파이프라인을 트리거하고 연산 결과를 MySQL에 자동 `INSERT`

  </details>
- [ ] #11 [Feat] EventSource 기반 클라이언트 실시간 데이터 수신 및 상태 관리
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
프론트엔드에서 서버의 SSE 엔드포인트를 구독(`EventSource`)하고, 실시간으로 들어오는 분석 진행 상태 및 최종 5차원 데이터를 안전하게 담을 리액트 Context 또는 전역 상태를 구축합니다.
## 📋 세부 작업 태스크 (Todo)
- [ ] `client/src/hooks/useEmotionStream.ts` 커스텀 훅 구현
- [ ] 연결 시작, 데이터 수신, 에러 발생, 연결 종료(`stream.close()`) 예외 처리 핸들링
- [ ] 최종 수신된 5차원 JSON 데이터를 상태(State)에 바인딩하여 렌더링 준비 완료

  </details>
- [ ] #12 [Feat] 5차원 데이터 ➔ 3D 공간 좌표 변환 (MDS 알고리즘 구현)
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
Gemini가 반환한 벡터 수치(0.0 ~ 1.0)를 3D 우주 공간 상의 가시적인 점(X, Y, Z 물리 좌표)으로 매핑하기 위한 가중치 기반 다차원 축소 알고리즘 함수를 구현합니다.
## 📋 세부 작업 태스크 (Todo)
- [ ] `client/src/utils/mds.ts` 다차원 매핑 유틸 함수 작성
- [ ] 여러 축의 가중치를 받아 3차원 벡터(`THREE.Vector3`)로 변환하는 연산 가동
- [ ] 좌표 변환 시 성단 형태로 예쁘게 모이도록 보정 상수(Scaling Factor) 미세 조정

  </details>
- [ ] #13 [Feat] R3F 성단 노드 애니메이션 및 카메라 인스턴스 연동 (lerp)
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
변환된 X, Y, Z 좌표를 바탕으로 R3F 공간에 실제 아티스트 이름이 박힌 별 노드(`StarNode.tsx`)를 생성하고, 카메라가 해당 성단 위치로 부드럽게 이동하는 연출을 구현합니다.
## 📋 세부 작업 태스크 (Todo)
- [ ] `useFrame` 훅과 `lerp` 함수를 활용해 별이 지정 좌표로 스무스하게 날아와 안착하는 애니메이션 구현
- [ ] 새로운 별 노드 생성 시 R3F `state.camera`를 타겟 좌표로 부드럽게 다가 가도록 가속도 무빙 적용
- [ ] 마우스 오버 시 별의 텍스처 색상이 네온 컬러로 하이라이트되는 인터랙션 추가

  </details>
- [ ] #14 [Feat] 2D HUD 검색창 및 5축 감성 제어 슬라이더 UI 구현
  <details>
  <summary>🔍 이슈 내용 보기</summary>
  ## 🎯 작업 개요
3D 우주 공간 위에 오버레이될 2D 컨트롤 패널(HUD)을 CSS Modules로 디자인하고, 사용자가 직접 감성 가중치를 수동으로 조절할 수 있는 슬라이더 기능을 최종 결합합니다.
## 📋 세부 작업 태스크 (Todo)
- [ ] `client/src/components/SearchBar.tsx` 음악 검색 인풋창 구현 및 백엔드 SSE 트리거 바인딩
- [ ] `client/src/components/ControlPanel.tsx` 5차원 수치 제어용 레인지 슬라이더 바 UI 배치
- [ ] 사용자가 슬라이더를 움직이면 실시간으로 3D 공간상의 별들이 실시간으로 흩어지고 모이는 반응형 렌더링 최적화
  </details>
