// 쩝쩝윤혜 — Google Apps Script 백엔드 (스냅샷)
//
// 이 파일은 저장소 안 스냅샷입니다. 실제 동작 코드는 Google Apps Script 편집기에 있으므로
// 변경 후엔 편집기에 복사·붙여넣기 → 새 버전 배포해야 반영됩니다.
//
// 시트 (없으면 자동 생성):
//   - "제보" : 신규 제보 raw 데이터 (수동 검토용)
//   - "Likes" : placeId별 좋아요 누적 카운트
//
// 엔드포인트:
//   - POST {action:"like", placeId, delta:+1|-1}
//   - POST {action:"update", id, patch}
//   - POST {action:"delete", id}
//   - POST {...신규 제보 필드}                  (action 없으면 create)
//   - GET  ?what=likes                       → { likes: { [placeId]: count } }
//
// 배포: 액세스를 "모든 사용자(익명 포함)"로 해야 GET이 CORS로 읽힙니다.

const GITHUB_TOKEN = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN")
  || "깃허브_토큰";
const REPO = "eunn624/jjop-yunhye";
const PATH = "src/data/restaurants.json";
const SHEET_ID = "1qrwhcoOpBuR7g6G7bL8aYGJtfSn0zVgYR-e8uGTDdR0";
const SHEET_NAME = "제보";
const ID_COL = 13; // M열

// 좋아요/댓글 시트 이름 — 외부 의존 없도록 함수가 직접 가져다 씀
function _likesSheetName() { return "Likes"; }
function _commentsSheetName() { return "Comments"; }

// 시트 셀에 쓰기 위한 직렬화: 배열은 ", " 결합, 그 외는 빈 문자열 안전 처리.
// (자바스크립트 배열을 그대로 appendRow에 넘기면 자바 브릿지가 toString 해서
//  "[Ljava.lang.Object;@..." 같은 문자열로 박힘.)
function _toCell(v) {
  if (Array.isArray(v)) return v.join(", ");
  return v == null ? "" : String(v);
}

// ───── 라우팅 ─────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "like")    return handleLike(data);
    if (data.action === "comment") return handleComment(data);
    if (data.action === "delete")  return handleDelete(data.id);
    if (data.action === "update")  return handleUpdate(data.id, data.patch);
    // 알 수 없는 action은 명시적 거부 — 오타나 신규 클라이언트의 미배포 액션이
    // 실수로 handleCreate 로 떨어져 제보 시트/GitHub JSON에 쓰레기 row가 박히는 것을 방지.
    if (data.action) {
      return jsonResponse({ ok: false, error: "unknown action: " + data.action });
    }
    return handleCreate(data);
  } catch (err) {
    Logger.log(err.toString());
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  const what = (e && e.parameter && e.parameter.what) || "all";
  if (what === "likes")    return jsonResponse({ likes: aggregateLikes() });
  if (what === "comments") return jsonResponse({ comments: aggregateComments() });
  if (what === "all")      return jsonResponse({ likes: aggregateLikes(), comments: aggregateComments() });
  return jsonResponse({ ok: false, error: "unknown what: " + what });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ───── 좋아요 ─────
// "Likes" 시트 컬럼: placeId | count | updatedAt

function ensureLikesSheet() {
  const name = _likesSheetName();
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(["placeId", "count", "updatedAt"]);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(["placeId", "count", "updatedAt"]);
  }
  return sheet;
}

function handleLike(payload) {
  const placeId = String(payload.placeId || "").trim();
  if (!placeId) throw new Error("placeId required");
  const delta = payload.delta === -1 ? -1 : 1;

  // 동시 클릭 race를 막기 위해 script lock 사용
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sheet = ensureLikesSheet();
    const data = sheet.getDataRange().getValues();
    let row = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === placeId) { row = i + 1; break; }
    }
    const now = new Date();
    let newCount;
    if (row === -1) {
      newCount = Math.max(0, delta);
      sheet.appendRow([placeId, newCount, now]);
    } else {
      const cur = Number(sheet.getRange(row, 2).getValue()) || 0;
      newCount = Math.max(0, cur + delta);
      sheet.getRange(row, 2, 1, 2).setValues([[newCount, now]]);
    }
    return jsonResponse({ ok: true, placeId: placeId, count: newCount });
  } finally {
    lock.releaseLock();
  }
}

