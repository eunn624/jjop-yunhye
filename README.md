# 쩝쩝윤혜 — H1 Interactive Prototype

가설 1 (컨텍스트 우선 위저드) 프로토타입.
랜딩 → 4단 위저드 (언제 · 인원 · 분위기 · 장르+예산+조건) → 결과 → 상세.

## 실행 방법

`index.html` 은 `src/*.jsx` 파일을 외부 스크립트로 불러오기 때문에
**`file://` 로 직접 열면 동작하지 않습니다** (CORS). 로컬 HTTP 서버로 띄워주세요.

PowerShell 기준 (택 1):

```powershell
cd C:\Users\eunn624\jjop-yunhye

# 1) 동봉된 Node 미니 서버 (의존성 없음, 검증 완료)
node _serve.js

# 2) npx serve
npx --yes serve -l 5173 .

# 3) Python (설치되어 있다면)
python -m http.server 5173
```

브라우저에서 http://localhost:5173 접속.

## 조작

- 마우스 클릭으로 진행
- `→` / `Enter` : 다음 단계
- `←` : 이전 단계
- `Esc` : 상세 → 결과 복귀

## 파일 구성

- `index.html` — 엔트리. React 18 + Babel standalone (UMD/CDN)
- `src/shared.jsx` — 마스코트(YunhyeMascot), 브랜드, FoodTile 등 공유 컴포넌트
- `src/proto-data.jsx` — 가게 12곳 mock 데이터 + 점수/랭킹 함수
- `src/proto-app.jsx` — 화면 상태 머신 (랜딩/Step1~4/Result/Detail) + App 루트
- `wds/colors_and_type.css` — Wanted Montage 디자인 토큰
