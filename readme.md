# Unit Bridge 🌉

국가 간의 서로 다른 단위(환율, 무게, 길이, 온도 등)를 쉽고 빠르게 변환해주는 지능형 단위 변환 서비스입니다.

![App Preview](https://via.placeholder.com/800x450?text=Unit+Bridge+Preview)

## 🚀 주요 기능
- **실시간 환율**: Frankfurter API를 연동하여 최신 USD/KRW 환율 정보를 제공합니다.
- **다양한 단위 지원**: 무게(lb-kg), 길이(in-cm), 온도(°F-°C) 등 빈번하게 사용되는 단위를 한눈에 변환합니다.
- **직관적인 UI**: Material UI(MUI) 기반의 세련되고 반응형인 인터페이스를 제공합니다.
- **오프라인 우선**: 최근 조회한 환율 정보를 로컬 스토리지에 캐싱하여 네트워크 연결이 불안정해도 기능을 유지합니다.

## 🛠 사용 기술
- **Framework**: React 18, Vite
- **State**: Zustand
- **UI**: MUI v5, Lucide Icons
- **HTTP**: Axios

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

## 📄 라이선스
MIT License.
