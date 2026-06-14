# API 연동 및 성능 최적화

실시간 환율 데이터를 제공하기 위해 외부 API를 사용하며, 성능과 API 호출 제한을 고려하여 상세한 캐싱 전략을 적용했습니다.

## 환율 API (Frankfurter API)
- **URL**: `https://api.frankfurter.dev/v1/latest`
  - **기본 달러 환율**: `https://api.frankfurter.dev/v1/latest?from=USD&to=KRW`
  - **다중 환율 (Currency Converter)**: `https://api.frankfurter.dev/v1/latest?from=${base}&to=${symbolsQuery}`
- **특징**: 무료 공개 API이며 별도의 API 키나 인증 정보가 필요하지 않습니다.

## 캐싱 전략 (Caching)
`src/services/exchange-api.js`에서 `localStorage`를 활용하여 데이터를 캐싱합니다. 불필요한 API 호출을 최소화하여 성능을 올리고 외부 API 트래픽을 아낍니다.

```javascript
const STANDARD_CACHE_KEY = 'unitbridge_standard_rate'; // 일반 단위 변환용 (USD->KRW)
const MULTI_CACHE_KEY = 'unitbridge_multi_rates';       // 다중 환율 변환용 (base별 저장)
const CACHE_EXPIRY = 1000 * 60 * 60; // 1시간 만료 기준
```

### 동작 방식 (Standard Rate)
1. API 호출 전 `localStorage`에 유효한(1시간 이내) USD->KRW 캐시 데이터가 존재하는지 검사합니다.
2. 캐시 데이터가 유효하면 네트워크 통신 없이 캐시된 값을 활용합니다.
3. 캐시가 없거나 1시간이 지난 경우 API를 새로 호출하고 최신 데이터를 캐시에 업데이트합니다.
4. 네트워크가 불안정하거나 API 장애가 생기면 마지막 캐시 값을 반환하고, 캐시마저 없으면 기본 고정값(`1400`)으로 안전하게 폴백(Fallback) 처리합니다.

### 동작 방식 (Multi Rates)
1. 기준 통화(`base`)에 맞춰 캐시 키(예: `unitbridge_multi_rates_KRW`)를 동적으로 구성합니다.
2. 캐시 데이터가 유효하고, 변환에 필요한 모든 대상 통화(`symbols`)의 환율 값이 캐시 내에 온전히 포함되어 있는지(`hasAllSymbols`) 확인합니다.
3. 대상 통화가 추가되었거나 캐시가 만료된 경우 API를 호출하여 타겟 목록만 쿼리해 갱신합니다.
4. 오류가 생기면 마지막 캐시 값을 활용하고 없으면 빈 객체(`{}`)를 반환합니다.

## 성능 고려사항
- **즉각적인 상태 반영 (Instant Trigger)**: 텍스트 입력과 계산 연산이 매우 가벼운 CPU 연산(소수점 곱셈 및 나눗셈)이므로 디바운싱(Debouncing) 없이 사용자의 키 입력 즉시 상태를 업데이트하여 자연스럽고 부드러운 상호작용을 보장합니다.
- **Zustand Persistence**: 다중 통화 설정(기준 통화, 대상 통화 목록)을 브라우저에 저장하여 앱 진입 시 추가 설정 변경 없이 최적화된 상태로 바로 시작할 수 있습니다.