function aggregateLikes() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(_likesSheetName());
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const out = {};
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0] || "").trim();
    const c = Number(data[i][1]);
    if (id && !isNaN(c) && c > 0) out[id] = c;
  }
  return out;
}

// ───── 댓글 ─────
// "Comments" 시트 컬럼: id | placeId | nickname | team | text | createdAt

function ensureCommentsSheet() {
  const name = _commentsSheetName();
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(["id", "placeId", "nickname", "team", "text", "createdAt"]);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(["id", "placeId", "nickname", "team", "text", "createdAt"]);
  }
  return sheet;
}

function handleComment(payload) {
  const placeId = String(payload.placeId || "").trim();
  if (!placeId) throw new Error("placeId required");
  const text = String(payload.text || "").trim();
  if (!text) throw new Error("text required");

  const id = String(payload.id || ("comment-" + Date.now())).trim();
  const nickname = String(payload.nickname || "익명").trim() || "익명";
  const team = String(payload.team || "").trim();
  const createdAt = payload.createdAt || new Date().toISOString();

  const sheet = ensureCommentsSheet();
  sheet.appendRow([id, placeId, nickname, team, text, createdAt]);
  return jsonResponse({ ok: true, id: id, placeId: placeId });
}

function aggregateComments() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(_commentsSheetName());
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const out = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = String(row[0] || "").trim();
    const placeId = String(row[1] || "").trim();
    if (!placeId) continue;
    const nickname = String(row[2] || "익명") || "익명";
    const team = String(row[3] || "");
    const text = String(row[4] || "").trim();
    if (!text) continue;
    const rawCreatedAt = row[5];
    const createdAt = rawCreatedAt instanceof Date
      ? rawCreatedAt.toISOString()
      : String(rawCreatedAt || "");
    if (!out[placeId]) out[placeId] = [];
    out[placeId].push({ id: id, nickname: nickname, team: team, text: text, createdAt: createdAt });
  }
  // placeId별로 시간순(오래된 게 먼저)
  Object.keys(out).forEach(function(k) {
    out[k].sort(function(a, b) {
      return (a.createdAt || "").localeCompare(b.createdAt || "");
    });
  });
  return out;
}

// ───── Create / Update / Delete ─────

function handleCreate(data) {
  const id = data.id || `restaurant-${Date.now()}`;
  const submittedAt = data.submittedAt || new Date().toISOString();
  const manualLink = (data.naverLink || "").trim();

  let entry = {
    id,
    name: data.name || "",
    address: data.address || "",
    genre: data.genre || "",
    mood: data.mood || "",
    mealType: data.mealType || "both",
    people: data.people || "",
    priceRange: data.priceRange || "",
    extras: data.extras || [],
    comment: data.comment || "",
    nickname: data.nickname || "익명",
    team: data.team || "",
    submittedAt,
    reports: 1,
  };

  // 수동 입력된 naverLink 가 있으면 enrich보다 우선
  if (manualLink) {
    entry.naverLink = manualLink;
    entry.naverLinkManual = true;
  }

  entry = enrichWithNaver(entry);

  // 1) 시트 — 배열 필드(people/priceRange/extras)는 _toCell 로 직렬화해서 넣어야
  //         자바 브릿지의 "[Ljava.lang.Object;@..." 폴백을 피할 수 있음
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  sheet.appendRow([
    submittedAt, entry.name, entry.address, entry.genre, entry.mood,
    entry.mealType, _toCell(entry.people), _toCell(entry.priceRange),
    _toCell(entry.extras), entry.comment, entry.nickname, entry.team,
    id,
  ]);

  // 2) JSON (중복 id 있으면 교체)
  const { current, sha } = fetchJson();
  const next = current.filter(p => p.id !== id).concat([entry]);
  commitJson(next, sha, `feat: 맛집 추가 - ${entry.name}`);

  return jsonResponse({ ok: true, id });
}

