# 프로젝트 아키텍처

Unit Bridge는 React와 Vite를 기반으로 구축된 단위 변환 애플리케이션입니다.

## 기술 스택
- **Frontend**: React 18, Vite
- **UI Framework**: Material UI (MUI) v5
- **Styling**: Emotion
- **State Management**: Zustand
- **API Client**: Axios
- **Icons**: Lucide React

## 디렉토리 구조
```text
/src
  /components     # UI 컴포넌트
    /converter    # 변환 관련 메인 컴포넌트 (MainCard 등)
    /layout       # 헤더, 사이드바 등 레이아웃 컴포넌트
  /constants      # 카테고리 정의 및 고정 데이터
  /services       # 외부 API 연동 로직
  /stores         # Zustand 상태 저장소
  App.jsx         # 메인 애플리케이션 컴포넌트 및 테마 설정
  main.jsx        # 엔트리 포인트
```

## 상태 관리 (Zustand)
`src/stores/use-unit-store.js` 파일에서 전체적인 상태를 관리합니다.
- `selectedCategory`: 현재 선택된 변환 카테고리 (단위, 환율 등)
- `exchangeRate`: 실시간 환율 정보
- `usValue` / `krValue`: 사용자가 입력한 입력값 및 변환된 결과값
- `initialize`: 앱 시작 시 환율 정보를 불러오는 초기화 함수
