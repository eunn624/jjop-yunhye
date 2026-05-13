// 데이터 로딩 + 필터링 헬퍼
// 실데이터는 src/data/restaurants.json 에서 로드합니다.
// (가데이터는 모두 제거됨 — 첫 제보가 들어와야 화면에 표시됩니다.)

// 장르 → 카드 컬러 톤 매핑 (FoodTile 용)
const GENRE_TONE = {
  "한식": "warm",
  "일식": "cool",
  "중식": "soup",
  "양식": "warm",
  "아시안": "veg",
  "고기구이": "grilled",
  "해산물": "seafood",
  "분식·면": "soup",
  "튀김류": "warm",
  "뷔페": "izakaya",
};

// "2~4명", "5~10명", "11~20명", "20명+" 같은 라벨을 [min,max] 로 파싱
function parsePeopleRange(label) {
  if (!label) return [1, 99];
  const plus = label.match(/(\d+)\s*명?\s*\+/);
  if (plus) return [parseInt(plus[1], 10), 99];
  const range = label.match(/(\d+)\s*~\s*(\d+)/);
  if (range) return [parseInt(range[1], 10), parseInt(range[2], 10)];
  const single = label.match(/(\d+)/);
  if (single) return [parseInt(single[1], 10), parseInt(single[1], 10)];
  return [1, 99];
}

// "1~2만원", "~1만원", "3만원+" 같은 라벨을 [min,max] (만원 단위) 로 파싱
function parsePriceRange(label) {
  if (!label) return [0, 99];
  if (label.startsWith("~")) {
    const m = label.match(/~\s*(\d+)/);
    return m ? [0, parseInt(m[1], 10)] : [0, 99];
  }
  if (label.endsWith("+")) {
    const m = label.match(/(\d+)/);
    return m ? [parseInt(m[1], 10), 99] : [0, 99];
  }
  const range = label.match(/(\d+)\s*~\s*(\d+)/);
  if (range) return [parseInt(range[1], 10), parseInt(range[2], 10)];
  return [0, 99];
}

// 문자열 또는 배열(또는 비어있음)을 라벨 배열로 변환.
// "1~2만원, 3만원+" 처럼 쉼표로 구분된 문자열도 분해한다.
function toLabelArray(v) {
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  if (typeof v === "string") return v.split(/,\s*/).map(x => x.trim()).filter(Boolean);
  return [];
}

// 라벨 여러 개의 합집합 범위 — 최소 lo, 최대 hi
function unionRange(labels, parser, fallback) {
  if (!labels.length) return fallback;
  let lo = Infinity, hi = -Infinity;
  for (const l of labels) {
    const [a, b] = parser(l);
    if (a < lo) lo = a;
    if (b > hi) hi = b;
  }
  return [lo, hi];
}

// 제보 한 건을 카드에서 쓰기 좋은 형태로 정규화
function normalize(r) {
  const extras = Array.isArray(r.extras) ? r.extras : [];
  const peopleLabels = toLabelArray(r.people);
  const priceLabels = toLabelArray(r.priceRange);
  const [capMin, capMax] = unionRange(peopleLabels, parsePeopleRange, [1, 99]);
  const [priceMin, priceMax] = unionRange(priceLabels, parsePriceRange, [0, 99]);
  return {
    id: r.id || (r.submittedAt + "-" + (r.name || "")),
    name: r.name || "이름 없음",
    address: r.address || "",
    genre: r.genre || "기타",
    sub: r.sub || "",
    mood: r.mood || "",
    mealType: r.mealType || "lunch",
    // 표시용 — 항상 쉼표 결합된 문자열 (배열로 들어와도 카드/모달은 그대로 렌더)
    people: peopleLabels.join(", "),
    priceRange: priceLabels.join(", "),
    // 원본 라벨 배열 — 폼 수정/필터 매칭에서 사용
    peopleLabels,
    priceRangeLabels: priceLabels,
    extras,
    comment: r.comment || "",
    nickname: r.nickname || "익명",
    team: r.team || "",
    submittedAt: r.submittedAt || "",
    reports: typeof r.reports === "number" ? r.reports : 1,
    menu: Array.isArray(r.menu) ? r.menu : [],
    tone: r.tone || GENRE_TONE[r.genre] || "warm",
    thumbnail: r.thumbnail || "",
    naverLink: r.naverLink || "",
    naverCategory: r.naverCategory || "",
    capMin, capMax, priceMin, priceMax,
    hasRoom: extras.includes("룸/단체석") || extras.includes("room"),
    hasParking: extras.includes("주차 가능") || extras.includes("parking"),
    hasReserve: extras.includes("예약 가능") || extras.includes("reserve"),
    walkable: extras.includes("도보 10분 이내") || extras.includes("walk10"),
  };
}

