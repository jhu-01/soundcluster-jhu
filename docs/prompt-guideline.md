# 🤖 프롬프트 엔지니어링 가이드라인 (Prompt Engineering Guideline)

본 문서는 SoundCluster 프로젝트의 AI 데이터 파이프라인 내에서 음악 메타데이터 및 가사를 분석해 5차원 감성 벡터(JSON)를 안전하게 추출하고, 사용자의 선택 조건에 따라 맞춤형 출력을 제어하기 위한 에이전트 구동 지침을 정의합니다.

---

## 1. 에이전트 시스템 프롬프트 (System Prompt)

백엔드(Express)가 Gemini SDK를 가동하여 모델 세션을 초기화할 때 컨텍스트 주입용으로 사용하는 마스터 페르소나 및 제약 조건 설정입니다.

```text
[Role & Context]
너는 음악 심리학, 다차원 데이터 정량화 분석 및 감성 텍스트 시각화 전문가야.
입력 데이터(곡명, 아티스트, 가사)를 종합 분석하여 음악의 무드를 정밀하게 정량화하고 파싱해야 해.

[Constraints]
1. 분석 결과물은 프론트엔드 및 백엔드 파이프라인이 즉시 객체로 파싱할 수 있도록 반드시 지정된 JSON Schema 스펙만 준수하여 반환해라.
2. 마크다운 백틱(```json)을 포함한 전후방 설명 텍스트, 인사말, 종결어는 시스템 에러를 유발하므로 절대 출력하지 말고 오직 Raw JSON 객체 하나만 출력해라.
3. 데이터 신뢰성을 사수하기 위해 모든 감성 축 수치는 0.0(최저)에서 1.0(최고) 사이의 실수(Float) 범위 내에서만 정교하게 연산해라.
```

## 2. 입력 데이터 및 벡터 타겟 구조 (Input Data Schema)
백엔드가 수집한 음악 메타데이터와 사용자가 클라이언트 슬라이더(ControlPanel.tsx)를 통해 지정한 목표 감성 축(Vector Targets)을 결합하여 LLM에 전송하는 입력 페이로드 규격입니다.

```json
{
  "music_metadata": {
    "title": "곡 제목",
    "artist": "아티스트 명",
    "lyrics": "전체 가사 텍스트 스트링..."
  },
  "user_vector_targets": {
    "energy": 0.8,
    "valence": 0.2,
    "tempo_density": 0.9,
    "space_depth": null,
    "tension": null
  },
  "instruction": "유저가 지정한 user_vector_targets에 값이 명시되어 있을 경우(Not Null), 해당 곡의 원본 가사를 분석하되, 사용자가 강제 지정한 감성 축의 수치 조건(예: 극도의 우울함 속 폭발적인 비트)을 가중치로 최우선 반영하여 분석 결과를 조정하고 매칭 스토리를 생성하십시오."
}
```
## 3. 필수 구현 기능 및 검증 지침 (Strict Core Rules)
📌 규칙 1. 구조화 출력 실패 시 백엔드 자동 재시도 (Retry-On-Failure)
진단 매커니즘: 백엔드 서버는 Gemini API로부터 전달받은 응답 문자열을 JSON.parse()로 검증합니다. 파싱 에러(SyntaxError)가 발생하거나 필수 데이터 키가 누락되었을 경우 즉시 실패(Failure)로 간주합니다.

재시도 가드레일 (Retry Handler):

실패 감지 시 최대 3회(Max Retries: 3)까지 LLM에 동일 트랜잭션을 재요청(Re-prompt)합니다.

이때 이전 실패 응답 스트링 뒤에 아래 에러 교정 컨텍스트를 강제로 결합하여 피드백을 주입합니다.

주입 경고문: [SYSTEM ALERT: Previous output was not a valid JSON. Correct the formatting immediately and return ONLY the JSON object matching the requested schema.]

📌 규칙 2. 가중치 벡터 동적 조건화 (Vector-Driven Generation)
동적 가중치 연산: 사용자가 클라이언트 UI를 조작하여 특정 감성 벡터값을 강제 지정하면, 백엔드는 해당 수치를 user_vector_targets 오브젝트에 바인딩하여 LLM에 제공합니다.

출력 보정 사양: 에이전트는 입력된 음악 고유의 감성선과 사용자가 커스텀 지정한 목표 벡터값 간의 유클리드 거리를 계산한 뒤, 최종 출력 수치를 유저의 타겟 방향으로 자연스럽게 선형 보간(Lerp) 및 수렴시킨 정밀 정량화 데이터를 반환해야 합니다.

## 4. 최종 출력 데이터 명세 (Target Output Schema)
에이전트가 모든 검증을 통과하고 백엔드 파이프라인에 최종적으로 반환해야 하는 동결(Frozen)된 정형 JSON 스펙입니다. shared/types/에 인터페이스로 등록되어 양방향 정적 타이핑의 기준이 됩니다.

```json
{
  "analysis_status": "success",
  "music_id": "spotify_track_id_string",
  "emotions": {
    "energy": 0.82,
    "valence": 0.21,
    "tempo_density": 0.91,
    "space_depth": 0.45,
    "tension": 0.78
  },
  "generated_summary": "사용자가 선택한 고에너지, 저긍정(Valence) 벡터에 맞춤 동기화된 음악 감성 해석 평론 요약 텍스트..."
}
```
