# AI Agent Operating Guide (`agents.md`)

본 문서는 SoundCluster 프로젝트에서 AI 에이전트가 코드를 읽고, 수정하고, 검증하고, 커밋할 때 따라야 하는 운영 기준입니다. 기존 모델 전용 지침의 역할을 계승하되, 특정 모델명 중심의 지침을 제거하고 프로젝트에 함께 들어오는 모든 에이전트가 동일하게 따를 수 있는 기준으로 정리합니다.

Gemini는 백엔드 LLM 제공자이자 `@google/genai` SDK 연동 대상입니다. 이 문서에서 말하는 에이전트는 Codex, Gemini, 기타 자동화 도구를 포함한 개발 협업 주체를 뜻합니다.

---

## 1. 프로젝트 개요

- **프로젝트 명**: SoundCluster
- **설명**: 사용자가 검색한 음악의 가사와 메타데이터를 기반으로 LLM이 다차원 감성 수치를 분석하고, 이를 차원 축소(MDS) 알고리즘으로 3D 웹 우주 공간(R3F/WebGL)에 배치하여 나만의 음악 성단으로 시각화하고 공유하는 몰입형 감성 음악 대시보드 서비스입니다.

---

## 2. 작업 원칙

에이전트는 작업을 시작하기 전에 현재 코드와 문서를 먼저 읽고, 기존 구조가 이미 말하고 있는 방향을 우선합니다.

- 작업 전 `git status`로 사용자 변경 여부를 확인합니다.
- 사용자가 만든 변경은 되돌리지 않습니다.
- 기존 프레임워크, 폴더 구조, 명명 규칙, 헬퍼 함수를 우선 사용합니다.
- 요청 범위를 벗어나는 리팩터링과 메타데이터 변경은 피합니다.
- 작은 수정은 바로 수행하고, 구조 변경이나 보안, 데이터 모델, UX 판단처럼 되돌리기 어려운 선택은 먼저 짧게 설명한 뒤 확인합니다.
- 불확실성이 낮은 경우에는 합리적인 가정을 세우고, 완료 보고에 그 가정을 명시합니다.

---

## 3. 기술 스택 및 제약 사항

### Architecture & Core

- **Frontend**: React + TypeScript (Vite 환경) + React Three Fiber (R3F) / Three.js
- **Backend**: Express.js (Node.js) + SSE(Server-Sent Events) 실시간 데이터 푸시 스트리밍
- **LLM Integration**: Google 공식 `@google/genai` SDK 활용, `application/json` 구조화 출력 강제
- **Data Storage**: MySQL 데이터베이스 활용, 분석된 5차원 원본 데이터를 `tracks` 및 `shared_spaces` 테이블에 영구 적재 및 캐싱

### Coding Rules

- **Styling**: CSS Modules를 기본으로 사용합니다. 외부 UI 컴포넌트 라이브러리나 Tailwind CSS는 별도 요청 없이 추가하지 않습니다.
- **State Management**: React Hooks와 Context API를 기본으로 사용합니다. Redux, Zustand 등 외부 상태 라이브러리는 명확한 필요가 있을 때만 제안합니다.
- **Type System**: Strict TypeScript를 유지합니다. `any`는 피하고, 공유 데이터에는 명확한 interface/type을 둡니다.
- **Constants**: API 엔드포인트, Base URL, SSE 주소, 포트 번호, 반복 문자열과 숫자는 `shared/constants` 또는 해당 레이어의 constants 파일로 추출합니다.
- **Pure Utilities**: 데이터 가공, 유효성 검사, MDS 연산, 좌표 변환은 컴포넌트나 라우터에서 분리하여 `shared/utils` 또는 레이어별 `utils`에 둡니다.
- **Security**: 외부 음악 메타데이터 API와 Gemini API Key는 프론트엔드에 노출하지 않습니다. 서버의 `.env`와 백엔드 프록시 호출로만 다룹니다.

### 3D Optimization