function handleUpdate(id, patch) {
  if (!id) throw new Error("id가 필요해요.");
  if (!patch || typeof patch !== "object") throw new Error("patch가 필요해요.");

  const { current, sha } = fetchJson();
  const idx = current.findIndex(p => p.id === id);
  if (idx < 0) throw new Error("해당 id 항목 없음: " + id);

  let merged = Object.assign({}, current[idx], patch, {
    id,
    submittedAt: new Date().toISOString(),
  });
  if (patch.hasOwnProperty("naverLink")) {
    const link = (patch.naverLink || "").trim();
    merged.naverLink = link;
    merged.naverLinkManual = link.length > 0;
  }

  // 이름/주소 바뀌었거나 enrichment 결과가 비어있으면 다시 채움
  if (patch.name || patch.address || !merged.naverLink || !merged.thumbnail) {
    merged = enrichWithNaver(merged);
  }

  current[idx] = merged;
  commitJson(current, sha, `update: ${merged.name}`);
  updateSheetRow(id, merged);

  return jsonResponse({ ok: true });
}

function handleDelete(id) {
  if (!id) throw new Error("id가 필요해요.");

  const { current, sha } = fetchJson();
  const target = current.find(p => p.id === id);
  if (!target) return jsonResponse({ ok: true, note: "이미 삭제됨" });
  const next = current.filter(p => p.id !== id);
  commitJson(next, sha, `delete: ${target.name}`);
  deleteSheetRow(id);

  return jsonResponse({ ok: true });
}

// ───── GitHub Helpers ─────

function fetchJson() {
  const res = UrlFetchApp.fetch(
    `https://api.github.com/repos/${REPO}/contents/${PATH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
  );
  const file = JSON.parse(res.getContentText());
  const arr = JSON.parse(
    Utilities.newBlob(Utilities.base64Decode(file.content)).getDataAsString()
  );
  return { current: Array.isArray(arr) ? arr : [], sha: file.sha };
}

function commitJson(arr, sha, message) {
  const jsonStr = JSON.stringify(arr, null, 2);
  const bytes = Utilities.newBlob(jsonStr, "text/plain", "UTF-8").getBytes();
  const encoded = Utilities.base64Encode(bytes);
  const res = UrlFetchApp.fetch(
    `https://api.github.com/repos/${REPO}/contents/${PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      payload: JSON.stringify({ message, content: encoded, sha }),
      muteHttpExceptions: true,
    }
  );
  Logger.log("PUT 응답: " + res.getResponseCode() + " " + res.getContentText().slice(0, 200));
}

// ───── Sheet Helpers ─────

function findSheetRowById(id) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return { sheet, row: -1 };
  const ids = sheet.getRange(1, ID_COL, lastRow, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return { sheet, row: i + 1 };
  }
  return { sheet, row: -1 };
}

function deleteSheetRow(id) {
  const { sheet, row } = findSheetRowById(id);
  if (row > 0) sheet.deleteRow(row);
}

function updateSheetRow(id, entry) {
  const { sheet, row } = findSheetRowById(id);
  if (row < 0) return;
  sheet.getRange(row, 1, 1, 13).setValues([[
    entry.submittedAt, entry.name, entry.address, entry.genre, entry.mood,
    entry.mealType, _toCell(entry.people), _toCell(entry.priceRange),
    _toCell(entry.extras), entry.comment, entry.nickname, entry.team,
    id,
  ]]);
}

// ════════════════════════════════════════════════════════
// Naver Enrichment
// ════════════════════════════════════════════════════════

function _naverHeaders() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("NAVER_CLIENT_ID");
  const secret = props.getProperty("NAVER_CLIENT_SECRET");
  if (!id || !secret) {
    Logger.log("Naver 키가 스크립트 속성에 없습니다.");
    return null;
  }
  return { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret };
}

function _naverLocalSearch(query, display, headers) {
  const q = encodeURIComponent(query);
  try {
    const res = UrlFetchApp.fetch(
      "https://openapi.naver.com/v1/search/local.json?query=" + q + "&display=" + display,
      { headers: headers, muteHttpExceptions: true }
    );
    if (res.getResponseCode() !== 200) {
      Logger.log("Naver Local " + res.getResponseCode() + ": " + res.getContentText().slice(0, 200));
      return [];
    }
    return JSON.parse(res.getContentText()).items || [];
  } catch (e) {
    Logger.log("_naverLocalSearch error: " + e);
    return [];
  }
}

// "경기 성남시 분당구 판교공원로1길 55" → ["경기","성남","분당","판교공원"]
function _extractRegionTokens(address) {
  if (!address) return [];
  const raw = address.match(/[가-힣]{2,}/g) || [];
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    let t = raw[i]
      .replace(/(특별시|광역시|특별자치시|특별자치도|도|시|군|구|동|읍|면|리|로|길)$/, "")
      .replace(/역$/, "");
    if (t.length >= 2) out.push(t);
  }
  return out;
}

