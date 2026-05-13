# Apps Script 통합 — 좋아요 + 댓글 백엔드

`Code.gs` 는 Apps Script 편집기에 붙여넣을 코드의 저장소 스냅샷입니다. 실제 동작 코드는 Google 클라우드에 있으므로 이 파일을 수정해도 바로 반영되진 않습니다 — 편집기로 복사하고 재배포해야 됩니다.

## 통합 절차

1. `config.js` 의 `APPS_SCRIPT_URL` 가 가리키는 Apps Script 프로젝트를 엽니다.
2. 좌측 파일 목록에서 새 `.gs` 파일을 만들거나, 기존 `Code.gs` 를 열어 이 저장소의 `apps-script/Code.gs` 내용을 복사·붙여넣기.
   - **기존 스크립트가 이미 create/update/delete 처리를 하고 있다면**: `handleLike`, `aggregateLikes`, `doGet`, `ensureSheet` 만 추가하고, 기존 `doPost` 안에 `if (action === "like") return jsonOut(handleLike(payload));` 분기만 끼워 넣어도 됩니다.
3. **배포 → 새 배포** (또는 기존 배포 관리 → 새 버전):
   - 유형: **웹 앱**
   - 다음 사용자 인증: **본인 (나)**
   - 액세스: **모든 사용자 (익명 포함)** ← GET 응답이 CORS로 읽히려면 필수
4. 배포 후 URL이 바뀌었다면 `src/config.js` 의 `APPS_SCRIPT_URL` 도 업데이트.
5. 시트 화면에서 `Likes` 시트가 자동 생성되는지 확인 (`placeId | count | updatedAt`).

## 동작 확인

- `curl "<APPS_SCRIPT_URL>?what=all"` → `{"likes":{}, "comments":{}}` (초기 상태)
- 프론트엔드에서 하트 클릭 → `Likes` 시트에 row 추가 → 다음 새로고침 시 count 반영
- DetailModal에서 댓글 작성 → `Comments` 시트에 row 추가 → 다음 새로고침 시 표시
- 콘솔에서 `fetch('<URL>?what=all').then(r=>r.json()).then(console.log)` 로 직접 검증
- 편집기에서 `testLike`, `testComment` 함수 실행으로 백엔드 단독 동작 확인 가능

## 주의

- **GET 응답은 CORS 헤더 포함**: ContentService 의 JSON 출력은 `Access-Control-Allow-Origin: *` 가 자동 설정되므로 cross-origin fetch가 동작합니다. "본인만" 권한으로 배포하면 401이 떨어지니 익명 액세스로 두세요.
- **POST는 여전히 `no-cors`**: 응답을 못 읽기 때문에 프론트는 optimistic UI로 처리합니다. 다음 페이지 로드 시 GET 결과가 진실의 원본(source of truth).
- **race**: `handleLike` 는 `LockService.getScriptLock()` 로 보호되어 있어 동시 클릭 시에도 카운트가 꼬이지 않습니다.
- **delta 범위**: `+1` / `-1` 만 허용. 그 외 값은 모두 `+1` 로 캐스팅됩니다 (악의적 페이로드 방어).