- `useFrame` 애니메이션 루프에서 오브젝트 이동은 선형 보간(`lerp`)을 사용하고, 주사율 편차를 줄이기 위해 `delta` 기반 보정을 적용합니다.
- 매 프레임 내부에서 `new THREE.Vector3()`처럼 가비지 컬렉션을 유발하는 인스턴스 생성을 반복하지 않습니다.
- 반복 사용되는 Three.js 객체는 `useRef` 등으로 보관하고 필요한 구간에서만 안전하게 mutation합니다.

---

## 4. 가독성 기준

- **High Cohesion**: 관련 로직과 상태는 한 파일 안에서도 서로 가까운 위치에 둡니다.
- **No Over-Chaining**: 복잡한 `map/filter/reduce` 체이닝이나 중첩 삼항 연산자로 의도를 숨기지 않습니다.
- **Paradigm Consistency**: 데이터 가공은 불변성과 순수 함수를 기본으로 삼고, R3F 성능 루프나 수치 연산처럼 필요한 구간에서만 mutation을 제한적으로 허용합니다.
- **Comments**: 코드가 이름과 구조만으로 설명되지 않는 복잡한 블록에만 짧은 주석을 둡니다. 당연한 동작을 반복 설명하는 주석은 추가하지 않습니다.
- **Naming**: 컴포넌트는 PascalCase, 변수와 함수는 camelCase, CSS 클래스명은 kebab-case를 사용합니다.

---

## 5. 구현 워크플로우

1. `docs/checklist.md`에서 현재 작업이 어떤 이슈나 마일스톤과 가장 가까운지 확인합니다.
2. `docs/Architecture.md`의 폴더 구조와 현재 파일 구조를 대조합니다.
3. 변경 전후로 `rg`와 diff를 활용해 참조 누락, 파일명 불일치, 하드코딩을 점검합니다.
4. 코드 변경이 있다면 위험도에 맞춰 `pnpm run lint`, `pnpm run build`, 서버 헬스체크, 브라우저 확인을 수행합니다.
5. 문서 변경만 있다면 참조 검색과 `git diff --check`로 링크, 파일명, 공백 오류를 검증합니다.
6. 완료 보고에는 변경 파일, 검증 결과, 남은 리스크를 짧게 포함합니다.

새로운 최상위 디렉토리나 아키텍처 경계를 바꾸는 파일 이동은 먼저 사용자에게 구조를 보고합니다. 기존에 정의된 디렉토리 안에서 요청을 충족하기 위한 파일 수정은 바로 진행할 수 있습니다.

---

## 6. 커밋 컨벤션

단순 요약이 아니라 작업 과정과 확인 내용을 남기는 회고형 커밋(Reflective Commit)을 사용합니다.

- **제목**: `<type>: #<이슈번호> <제목>`
- **본문**: 아래 두 섹션을 불릿 포인트로 반드시 포함합니다.
  - `- 확인내용:` 구현 또는 수정된 핵심 내용, 검증한 항목, 영향 범위
  - `- 이해 안 됐던 부분:` 작업 중 헷갈렸던 지점, 판단 과정, 해결 방식

`type`은 `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `chore` 중 가장 가까운 값을 사용합니다. 명확한 이슈가 없으면 `docs/checklist.md`에서 가장 관련 있는 번호를 사용하고, 관련 번호가 전혀 없을 때만 사용자에게 확인합니다.

예시:

```text
docs: #6 에이전트 지침 문서 표준화

- 확인내용: 모델 전용 지침을 docs/agents.md로 전환하고 관련 문서 참조를 정리했다.
- 이해 안 됐던 부분: 기존 문서가 Gemini 제공자 지침과 에이전트 작업 규칙을 함께 담고 있어 두 역할을 분리했다.
```

---

## 7. 맞춤형 작업 스킬

프로젝트 전용 Codex skill은 `codex/skills/` 아래에 둡니다. 사용자가 skill 이름을 직접 말하지 않아도 아래 역할과 유사한 요청이면 해당 skill의 `SKILL.md`를 먼저 확인하고 적용합니다.

### Commit-Generator

작업 내용을 바탕으로 커밋 메시지를 작성할 때 다음 규칙을 따릅니다.

1. 제목은 `<type>: #<이슈번호> <제목>` 형식으로 작성합니다.
2. 본문은 `- 확인내용:`과 `- 이해 안 됐던 부분:` 두 섹션으로 나눕니다.
3. `- 확인내용:`에는 실제 변경 사항과 검증 내용을 적습니다.
4. `- 이해 안 됐던 부분:`에는 작업 중 판단이 필요했던 지점과 해결 과정을 개발자의 시선으로 기록합니다.