// "경기도 성남시 분당구 ..." → "분당구"
function _extractDistrict(roadAddr) {
  if (!roadAddr) return "";
  const m = roadAddr.match(/[가-힣]+구\b/);
  return m ? m[0] : "";
}

function _pickByRegion(items, tokens) {
  if (items.length === 0) return null;
  if (tokens.length === 0) return items[0];
  let bestScore = 0;
  let best = null;
  for (let i = 0; i < items.length; i++) {
    const addr = (items[i].roadAddress || items[i].address || "");
    let score = 0;
    for (let j = 0; j < tokens.length; j++) {
      if (tokens[j] && addr.indexOf(tokens[j]) >= 0) score++;
    }
    if (score > bestScore) { bestScore = score; best = items[i]; }
  }
  return bestScore > 0 ? best : null;
}

// Local Search 매칭 — best item 또는 null
function _findNaverPlace(name, address) {
  const headers = _naverHeaders();
  if (!headers) return null;

  Logger.log("[_findNaverPlace] query='" + name + "'  filterBy='" + address + "'");
  const items = _naverLocalSearch(name, 5, headers);
  if (items.length === 0) {
    Logger.log("  → 후보 0개");
    return null;
  }

  Logger.log("  → 후보 " + items.length + "개:");
  items.forEach(function(it, i) {
    const t = (it.title || "").replace(/<[^>]+>/g, "");
    const a = it.roadAddress || it.address || "";
    Logger.log("     " + (i + 1) + ". " + t + " | " + a);
  });

  const tokens = _extractRegionTokens(address);
  Logger.log("  → 사용자 지역 토큰: [" + tokens.join(", ") + "]");

  const best = _pickByRegion(items, tokens);
  if (!best) {
    Logger.log("  → 지역 일치 결과 없음");
    return null;
  }

  best._cleanTitle = (best.title || "").replace(/<[^>]+>/g, "");
  best._roadAddr = best.roadAddress || best.address || "";
  best._cleanCategory = (best.category || "").split(">").pop().trim();
  Logger.log("  → 선택: " + best._cleanTitle + " | " + best._roadAddr);
  return best;
}

// 이미지 검색 — 사이즈/비율 필터링
function fetchNaverImage(query) {
  const headers = _naverHeaders();
  if (!headers) return "";
  const q = encodeURIComponent(query);
  try {
    const res = UrlFetchApp.fetch(
      "https://openapi.naver.com/v1/search/image?query=" + q +
        "&display=10&sort=sim&filter=large",
      { headers: headers, muteHttpExceptions: true }
    );
    if (res.getResponseCode() !== 200) {
      Logger.log("Naver Image " + res.getResponseCode() + ": " + res.getContentText().slice(0, 200));
      return "";
    }
    const items = JSON.parse(res.getContentText()).items || [];
    Logger.log("[fetchNaverImage] '" + query + "' 후보 " + items.length + "개");

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const w = parseInt(it.sizewidth, 10) || 0;
      const h = parseInt(it.sizeheight, 10) || 0;
      const ratio = w / (h || 1);
      Logger.log("  " + (i + 1) + ". " + w + "x" + h + " " + (it.link || "").slice(0, 80));
      if (w < 400 || h < 250) continue;       // 너무 작음 → skip (로고/아이콘)
      if (ratio < 0.5 || ratio > 2.5) continue; // 너무 가늘거나 길음 → skip (배너성)
      Logger.log("    ✓ 선택");
      return it.link;
    }
    Logger.log("  → 모든 후보 필터 미통과, 썸네일 비움 (더미 이미지보다 낫다)");
    return "";
  } catch (e) {
    Logger.log("fetchNaverImage error: " + e);
    return "";
  }
}

// 후방호환용
function fetchNaverPlace(name, address) {
  const place = _findNaverPlace(name, address);
  if (!place) return {};
  const mapQ = (place._cleanTitle + " " + place._roadAddr).trim();
  return {
    naverLink: "https://map.naver.com/p/search/" + encodeURIComponent(mapQ),
    naverCategory: place._cleanCategory,
  };
}

