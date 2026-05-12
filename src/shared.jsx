// Shared components / mascots / branding for 먹숭이 prototype

// ───────── Mascot 이미지 (먹숭이) ─────────
// 실제 PNG 아트워크는 /cha-assets/ 에 있고, mood 별로 다른 파일을 가져온다.

const MEOKSUNG_FILES = {
  happy:     "cha_smail.png",      // 웃는 표정
  hungry:    "surprised.png",       // 놀란 큰 눈 (배고픔)
  sleepy:    "sad.png",             // 시무룩 (졸림/빈 상태)
  full:      "cha_default.png",     // 평온한 기본
  wink:      "winking.png",         // 윙크
  angry:     "angery.png",          // 화남 (필요시)
  default:   "cha_default.png",
};

function MeoksungMascot({ size = 72, mood = "happy" }) {
  const file = MEOKSUNG_FILES[mood] || MEOKSUNG_FILES.default;
  return (
    <img
      className="mascot"
      src={"cha-assets/" + file}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flex: "0 0 auto",
      }}
    />
  );
}

// 이전 이름 호환용 alias
const YunhyeMascot = MeoksungMascot;

// Steam puffs (for hot dish illustrations)
function Steam({ x = 0, y = 0, opacity = 0.6 }) {
  return (
    <g opacity={opacity}>
      <path d={`M${x} ${y} q-4 -8 0 -16 q4 -8 0 -16`} stroke="#c2c4c8" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d={`M${x+10} ${y+4} q-4 -8 0 -16 q4 -8 0 -16`} stroke="#c2c4c8" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </g>
  );
}

// ───────── Branding lockups ─────────
// Variant A: 먹숭이 (mascot wordmark)
function BrandA({ size = 18 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)' }}>
      <MeoksungMascot size={size * 1.7} mood="wink" />
      <span style={{ fontWeight: 700, fontSize: size, letterSpacing: '-0.02em', color: '#1b1c1e' }}>
        먹<span style={{ color: '#B07900' }}>숭이</span>
      </span>
    </span>
  );
}

// Variant B: 판교한끼 (clean wordmark with utensil glyph)
function BrandB({ size = 18, dark = false }) {
  const fg = dark ? '#f4f4f5' : '#1b1c1e';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)' }}>
      <svg width={size * 1.5} height={size * 1.5} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="8" fill="#0066FF"/>
        <path d="M11 8 v10 a3 3 0 0 0 3 3 v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M14 8 v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M21 8 c0 4 -2 6 -2 8 v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
      <span style={{ fontWeight: 700, fontSize: size, letterSpacing: '-0.02em', color: fg }}>
        판교<span style={{ color: '#0066FF' }}>한끼</span>
      </span>
    </span>
  );
}

// ───────── Browser chrome ─────────
function Chrome({ url = "jjop.nexon.internal", dark = false }) {
  return (
    <div className={"chrome" + (dark ? " dark" : "")}>
      <div className="dots"><b/><b/><b/></div>
      <div className="url">🔒 {url}</div>
      <div style={{ width: 36 }} />
    </div>
  );
}

// ───────── Top nav (in-frame) ─────────
function TopNav({ brand = "A", active = "추천", dark = false, mascotMood = "happy" }) {
  return (
    <div className={"topnav" + (dark ? " dark" : "")}>
      {brand === "A" ? <BrandA /> : <BrandB dark={dark}/>}
      <div className="navlinks">
        {["추천","제보 피드","제보하기","이번주 핫픽"].map(l => (
          <a key={l} className={l === active ? "active" : ""}>{l}</a>
        ))}
      </div>
      <div className="spacer"/>
      <div className="pill">
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00BF40' }}/>
        넥슨 판교 · 본사
      </div>
      <div className="avatar"/>
    </div>
  );
}

// Photo placeholder with food-color gradient
function FoodTile({ tone = "warm", h = 140, label }) {
  const tones = {
    warm:    "linear-gradient(135deg, #ffd6a8, #ff8b5c 70%, #d35400)",
    cool:    "linear-gradient(135deg, #cfe4ff, #6aa8ff 60%, #1a4fcc)",
    grilled: "linear-gradient(135deg, #f0c08c, #8b4513 60%, #3b1d0a)",
    veg:     "linear-gradient(135deg, #d8f3a8, #6dbf4f 60%, #2a6b1f)",
    seafood: "linear-gradient(135deg, #ddeaff, #5cbfff 50%, #0a5298)",
    night:   "linear-gradient(135deg, #2a2240, #6a3d8a 60%, #1a0d24)",
    soup:    "linear-gradient(135deg, #f5d68a, #d97c2b 60%, #6b2a0a)",
    izakaya: "linear-gradient(135deg, #f0a060, #7a3010 60%, #1a0a05)",
  };
  return (
    <div style={{
      width: '100%', height: h, borderRadius: 8, background: tones[tone] || tones.warm,
      position: 'relative', overflow: 'hidden', flex: '0 0 auto',
    }}>
      {/* subtle vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)' }}/>
      {label && (
        <div style={{ position: 'absolute', bottom: 8, left: 10, color: '#fff', fontSize: 11, fontWeight: 600,
          textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{label}</div>
      )}
    </div>
  );
}

// Postit / sticky note for design canvas
function Note({ children, w = 240 }) {
  return (
    <div style={{
      background: '#fef4a8', color: '#5a4a2a', padding: '10px 12px',
      borderRadius: 4, fontSize: 12, lineHeight: 1.5, width: w,
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      fontFamily: '-apple-system, "Segoe UI", sans-serif',
    }}>{children}</div>
  );
}

Object.assign(window, {
  MeoksungMascot, YunhyeMascot, Steam, BrandA, BrandB, Chrome, TopNav, FoodTile, Note,
});
