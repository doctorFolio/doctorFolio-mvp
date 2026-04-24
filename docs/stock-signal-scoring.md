# 종목 시그널 점수 계산 문서

이 문서는 `src/lib/tradingSignals.ts`의 종목 진입 점수 계산 로직을 비즈니스 기준으로 설명한다.

## 목적
- 종목 페이지는 시장 판단과 분리된 `종목 자체 진입 타이밍`만 보여준다.
- 사용자는 한 화면에서 `점수`, `상태 라벨`, `쉬운 설명`, `전문 지표 상세`를 함께 읽을 수 있어야 한다.
- 점수 계산의 단일 진실 공급원은 `RSI`, `MACD`, `거래량`, `52주 위치` 4개 핵심 지표다.

## 입력 지표

### 점수 반영 지표
- `RSI`
- `MACD histogram`과 `previousHistogram`
- `volumeRatio`
- `week52Band`

### 참고 지표
- `6개월 평균 대비 괴리율`
- `내부자 매매`

참고 지표는 UI 상세에는 노출하지만 점수, 라벨, confidence 계산에는 포함하지 않는다.

## 점수 공식

각 핵심 지표는 아래 공식으로 기여도를 만든다.

```ts
contribution = directionScore * strength * weight
```

### directionScore
- `buy` => `+1`
- `neutral` => `0`
- `sell` => `-1`

### weight
- `RSI` => `1.2`
- `MACD` => `1.5`
- `거래량` => `1.3`
- `52주 위치` => `0.9`

```ts
TOTAL_WEIGHT = 4.9
```

### 최종 점수 변환

```ts
rawScore = sum(metric.contribution)
normalizedScore = clamp(rawScore / TOTAL_WEIGHT, -1, 1)
score = Math.round((normalizedScore + 1) * 50)
```

- `normalizedScore = -1` 이면 `0점`
- `normalizedScore = 0` 이면 `50점`
- `normalizedScore = +1` 이면 `100점`

## 상태 라벨
- `75~100` => `분할매수 고려`
- `60~74` => `관심 종목`
- `45~59` => `관망 우세`
- `30~44` => `주의 필요`
- `0~29` => `리스크 높음`

추가로 UI 정렬을 위해 `recommendation`도 함께 계산한다.

- `score >= 60` => `buy`
- `45 <= score < 60` => `neutral`
- `score < 45` => `sell`

## 지표별 판정 규칙

### RSI
- `< 30` => `buy`, `strength 0.85`
- `< 45` => `buy`, `strength 0.35`
- `< 60` => `neutral`
- `< 70` => `neutral`
- `< 80` => `sell`, `strength 0.45`
- `>= 80` => `sell`, `strength 0.85`

역할:
- 과열/과매도 판단
- 초보자 문구에서는 "많이 눌린 구간", "과열 구간" 같은 쉬운 표현으로 번역

### MACD
판정 기준:
- `histogram > 0 && histogram > previousHistogram` => `buy`, `strength 0.8`, `상승 흐름`
- `histogram > 0 && histogram < previousHistogram` => `buy`, `strength 0.35`, `상승 둔화`
- `histogram < 0 && histogram > previousHistogram` => `buy`, `strength 0.45`, `반등 조짐`
- `histogram < 0 && histogram < previousHistogram` => `sell`, `strength 0.75`, `하락 압력`
- 그 외 => `neutral`

역할:
- 추세 전환과 탄력 방향 판단

### 거래량
- `volumeRatio < 1.2` => `neutral`
- 그 이상이면 `strength = min(1, (volumeRatio - 1.2) / 1.3)`
- `recentReturn3d > 0` => `buy`
- `recentReturn3d < 0` => `sell`
- `recentReturn3d === 0` => `neutral`

역할:
- 수급이 가격 방향을 실제로 뒷받침하는지 판단

### 52주 위치
계산식:

```ts
week52Band = (currentPrice - week52Low) / (week52High - week52Low)
```

판정 기준:
- `<= 0.25` => `buy`, `strength 0.75`
- `<= 0.40` => `buy`, `strength 0.35`
- `< 0.75` => `neutral`
- `< 0.90` => `sell`, `strength 0.35`
- `>= 0.90` => `sell`, `strength 0.75`

역할:
- 최근 1년 가격 범위에서 현재 가격대 부담 판단

## Confidence
confidence는 점수 절대값이 아니라 `핵심 지표 정렬도`를 기준으로 판단한다.

대상 지표:
- `rsi`
- `macd`
- `volume`

규칙:

```ts
positive = number of buy signals in core metrics
negative = number of sell signals in core metrics
aligned = positive >= 2 || negative >= 2
```

- `aligned && abs(normalizedScore) >= 0.45` => `high`
- `aligned && abs(normalizedScore) >= 0.25` => `medium`
- 그 외 => `low`

UI 문구:
- `high` => `여러 핵심 지표가 같은 방향을 가리키고 있어요.`
- `medium` => `일부 핵심 지표가 같은 방향을 보이고 있어요.`
- `low` => `지표들이 엇갈려 조금 더 확인이 필요해요.`

## 상단 요약 문구
상단 문구는 아래 3단 조합으로 만든다.

```text
[가격 위치] + [추세/거래량] + [행동 가이드]
```

예:
- `가격 부담은 낮고 상승 신호가 나오고 있어요. 한 번에 사기보다 조금씩 나눠서 보는 게 좋아요.`
- `가격 흐름과 수급이 모두 약해 보여요. 새로 들어가기보다 반등 신호가 나올 때까지 기다리는 편이 좋아요.`

## 반환 구조
`TradingSignal`은 아래 정보를 포함한다.

- `score`
- `label`
- `confidence`
- `confidenceSummary`
- `summary`
- `metrics`
- `expertDetails`
- `referenceMetrics`

### metrics
점수 반영 핵심 지표 배열

주요 필드:
- `signal`
- `strength`
- `weight`
- `contribution`
- `status`
- `summary`
- `description`
- `value`

### expertDetails
아코디언에서 노출할 전문가 상세 정보

### referenceMetrics
점수 제외 참고 지표

## 예시

입력:

```ts
rsi = 42.3
macd histogram = 0.82
previousHistogram = 0.38
volumeRatio = 1.8
recentReturn3d = 2.1
week52Band = 0.35
```

기여도:

```text
RSI = +0.42
MACD = +1.20
거래량 = +0.60
52주 위치 = +0.32
```

결과:

```text
rawScore = 2.54
normalizedScore = 0.52
score = 76
label = 분할매수 고려
confidence = high
```

## 변경 원칙
- 핵심 4개 지표의 threshold나 weight를 바꾸면 이 문서와 `src/lib/tradingSignals.test.ts`를 함께 수정한다.
- 시장 결합 판단은 이 모델에 다시 넣지 않는다. 시장 정보는 별도 시장 페이지에서 다룬다.