### Checklist-Generator

위치: `codex/skills/checklist-generator`

아키텍처, PRD, 현재 구현 상태를 바탕으로 다음 단계 체크리스트를 만들 때 사용합니다.

1. `docs/Architecture.md`, PRD, `docs/checklist.md`, 현재 구현 상태를 함께 읽습니다.
2. 완료된 흐름과 남은 흐름을 연결해 "무엇부터 할지"를 정리합니다.
3. 기존 GitHub issue 번호가 있으면 그대로 매핑하고, 없으면 새 번호를 임의로 만들지 않습니다.
4. 각 항목에 목표, 관련 파일, 검증 방법, 의존 관계를 포함합니다.
5. 생성된 항목을 GitHub issue로 등록해야 하면 `Github-Issue-Publisher`로 넘깁니다.

### Github-Issue-Publisher

위치: `codex/skills/github-issue-publisher`

체크리스트 항목을 GitHub issue로 등록하거나, issue 번호와 `docs/checklist.md`를 동기화할 때 사용합니다.

1. 체크리스트 항목과 기존 GitHub issue를 비교해 중복 생성을 피합니다.
2. issue 제목, 목표, 범위, 세부 작업, 검증 방법을 작성합니다.
3. GitHub에 직접 쓰는 작업은 skill만으로 처리하지 않고 GitHub MCP 또는 `gh` CLI 같은 외부 도구를 사용합니다.
4. issue 생성이 성공한 뒤에만 `docs/checklist.md`에 번호를 반영합니다.
5. issue 생성 실패 시 생성한 척하지 말고 실패 원인과 초안을 보고합니다.

### Coding-Rules-Checker

위치: `codex/skills/coding-rules-checker`

변경된 코드가 프로젝트 규칙, 디렉토리 구조, validation 패턴, 에러 핸들링, 가독성 기준을 지키는지 검사할 때 사용합니다.

1. `git diff` 또는 staged diff를 먼저 보고 관련 파일의 주변 코드만 추가로 엽니다.
2. `docs/agents.md`와 `docs/Architecture.md` 기준으로 위반 사항을 분류합니다.
3. 설명용 주석 남발, 절차지향과 객체지향의 근거 없는 혼용, 과도한 한 줄 압축, 중첩 조건문 안의 복잡한 함수 호출을 지적합니다.
4. 비슷한 기능이나 모양의 코드가 흩어져 있으면 같은 방향으로 모으도록 제안합니다.
5. 중복되거나 하나로 엮어야 하는 데이터 값은 상수, shared type, helper, hook, 또는 컴포넌트로 관리하도록 제안합니다.
6. 결과는 심각도와 파일/라인 기준의 위반 목록으로 보고합니다.

### Checklist-Driven-Build

기능 구현을 요청받으면 `docs/checklist.md`의 태스크를 기준으로 범위를 제한합니다. 새 체크리스트를 만드는 작업은 `Checklist-Generator`를 우선 사용하고, 이 섹션은 실제 구현 중 범위 통제 규칙으로 적용합니다.

1. 작업 전 관련 checklist 항목을 식별합니다.
2. 구현 파일의 위치가 `docs/Architecture.md`와 맞는지 확인합니다.
3. 코드 출력 전 기술 스택, 가독성 기준, 보안 제약을 점검합니다.
4. CSS 작업이 포함되면 기존 디자인 토큰과 CSS Modules 규칙을 확인합니다.
5. 작업 완료 후 해당 태스크를 실제로 끝냈을 때만 체크 상태로 갱신합니다.
