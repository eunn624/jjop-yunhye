// Mock data + scoring for the H1 prototype.
// 12 places — enough variety to demonstrate real filtering.

const PLACES = [
  { id: "hanchon",    name: "한촌설렁탕 판교점", genre: "한식", sub: "설렁탕·곰탕",
    tone: "soup", dist: 6, lunch: 1.2, dinner: 1.8, capMin: 2, capMax: 16,
    moods: ["quiet","formal"], modes: ["lunch","dinner"], room: false, parking: true, reserve: true,
    end: "21:30", alcohol: false,
    reports: 47, comment: "회식 전 가볍게, 12시 전 가면 안 막힘",
    by: "쩝쩝박사", team: "개발", menu: ["설렁탕","수육"] },
  { id: "obanjang",   name: "오반장 판교", genre: "한식", sub: "백반",
    tone: "warm", dist: 4, lunch: 1.1, dinner: 1.5, capMin: 2, capMax: 12,
    moods: ["quiet","social"], modes: ["lunch","dinner"], room: false, parking: false, reserve: false,
    end: "21:00", alcohol: false,
    reports: 32, comment: "백반인데 일식집 같음 - 정갈한 분위기",
    by: "회식러J", team: "기획", menu: ["정식","제육"] },
  { id: "matsumoto",  name: "스시 마쯔모토", genre: "일식", sub: "스시·오마카세",
    tone: "cool", dist: 8, lunch: 1.8, dinner: 4.5, capMin: 2, capMax: 8,
    moods: ["quiet","formal"], modes: ["lunch","dinner"], room: true, parking: true, reserve: true,
    end: "22:00", alcohol: true,
    reports: 28, comment: "런치 오마카세 조용함, 회식 후일담 나누기 좋음",
    by: "윤대리", team: "아트", menu: ["런치 오마카세","사케"] },
  { id: "poke",       name: "포케 데이즈 판교", genre: "양식", sub: "포케볼·샐러드",
    tone: "veg", dist: 5, lunch: 1.3, dinner: 1.5, capMin: 1, capMax: 6,
    moods: ["quiet","casual"], modes: ["lunch"], room: false, parking: false, reserve: false,
    end: "20:00", alcohol: false,
    reports: 18, comment: "12시 30분 이후 가면 안 막힘. 채식 옵션 풍부",
    by: "윤대리", team: "아트", menu: ["참치 포케","연어 포케"] },
  { id: "chidong",    name: "치동궁 신관", genre: "중식", sub: "정통 중식·코스",
    tone: "warm", dist: 5, lunch: 0.9, dinner: 3.8, capMin: 4, capMax: 20,
    moods: ["social","casual"], modes: ["lunch","dinner"], room: true, parking: true, reserve: true,
    end: "22:30", alcohol: true,
    reports: 41, comment: "12명 룸 있고 짜장면도 코스 끝에 나옴. 신입환영회 가성비 갑",
    by: "쩝쩝박사", team: "개발", menu: ["코스 B","탕수육"] },
  { id: "shinku",     name: "신쿠 라멘", genre: "일식", sub: "라멘",
    tone: "soup", dist: 7, lunch: 1.2, dinner: 1.4, capMin: 1, capMax: 4,
    moods: ["quiet"], modes: ["lunch"], room: false, parking: false, reserve: false,
    end: "21:00", alcohol: false,
    reports: 22, comment: "줄 짧고 회전 빠름. 12시 5분 이전 골든타임",
    by: "신입k", team: "QA", menu: ["돈코츠","쇼유"] },
  { id: "okdoenjang", name: "옥된장",     genre: "한식", sub: "찌개·구이",
    tone: "grilled", dist: 9, lunch: 1.0, dinner: 1.8, capMin: 2, capMax: 8,
    moods: ["quiet","social"], modes: ["lunch","dinner"], room: false, parking: true, reserve: false,
    end: "22:00", alcohol: true,
    reports: 19, comment: "된장찌개 맛집. 점심 회식 후 시간 안 잡아먹음",
    by: "팀장님", team: "개발", menu: ["된장찌개","제육"] },
  { id: "pho",        name: "PHO 30",    genre: "아시안", sub: "베트남 쌀국수",
    tone: "veg", dist: 6, lunch: 1.1, dinner: 1.3, capMin: 1, capMax: 6,
    moods: ["quiet","casual"], modes: ["lunch"], room: false, parking: false, reserve: false,
    end: "21:00", alcohol: false,
    reports: 14, comment: "양 많고 빠르게 나옴. 채식 옵션도 있음",
    by: "회식러J", team: "기획", menu: ["양지쌀국수","스프링롤"] },
  { id: "solmiga",    name: "솔미가",     genre: "한식", sub: "한정식",
    tone: "izakaya", dist: 11, lunch: 2.2, dinner: 4.5, capMin: 6, capMax: 16,
    moods: ["formal","social"], modes: ["dinner"], room: true, parking: true, reserve: true,
    end: "23:00", alcohol: true,
    reports: 38, comment: "16인 룸이 진짜 있음. 부서 전체 회식의 최후의 보루",
    by: "팀장님", team: "경영", menu: ["코스","와인"] },
  { id: "majang",     name: "마장한우 본점", genre: "고기구이", sub: "한우",
    tone: "grilled", dist: 8, lunch: 2.5, dinner: 5.5, capMin: 4, capMax: 20,
    moods: ["social","casual","formal"], modes: ["dinner"], room: true, parking: true, reserve: true,
    end: "23:30", alcohol: true,
    reports: 52, comment: "법카 쓸 거면 여기. 룸 4×4 = 16 가능",
    by: "쩝쩝박사", team: "개발", menu: ["꽃등심","갈비살"] },
  { id: "kanga",      name: "강가 한정식", genre: "한식", sub: "한정식·코스",
    tone: "izakaya", dist: 10, lunch: 2.8, dinner: 4.8, capMin: 4, capMax: 12,
    moods: ["formal"], modes: ["dinner"], room: true, parking: true, reserve: true,
    end: "22:30", alcohol: true,
    reports: 29, comment: "임원 미팅 안전빵. 4인룸 두개 붙여 8명",
    by: "회식러J", team: "기획", menu: ["한정식 코스"] },
  { id: "udae",       name: "우대갈비 판교", genre: "고기구이", sub: "갈비·소주",
    tone: "izakaya", dist: 9, lunch: 1.8, dinner: 3.5, capMin: 4, capMax: 18,
    moods: ["social","casual"], modes: ["dinner"], room: false, parking: true, reserve: true,
    end: "24:00", alcohol: true,
    reports: 36, comment: "왁자지껄. 2차 안 가도 될 만큼 오래 머물 수 있음",
    by: "쩝쩝박사", team: "개발", menu: ["우대갈비","된장찌개"] },
];

