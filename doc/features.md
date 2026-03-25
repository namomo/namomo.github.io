# 주요 기능 및 로직

Unit Bridge는 다양한 단위 간의 변환을 지원하며, 사용자가 한쪽 값을 입력하면 즉시 반대쪽 값으로 자동 변환됩니다.

## 주요 기능
- **실시간 환율 변환**: API를 통해 최신 USD/KRW 환율을 가져와 변환합니다.
- **카테고리 기반 변환**: 무게, 길이, 온도 등 다양한 단위 카테고리에서 선택할 수 있습니다.
- **반응형 디자인**: 모바일과 데스크톱 환경 모두에 최적화된 레이아웃을 제공합니다.
- **다크/라이트 모드 지원**: 사용자 기본 테마를 따르거나 앱 내에서 테마를 설정합니다. (현재 기본 라이트 모드)

## 변환 로직 (Logic)
`src/constants/categories.js` 파일에서 각 카테고리별 변환 함수를 정의합니다.

### 예시: 통화(Currency) 변환
```javascript
{
  id: 'currency',
  name: 'Currency',
  icon: 'DollarSign',
  usUnit: 'USD',
  krUnit: 'KRW',
  convertUsToKr: (us, rate) => us * rate,
  convertKrToUs: (kr, rate) => kr / rate,
}
```

### 상태 변화 흐름
1. `setUsValue(val)` 호출
2. 현재 `selectedCategory`의 `convertUsToKr` 함수 실행
3. 계산된 값을 `krValue`로 업데이트하여 UI에 반영