function supportsMealType(r, mealType) {
  if (!mealType) return true;
  if (r.mealType === "both" || r.mealType === "all") return true;
  return r.mealType === mealType;
}

// 필터 적용 (글로벌 mealType + 위저드 필터)
// 위저드 입력은 제보 폼과 동일한 한국어 라벨을 사용한다:
//   - filters.people    : 버킷 라벨 배열 (예: ["2~4명 소수팀", "5~10명 팀회식"])
//   - filters.budget    : 가격 라벨 배열 (예: ["1~2만원", "3~5만원"])
//   - filters.conditions: 한국어 라벨 배열 ("도보 10분 이내", "주차 가능" 등)
function filterPlaces(places, filters) {
  const peopleArr = toLabelArray(filters.people);
  const budgetArr = toLabelArray(filters.budget);
  return places.filter(p => {
    if (!supportsMealType(p, filters.mealType)) return false;

    // 인원: 선택된 버킷 중 하나라도 가게의 수용 범위와 겹치면 통과
    if (peopleArr.length > 0) {
      const ok = peopleArr.some(label => {
        const [flo, fhi] = parsePeopleRange(label);
        return !(p.capMax < flo || p.capMin > fhi);
      });
      if (!ok) return false;
    }

    // (분위기/mood 필터는 의도적으로 제거 — 가게마다 mood 가 하나라 너무 좁아짐.
    //  점심/저녁 + 장르 위주로 매칭하기 위함.)

    // 장르: 선택된 것 중 하나라도 일치
    if (filters.genres && filters.genres.length > 0) {
      if (!filters.genres.includes(p.genre)) return false;
    }

    // 예산: 선택된 가격대 중 하나라도 가게의 가격 범위와 겹치면 통과
    if (budgetArr.length > 0) {
      const ok = budgetArr.some(label => {
        const [lo, hi] = parsePriceRange(label);
        return !(p.priceMax < lo || p.priceMin > hi);
      });
      if (!ok) return false;
    }

    // 조건: 폼의 extras 라벨과 1:1 매칭 (선택된 모든 조건이 포함되어야 함)
    if (filters.conditions && filters.conditions.length > 0) {
      const extras = p.extras || [];
      for (const c of filters.conditions) {
        if (!extras.includes(c)) return false;
      }
    }

    return true;
  });
}

// 핫픽: 제보수 내림차순
function sortByReports(places) {
  return [...places].sort((a, b) => (b.reports || 0) - (a.reports || 0));
}

// 최신순: submittedAt 내림차순
function sortByRecent(places) {
  return [...places].sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
}

// 이번주 신규 제보 수 (최근 7일)
function recentSubmissionCount(places) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return places.filter(p => {
    if (!p.submittedAt) return false;
    const t = Date.parse(p.submittedAt);
    return !isNaN(t) && t >= weekAgo;
  }).length;
}

window.dataHelpers = {
  normalize,
  filterPlaces,
  sortByReports,
  sortByRecent,
  recentSubmissionCount,
  parsePeopleRange,
  parsePriceRange,
  toLabelArray,
  GENRE_TONE,
};