function enrichWithNaver(entry) {
  if (!entry || !entry.name) return entry;

  const place = _findNaverPlace(entry.name, entry.address);
  if (!place) {
    Logger.log("[enrich] '" + entry.name + "' 매칭 실패 → 변경 없음");
    return entry;
  }

  const district = _extractDistrict(place._roadAddr);

  // naverLink: 수동 입력이면 보존, 아니면 가게명 + 구단위로 자동 생성
  // (도로명주소 풀버전은 Naver 검색이 "조건에 맞는 업체 없음" 으로 떨어지는 경우 잦음)
  let naverLink;
  if (entry.naverLinkManual && entry.naverLink) {
    naverLink = entry.naverLink;
    Logger.log("[enrich] naverLink: (manual) " + naverLink);
  } else {
    const mapQ = (place._cleanTitle + (district ? " " + district : "")).trim();
    naverLink = "https://map.naver.com/p/search/" + encodeURIComponent(mapQ);
    Logger.log("[enrich] naverLink: (auto) " + naverLink);
  }

  // thumbnail: 정식 가게명 + 구단위로
  const imgQuery = (place._cleanTitle + (district ? " " + district : "")).trim();
  Logger.log("[enrich] image 쿼리: '" + imgQuery + "'");
  const thumbnail = fetchNaverImage(imgQuery);
  Logger.log("[enrich] thumbnail: " + (thumbnail || "(없음)"));

  return Object.assign({}, entry, {
    naverLink: naverLink,
    naverCategory: place._cleanCategory,
  }, thumbnail ? { thumbnail: thumbnail } : {});
}

// ════════════════════════════════════════════════════════
// 백필 & 테스트
// ════════════════════════════════════════════════════════

function backfillEnrichment() {
  const fetched = fetchJson();
  const updated = fetched.current.map(function(entry) {
    return enrichWithNaver(entry);
  });
  commitJson(updated, fetched.sha, "chore: naver enrichment 백필 v3");
}

function testEnrich() {
  const r = enrichWithNaver({
    name: "방아깐",
    address: "경기 성남시 분당구 판교공원로1길 55",
  });
  Logger.log(JSON.stringify(r, null, 2));
}

function debugOne() {
  const r = fetchNaverPlace("방아깐", "경기 성남시 분당구 판교공원로1길 55");
  Logger.log("최종 결과: " + JSON.stringify(r, null, 2));
}

function testWrite() {
  const r = handleCreate({
    id: `restaurant-${Date.now()}`,
    name: "테스트식당2",
    address: "판교역로 152",
    genre: "한식",
    mood: "quiet",
    mealType: "lunch",
    people: "2~4명",
    priceRange: "1~2만원",
    extras: ["도보 10분 이내"],
    comment: "테스트입니다",
    nickname: "테스터",
    team: "개발",
    submittedAt: new Date().toISOString(),
  });
  Logger.log(r.getContent());
}

function testUpdate() {
  const r = handleUpdate("restaurant-XXXXXXX", { comment: "코멘트 수정 테스트" });
  Logger.log(r.getContent());
}

function testDelete() {
  const r = handleDelete("restaurant-XXXXXXX");
  Logger.log(r.getContent());
}

// 이미 시트에 박힌 "[Ljava.lang.Object;@..." 같은 깨진 row를 JSON 기준으로 다시 칠하는 일회성 복구.
// 편집기에서 수동으로 한 번 실행하면 됨.
function repairSheetCellsFromJson() {
  const { current } = fetchJson();
  let fixed = 0;
  current.forEach(function(entry) {
    if (!entry || !entry.id) return;
    const found = findSheetRowById(entry.id);
    if (found.row < 0) return;
    updateSheetRow(entry.id, entry);
    fixed++;
  });
  Logger.log("repaired " + fixed + " rows from JSON");
}

// 좋아요 동작 확인용
function testLike() {
  const r = handleLike({ placeId: "restaurant-test", delta: 1 });
  Logger.log(r.getContent());
  Logger.log("aggregated: " + JSON.stringify(aggregateLikes()));
}

// 댓글 동작 확인용
function testComment() {
  const r = handleComment({
    placeId: "restaurant-test",
    nickname: "테스터",
    team: "QA",
    text: "댓글 동작 테스트",
  });
  Logger.log(r.getContent());
  Logger.log("aggregated: " + JSON.stringify(aggregateComments()));
}
