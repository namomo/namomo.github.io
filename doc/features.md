# 주요 기능 및 로직

Unit Bridge는 국가 및 규격 간 단위 차이를 즉각적으로 변환해 주며, 합리적인 소비를 돕기 위한 보조 도구를 제공합니다.

## 주요 기능
1. **단위 변환기 (Converter Mode)**
   - **양방향 단위 변환**: 사용자가 한쪽 값을 입력하면 계수와 최신 환율을 적용하여 반대쪽 값으로 실시간 자동 변환됩니다.
   - **실시간 환율 반영**: 주유비, 육류 가격 등 환율 연동 단위 변환 시 Frankfurter API에서 받아온 최신 USD/KRW 환율을 사용합니다.
   - **지원 카테고리**:
     - **주유비 (Gas Price)**: `$/gal` ↔ `원/L`
     - **육류 가격 (Meat/Weight)**: `$/lb` ↔ `원/100g`
     - **무게 (Weight)**: `lb` ↔ `kg`
     - **길이 (Length)**: `ft` ↔ `m`

2. **다중 환율 변환 (Currency Converter)**
   - 기준 통화(기본: KRW)와 관심 대상 통화 리스트(USD, JPY, EUR, GBP 등)를 지정하여 여러 국가의 환율을 한눈에 비교하고 동시에 변환할 수 있습니다.
   - 기준 통화를 변경하거나 타겟 국가를 동적으로 추가/제거할 수 있습니다.

3. **환율 변동 비교 (Exchange Trends Mode)**
   - 기존 환율 변환 화면과 분리된 별도 도구 화면으로, 금액 계산이 아니라 기준 화폐 대비 주요 통화의 상대적 흐름을 비교하는 데 초점을 둡니다.
   - 지원 기준 화폐 및 비교 대상은 `KRW`, `USD`, `JPY`, `CNY`, `EUR`, `GBP`입니다. 기준 화폐로 선택된 통화는 비교 대상에서 제외됩니다.
   - 기간은 `1개월`, `3개월`, `6개월`, `1년`, `3년`, `5년`을 지원합니다.
   - 짧은 기간은 일별, 1년은 주별, 3년 이상은 월별 데이터로 표현하여 장기 흐름을 쉽게 볼 수 있도록 합니다.
   - 그래프는 원시 환율값이 아니라 기간 시작점 대비 변동률(%)을 기준으로 그립니다. 통화별 환율 스케일이 크게 달라도 같은 축에서 강세/약세 흐름을 비교할 수 있습니다.
   - 보조 카드에는 현재 환율, 기간 변화율, 기간 내 최고/최저를 표시합니다.
   - 기준 금액은 통상적인 표시 관례를 반영합니다.
     - `KRW`: `1000 KRW` 기준
     - `JPY`: `100 JPY` 기준
     - 그 외 통화: `1` 단위 기준

4. **단위당 가격 계산기 (Unit Price Calculator Mode)**
   - 소비자가 대용량 상품이나 포장 수량이 다른 상품의 실질적인 가성비를 비교할 수 있도록 돕습니다.
   - 총 가격, 총 수량, 단위를 입력한 뒤, 비교 기준이 되는 단위(예: 100g, 100ml, 1개 등)를 설정하여 단위당 가격을 자동으로 산출합니다.
   - 무게(`g`, `kg`), 부피(`ml`, `L`), 개수(`개`, `박스`) 단위 그룹을 지원하며 그룹에 적합한 기준 단위로 자동 보정됩니다.

5. **사용자 환경 개선**
   - **반응형 레이아웃**: 데스크톱 환경에서는 영구 사이드바를 노출하고, 태블릿 및 모바일 기기 환경에서는 햄버거 메뉴 및 토글 드로워 방식으로 전환되어 기기별 최적화된 UI를 제공합니다.
   - **상태 영구 저장**: Zustand의 Persist 미들웨어를 통해 사용자가 설정한 다중 환율의 기준 통화 및 추가해 둔 대상 통화 목록이 브라우저 캐시에 영구 저장됩니다.

## 변환 로직 (Logic)

단위 변환을 처리하는 상세 수식과 계수는 `src/constants/categories.js`에 매직 넘버를 배제하여 정의되어 있습니다.

### 예시: 주유비(Gas Price) 변환 정의
```javascript
const LITERS_PER_GALLON = 3.78541; // 1 Gallon = 3.78541 Liters

{
  id: 'gas',
  name: '주유비 (Gas Price)',
  icon: 'Fuel',
  usUnit: '$/gal',
  krUnit: '원/L',
  usPrefix: '$',
  usSuffix: '/gal',
  krPrefix: '₩',
  krSuffix: '/L',
  convertUsToKr: (usVal, rate) => (usVal * rate) / LITERS_PER_GALLON,
  convertKrToUs: (krVal, rate) => (krVal * LITERS_PER_GALLON) / rate,
}
```

### 일반 단위 상태 변화 흐름 (양방향 변환)
1. **미국 단위 입력 시 (`setUsValue(val)`)**:
   - `selectedCategory.convertUsToKr(parseFloat(val), exchangeRate)`를 실행합니다.
   - 반환된 값을 소수점 둘째 자리(`toFixed(2)`)까지 포맷팅하여 `krValue` 상태로 업데이트합니다.
2. **한국 단위 입력 시 (`setKrValue(val)`)**:
   - `selectedCategory.convertKrToUs(parseFloat(val), exchangeRate)`를 실행합니다.
   - 반환된 값을 소수점 둘째 자리까지 포맷팅하여 `usValue` 상태로 업데이트합니다.

