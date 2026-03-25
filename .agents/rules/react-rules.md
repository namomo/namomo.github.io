---
trigger: always_on
---

# 🧭 React 프로젝트 네이밍 컨벤션
> 이 문서는 React 기반 프로젝트에서 사용하는 **폴더, 파일, 컴포넌트, 함수 등**의 네이밍 규칙을 정의합니다.
> **운영체제(OS) 호환성**, **Git 충돌 방지**, **가독성 및 유지보수성 향상**을 목적으로 합니다.


## 🗂️ 1. 디렉토리 및 파일 구조
- **kebab-case** 사용 (`-` 하이픈으로 단어 구분)
- 모두 **소문자**
- **대소문자 혼용 금지** (Git + OS 충돌 방지 목적)

### 📁 예시
```text
/components
  /interface-write
    interface-write.jsx
    interface-write.service.jsx
    interface-write.actions.jsx
    interface-write.constants.jsx
```

## 🧱 2. 컴포넌트
- 파일명: `kebab-case`
- 컴포넌트명: `PascalCase`
- 디렉토리 단위로 캡슐화

```jsx
// 📄 interface-write.jsx
const InterfaceWrite = () => {
  return <div>...</div>;
};
export default InterfaceWrite;
```

## 🧩 3. 커스텀 훅
- 함수명: `camelCase`, 반드시 `use`로 시작
- 파일명: `use[기능].js`, `use[기능]Effect.js` 등

```text
useInterfaceWriteEffect.js
useSaveHandler.js
```


## 🗃️ 3-1. Zustand 상태 관리 (Store)
- 파일명: `[기능]-store.js`, `[도메인].store.js` 등
- 디렉토리 위치 예시: `/stores/` 또는 컴포넌트-컴포넌트 종속인 경우- 하위에 위치
- 상태 생성 함수는 `create[도메인]Store` 형태로 작성

```text
/stores
  └── interface-write-store.js
```

```js
// interface-write-store.js
import { create } from 'zustand';

const useInterfaceWriteStore = create((set) => ({
  formData: {},
  setFormData: (data) => set({ formData: data }),
}));

export default useInterfaceWriteStore;
```