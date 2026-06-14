# Unit Bridge 🌉

국가 간의 서로 다른 단위(주유비, 육류 무게당 가격, 무게, 길이, 다중 통화 환율 등)를 쉽고 빠르게 변환해주고 단위당 가격을 계산해주는 지능형 단위 변환 서비스입니다.

![링크](https://namomo.github.io/)

## 🚀 주요 기능
- **실시간 환율 및 다중 환율**: Frankfurter API를 연동하여 최신 환율 정보 및 다중 국가 간 환율 변환 기능을 제공합니다.
- **다양한 단위 변환**: 주유비($/gal - 원/L), 육류 가격($/lb - 원/100g), 무게(lb - kg), 길이(ft - m) 등 실생활에 필요한 유용한 단위를 한눈에 변환합니다.
- **단위당 가격 계산기**: 포장 단위나 용량이 다른 제품의 단위당 가격을 계산하여 실질적인 가성비를 비교할 수 있습니다.
- **직관적인 UI 및 반응형 디자인**: Material UI(MUI) 기반의 세련된 인터페이스로, 모바일과 데스크톱 화면 비율에 알맞게 자동 최적화됩니다.
- **오프라인 우선 (캐싱)**: 실시간 환율 및 설정 데이터(관심 국가 등)를 로컬 스토리지에 캐싱하여 네트워크가 불안정해도 기존 데이터를 활용할 수 있습니다.

## 🛠 사용 기술
- **Framework**: React 18, Vite
- **State**: Zustand (with Persist)
- **UI**: MUI v5, Lucide Icons
- **HTTP**: Fetch API (Native fetch)

## 📦 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

## 📖 상세 문서
자세한 기술 사양 및 아키텍처는 아래 문서를 참고하세요.
- [아키텍처 가이드](./doc/architecture.md)
- [기능 및 변환 로직](./doc/features.md)
- [API 및 연동 전략](./doc/api-integration.md)
- [개발 로드맵 & Todo 리스트](./todo.md)

## 📄 라이선스
MIT License.