// Score a place against current filter selections.
// Returns { score, reasons[] } where reasons populate the "왜 추천됐는지" chips.
function scorePlace(p, f) {
  let score = 0;
  const reasons = [];

  // Mode hard filter — must support selected mode
  if (!p.modes.includes(f.mode)) return { score: -999, reasons: [] };
  score += 20;

  // People count
  if (f.people >= p.capMin && f.people <= p.capMax) {
    score += 15;
    if (f.people >= 8 && p.room) {
      score += 10;
      reasons.push(`${f.people}명 룸 가능`);
    } else if (f.people <= 4) {
      reasons.push(`소수 ${f.people}명에 딱`);
    }
  } else {
    score -= 30;
  }

  // Mood match
  if (p.moods.includes(f.mood)) {
    score += 25;
    const moodLabel = { quiet: "조용한 분위기", social: "수다 위주", formal: "격식 자리", casual: "캐주얼" }[f.mood];
    reasons.push(`${moodLabel}에 어울림`);
  }

  // Genre — bonus if matched, neutral if none selected
  if (f.genres.length > 0) {
    if (f.genres.includes(p.genre)) {
      score += 20;
    } else {
      score -= 15;
    }
  }

  // Distance
  if (f.conditions.includes("walk10") && p.dist <= 10) {
    score += 8;
    if (p.dist <= 6) reasons.push(`도보 ${p.dist}분 가까움`);
  }
  if (f.conditions.includes("walk10") && p.dist > 10) score -= 10;
  if (f.conditions.includes("parking") && !p.parking) score -= 15;
  if (f.conditions.includes("reserve") && !p.reserve) score -= 10;
  if (f.conditions.includes("room") && !p.room) score -= 20;
  if (f.conditions.includes("room") && p.room) reasons.push("룸 보유");

  // Price bucket
  const price = f.mode === "lunch" ? p.lunch : p.dinner;
  const budgetMap = { "u1": [0, 1], "1-2": [1, 2], "2-3": [2, 3], "3+": [3, 99] };
  if (f.budget && budgetMap[f.budget]) {
    const [lo, hi] = budgetMap[f.budget];
    if (price >= lo && price <= hi) score += 12;
    else if (price > hi) score -= 8;
  }

  // Report popularity (small boost)
  score += Math.min(p.reports / 8, 8);

  // Pad reasons to at least 2
  if (reasons.length < 2 && p.modes.includes(f.mode)) {
    reasons.push(`동료 ${p.reports}명 제보`);
  }

  return { score, reasons: reasons.slice(0, 3) };
}

function rankPlaces(filters) {
  return PLACES
    .map(p => ({ p, ...scorePlace(p, filters) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

window.PLACES = PLACES;
window.scorePlace = scorePlace;
window.rankPlaces = rankPlaces;
