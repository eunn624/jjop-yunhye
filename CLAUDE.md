# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

넥슨 판교 직원용 맛집 추천 웹서비스 "쩝쩝윤혜". React 18 + Babel standalone을 CDN에서 직접 로드하는 **빌드 없는** SPA로, Vercel에 정적 배포된다.

## 개발 명령

빌드 단계가 없고 패키지도 없다. 변경 사항은 브라우저 새로고침으로 바로 반영된다.

```powershell
cd C:\Users\eunn624\jjop-yunhye

# 권장: 동봉된 미니 서버 (의존성 없음)
node _serve.js              # → http://localhost:5173

# 대안
npx --yes serve -l 5173 .
python -m http.server 5173
```

`file://` 로 직접 열면 동작하지 않는다 (CORS로 인해 외부 .jsx 스크립트가 차단됨).

테스트 프레임워크는 없다. 검증은 브라우저에서 직접 한다.

## 아키텍처

### 스크립트 로딩 순서

`index.html`이 4개 스크립트를 순서대로 로드한다. **이 순서는 의존성 때문에 고정**이다:

1. `src/config.js` — 평문 JS. `window.APP_CONFIG.APPS_SCRIPT_URL` (제보 폼 제출처) 등 런타임 설정 노출
2. `src/shared.jsx` — 마스코트(`YunhyeMascot`), 브랜드 로고, `FoodTile` 등 공유 컴포넌트를 `window`에 부착
3. `src/proto-data.jsx` — 데이터 정규화/필터/정렬 헬퍼를 `window.dataHelpers` 로 노출
4. `src/proto-app.jsx` — 루트 `App` 컴포넌트. 위 셋을 전역에서 참조한다

ES 모듈을 사용하지 않으므로 컴포넌트 간 공유는 **`window` 부착 + 전역 참조** 패턴이다. 새 모듈을 추가할 때 같은 규약을 따른다.

### 글로벌 상태 (proto-app.jsx의 `App`)

상태는 `App`에 집중되어 있고 prop drilling으로 내려간다:

- `tab` — 4개 탭 중 현재 (`추천` / `제보 피드` / `제보하기` / `이번주 핫픽`)
- `recScreen` — `추천` 탭 내부의 마이크로 라우터 (`landing` → `step1` → `step2` → `step3` → `result`)
- `mealType` — `lunch` / `dinner`. **글로벌 토글이며 상단 네비 우측에 항상 존재**. 모든 탭에서 데이터 필터링과 테마(`app-shell.theme-dinner` 클래스)를 좌우한다
- `filters` — 위저드 답변 (`people`, `mood`, `genres[]`, `budget`, `conditions[]`)
- `places` — `src/data/restaurants.json`에서 fetch한 정규화된 배열
- `detailId` — 설정되어 있으면 `DetailModal` 오버레이가 렌더링됨

### 데이터 흐름

```
src/data/restaurants.json (커밋된 정적 데이터, 초기값 [])
      ↓ fetch on mount
window.dataHelpers.normalize() — 원본 → 카드용 필드 (capMin/Max, hasRoom, tone 등) 파생
      ↓
filterPlaces / sortByReports / sortByRecent — 탭별로 다른 헬퍼 사용
```

`restaurants.json`은 절대 코드에서 빌드되지 않는다. 제보 폼이 Google Apps Script로 POST하면 Sheets에 쌓이고, **수동 검토 후 JSON에 항목 추가**하는 워크플로우다. 가데이터 추가 금지 — 빈 상태(`EmptyState`)가 의도된 UX다.

### 제보 폼 → Sheets

`ReportForm`이 `window.APP_CONFIG.APPS_SCRIPT_URL` 로 `fetch(..., { mode: "no-cors" })` POST 한다. `no-cors` 때문에 응답을 읽을 수 없어 성공/실패는 네트워크 오류 여부로만 판단한다. URL이 placeholder(`"여기에_URL_입력"`)면 의도적으로 에러 토스트를 띄운다.

전송 필드: `name, address, genre, mood, mealType, people, priceRange, extras, comment, nickname, team, submittedAt`. `restaurants.json`의 entry 스키마도 동일해야 `normalize()`가 깔끔하게 통과한다.

### 정규화 규칙 (`proto-data.jsx`)

폼에서 한국어 라벨로 들어온 값들을 카드 렌더링에 필요한 형태로 변환한다:

- `people`: `"2~4명 소수팀"` → `capMin/capMax` 숫자 파싱
- `priceRange`: `"1~2만원"`, `"~1만원"`, `"3만원+"` → `priceMin/priceMax`
- `extras`: 라벨 배열에서 `hasRoom`, `hasParking`, `hasReserve`, `walkable` 부울 파생 (한국어/영문 키 모두 인식)
- `genre`: `GENRE_TONE` 맵으로 `FoodTile`의 색 톤 결정

폼 옵션 라벨을 수정하면 normalize 파싱도 같이 손봐야 한다.

### 테마

`mealType` 토글이 `app-shell` 루트 클래스 `theme-lunch` / `theme-dinner`를 전환한다. dinner 테마는 `index.html`의 `<style>` 안에 `.app-shell.theme-dinner ...` 셀렉터들로 정의되어 있다 (어두운 톱바 + 따뜻한 배경). 새 테마 토큰을 추가하려면 인라인 style이 아닌 거기에 추가한다.

## Vercel 배포

`vercel.json`이 `.jsx` 파일에 `Content-Type: text/babel`을 강제한다 — Babel standalone이 처리하려면 필수. JSX 파일 위치를 옮기면 `source` 패턴도 같이 수정한다. `bgm.mp3` 같은 큰 정적 자산은 `.vercelignore`로 차단된다.

## 컨벤션

- 인라인 `style={{...}}` 이 지배적이다. 글로벌 CSS는 `index.html`의 `<style>` 블록과 `wds/colors_and_type.css` 디자인 토큰뿐. 작은 일회성 스타일은 인라인 유지, 재사용 가능한 패턴(meal-toggle, modal-*, opt-card 등)만 글로벌로 올린다
- 모든 사용자 텍스트는 한국어. 코드 주석/식별자도 한국어 혼용
- 가데이터 절대 추가 금지 — 빈 상태가 의도된 디자인이다
