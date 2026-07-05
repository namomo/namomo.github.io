# 프로젝트 아키텍처

Unit Bridge는 React와 Vite를 기반으로 구축된 단위 변환 애플리케이션입니다.

## 기술 스택
- **Frontend**: React 18, Vite
- **UI Framework**: Material UI (MUI) v5
- **Styling**: Emotion
- **State Management**: Zustand (with Persist Middleware)
- **API Client**: Fetch API (Native fetch)
- **Icons**: Lucide React

## 디렉토리 구조
```text
/src
  /components     # UI 컴포넌트
    /converter    # 단위 및 다중 환율 변환 컴포넌트 (MainCard, CurrencySelector)
    /exchange-trends # 주요 통화 환율 변동 비교 페이지
    /layout       # 사이드바 등 레이아웃 컴포넌트
    /unit-price   # 단위당 가격 계산기 컴포넌트 (UnitPriceCalculator)
  /constants      # 카테고리 및 통화 코드 고정 데이터 (categories, currencies)
  /services       # 외부 API 연동 로직 (exchange-api)
  /stores         # Zustand 상태 저장소 (unit-store)
  App.jsx         # 메인 애플리케이션 컴포넌트 (레이아웃 구성 및 모드 전환)
  main.jsx        # 엔트리 포인트
```

## 화면 구성
별도 라우터는 사용하지 않고 Zustand의 `currentMode` 값으로 사이드바 기반 화면 전환을 처리합니다.

- `converter`: 단위 변환 및 다중 환율 변환
- `exchange-trends`: 주요 통화 환율 변동 비교
- `unit-price`: 단위당 가격 계산기

`exchange-trends`와 `unit-price` 화면은 `React.lazy`와 `Suspense`로 지연 로딩하여 초기 번들 부담을 줄입니다. Vite 빌드에서는 `manualChunks`로 React, MUI, 기타 vendor 청크를 분리합니다.

## 상태 관리 (Zustand)
`src/stores/unit-store.js` 파일에서 전체적인 상태를 관리하며, 일부 설정은 `localStorage`에 자동 유지(persist)됩니다.

### 주요 상태 및 데이터
- `currentMode`: 현재 모드 (`'converter'`, `'exchange-trends'`, `'unit-price'`)
- `selectedCategory`: 선택된 단위 변환 카테고리
- `exchangeRate`: 실시간 USD -> KRW 환율 정보
- `rateDate` / `updateTime`: API 데이터 날짜 및 실제 동기화된 시스템 시간
- `usValue` / `krValue`: 양방향 단위 변환 시 입력값 및 결과값
- `baseCurrency`: 다중 환율 변환 기준 통화 (기본값: `'KRW'`)
- `targetCurrencies`: 다중 환율 변환 대상 통화 목록 (기본값: `['USD', 'JPY', 'EUR', 'GBP']`)
- `baseAmount`: 다중 환율 변환에 쓰이는 기준 통화 금액
- `trendBaseCurrency`: 환율 변동 비교의 기준 통화
- `historicalRangeDays`: 환율 변동 비교 기간 (`30`, `90`, `180`, `365`, `1095`, `1825`)
- `historicalRates`: 환율 변동 비교용 히스토리 데이터
- `historicalStartDate` / `historicalEndDate`: 히스토리 데이터 기간
- `isHistoricalLoading`: 히스토리 API 통신 진행 여부
- `isRateLoading`: API 통신 진행 여부 상태

### 주요 액션 (Actions)
- `initialize`: 앱 실행 시 실시간 환율 정보를 불러오는 초기화 비동기 함수
- `setSelectedCategory`: 카테고리 전환 시 상태값 초기화
- `setUsValue` / `setKrValue`: 입력 시 반대쪽 국가 단위의 값을 즉시 변환하여 업데이트
- `setBaseCurrency` / `addTargetCurrency` / `removeTargetCurrency`: 다중 환율 변환의 기준 통화 및 관심 통화 리스트 관리 및 API 재호출
- `setBaseAmount`: 다중 환율 계산 시 금액 입력값 업데이트
- `setTrendBaseCurrency`: 환율 변동 비교 기준 통화 변경 및 히스토리 재조회
- `setHistoricalRangeDays`: 환율 변동 비교 기간 변경 및 히스토리 재조회
- `loadHistoricalRates`: 현재 기준 통화와 기간에 맞춰 히스토리 환율 데이터 조회
- `setCurrentMode`: 변환기, 환율 변동, 단위당 가격 계산기 모드 간 전환

