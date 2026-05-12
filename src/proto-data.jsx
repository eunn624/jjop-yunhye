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
  "채식 가능": "veg",
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

// 제보 한 건을 카드에서 쓰기 좋은 형태로 정규화
function normalize(r) {
  const extras = Array.isArray(r.extras) ? r.extras : [];
  const peopleRange = parsePeopleRange(r.people);
  const priceRange = parsePriceRange(r.priceRange);
  return {
    id: r.id || (r.submittedAt + "-" + (r.name || "")),
    name: r.name || "이름 없음",
    address: r.address || "",
    genre: r.genre || "기타",
    sub: r.sub || "",
    mood: r.mood || "",
    mealType: r.mealType || "lunch",
    people: r.people || "",
    priceRange: r.priceRange || "",
    extras,
    comment: r.comment || "",
    nickname: r.nickname || "익명",
    team: r.team || "",
    submittedAt: r.submittedAt || "",
    reports: typeof r.reports === "number" ? r.reports : 1,
    menu: Array.isArray(r.menu) ? r.menu : [],
    tone: r.tone || GENRE_TONE[r.genre] || "warm",
    capMin: peopleRange[0],
    capMax: peopleRange[1],
    priceMin: priceRange[0],
    priceMax: priceRange[1],
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
function filterPlaces(places, filters) {
  return places.filter(p => {
    if (!supportsMealType(p, filters.mealType)) return false;
    if (filters.people) {
      if (filters.people < p.capMin || filters.people > p.capMax) return false;
    }
    if (filters.mood && p.mood && filters.mood !== p.mood) return false;
    if (filters.genres && filters.genres.length > 0) {
      if (!filters.genres.includes(p.genre)) return false;
    }
    if (filters.budget) {
      const [lo, hi] = parsePriceRange(filters.budget);
      if (p.priceMax < lo || p.priceMin > hi) return false;
    }
    if (filters.conditions && filters.conditions.length > 0) {
      const condMap = {
        walk10: "walkable",
        parking: "hasParking",
        reserve: "hasReserve",
        room: "hasRoom",
      };
      for (const c of filters.conditions) {
        if (condMap[c] && !p[condMap[c]]) return false;
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
  GENRE_TONE,
};
