# API 연동 및 성능 최적화

실시간 환율 데이터를 제공하기 위해 외부 API를 사용하며, 성능과 API 호출 제한을 고려하여 캐싱 전략을 적용했습니다.

## 환율 API (Frankfurter API)
- **URL**: `https://api.frankfurter.app/latest?from=USD&to=KRW`
- **특징**: 무료이며 별도의 API 키가 필요하지 않습니다.

## 캐싱 전략 (Caching)
`src/services/exchange-api.js`에서 `localStorage`를 활용하여 데이터를 캐싱합니다.

```javascript
const CACHE_KEY = 'unitbridge_exchange_rate';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1시간
```

- **동작 방식**: 
  1. API 호출 전 `localStorage`에 유효한(1시간 이내) 데이터가 있는지 확인합니다.
  2. 캐시가 존재하면 API 호출 없이 캐시된 값을 사용합니다.
  3. 캐시가 없거나 만료된 경우 API를 호출하고 결과를 새로 저장합니다.
  4. 네트워크 오류 발생 시 마지막으로 캐시된 값을 폴백(Fallback)으로 사용하며, 이마저도 없으면 기본값(예: 1400)을 반환합니다.

## 성능 고려사항
- **Debouncing**: 입력값 변경 시 지나친 렌더링을 방지하기 위해 간단한 유효성 검사 후 상태를 업데이트합니다.
- **Lazy Loading**: (향후 적용 예정) 카테고리별 상세 정보나 복잡한 컴포넌트는 필요할 때 로드하도록 최적화할 수 있습니다.
