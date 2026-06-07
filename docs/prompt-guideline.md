# Prompt Guideline

이 문서는 SoundCluster 백엔드가 Gemini API를 호출할 때 사용할 분석 프롬프트, 입력 payload, 출력 JSON 계약을 정의합니다. 코딩 에이전트 작업 지침은 `docs/AGENTS.md`를 기준으로 하고, 이 문서는 런타임 AI 분석 파이프라인에만 집중합니다.

---

## 1. System Prompt

Express 서버가 Gemini SDK 세션을 생성할 때 주입하는 시스템 프롬프트입니다.

```text
[Role & Context]
너는 음악 심리학, 다차원 데이터 정량화, 감성 텍스트 분석 전문가다.
입력 데이터인 곡명, 아티스트, 가사를 종합해 음악의 무드를 5차원 감성 벡터로 정량화한다.

[Constraints]
1. 응답은 백엔드가 즉시 JSON.parse()로 처리할 수 있는 Raw JSON 객체 하나여야 한다.
2. 마크다운 코드 블록, 설명 문장, 인사말, 종결 문장은 출력하지 않는다.
3. 모든 감성 축 수치는 0.0 이상 1.0 이하의 실수로 반환한다.
4. 알 수 없는 값은 추측 문장이 아니라 JSON schema 안의 합리적인 기본값으로 표현한다.
```

---

## 2. Input Payload

백엔드는 음악 메타데이터와 사용자가 조정한 목표 감성 축을 함께 전달합니다. `null`인 목표값은 모델이 원곡 분석에 따라 자유롭게 판단합니다.

```json
{
  "musicMetadata": {
    "title": "곡 제목",
    "artist": "아티스트 명",
    "lyrics": "전체 가사 텍스트"
  },
  "userVectorTargets": {
    "energy": 0.8,
    "valence": 0.2,
    "tempoDensity": 0.9,
    "spaceDepth": null,
    "tension": null
  },
  "instruction": "userVectorTargets에 값이 있는 축은 원곡 분석 결과를 기준으로 자연스럽게 보정하고, null인 축은 가사와 메타데이터에 따라 판단한다."
}
```

---

## 3. Output Schema

Gemini의 최종 응답은 아래 구조를 따라야 합니다. 이 구조는 `shared/types/`의 타입 정의와 동기화되어야 합니다.

```json
{
  "analysisStatus": "success",
  "musicId": "spotify_track_id_string",
  "emotions": {
    "energy": 0.82,
    "valence": 0.21,
    "tempoDensity": 0.91,
    "spaceDepth": 0.45,
    "tension": 0.78
  },
  "generatedSummary": "고에너지, 저긍정 벡터에 맞춰 해석한 음악 감성 요약"
}
```

---

## 4. Validation Rules

### JSON 파싱 검증

- 백엔드는 Gemini 응답을 `JSON.parse()`로 먼저 검증합니다.
- 파싱 실패, 필수 키 누락, 타입 불일치, 범위 밖 수치가 있으면 실패로 처리합니다.
- 실패 시 최대 3회까지 동일 요청을 재시도합니다.

### Retry Prompt

재시도 시 이전 실패 응답과 함께 아래 교정 문장을 추가합니다.

```text
[SYSTEM ALERT]
Previous output was not valid JSON or did not match the required schema.
Return only one Raw JSON object that exactly follows the schema.
Do not include markdown, explanations, or extra text.
```

### Vector 보정

- `userVectorTargets`의 값이 `null`이 아니면 해당 축은 사용자 의도를 반영합니다.
- 원곡 감성 분석 결과와 사용자 목표값 사이를 자연스럽게 보간합니다.
- 모든 최종 축 값은 0.0 이상 1.0 이하로 clamp합니다.

---

## 5. Naming Contract

런타임 JSON은 TypeScript 친화적인 `camelCase`를 사용합니다.

- `musicMetadata`
- `userVectorTargets`
- `tempoDensity`
- `spaceDepth`
- `analysisStatus`
- `musicId`
- `generatedSummary`

기존 문서나 이슈에서 `snake_case` 예시가 발견되면 구현 시 `camelCase` 계약으로 정규화합니다.
