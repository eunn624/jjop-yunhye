// Shared components / mascots / branding for 먹숭이 prototype

// ───────── Mascot SVG (먹숭이 - a friendly monkey character) ─────────
// 팀비 회식 가이드 마스코트. 카드처럼 두툼한 둥근 머리, 양쪽 둥근 귀.

function MeoksungMascot({ size = 72, mood = "happy" }) {
  // mood: happy, hungry, sleepy, full, wink
  const eyes = {
    happy:  <g>
      <path d="M30 46 q4 -5 8 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M50 46 q4 -5 8 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>,
    hungry: <g>
      <circle cx="34" cy="48" r="3" fill="#1b1c1e"/>
      <circle cx="54" cy="48" r="3" fill="#1b1c1e"/>
      <circle cx="33" cy="47" r="1.1" fill="#fff"/>
      <circle cx="53" cy="47" r="1.1" fill="#fff"/>
    </g>,
    sleepy: <g>
      <path d="M30 48 h8" stroke="#1b1c1e" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M50 48 h8" stroke="#1b1c1e" strokeWidth="2.5" strokeLinecap="round"/>
    </g>,
    full:   <g>
      <path d="M28 46 q6 6 12 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M48 46 q6 6 12 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>,
    wink:   <g>
      <path d="M30 46 q4 -5 8 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M50 48 h8" stroke="#1b1c1e" strokeWidth="2.5" strokeLinecap="round"/>
    </g>,
  }[mood];

  const mouth = {
    happy:  <path d="M38 62 q6 5 12 0" stroke="#1b1c1e" strokeWidth="2.2" fill="#ff8090" strokeLinecap="round"/>,
    hungry: <ellipse cx="44" cy="64" rx="6" ry="5" fill="#ff5252"/>,
    sleepy: <path d="M40 64 q4 2 8 0" stroke="#1b1c1e" strokeWidth="2" fill="none" strokeLinecap="round"/>,
    full:   <path d="M38 64 q6 -4 12 0" stroke="#1b1c1e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    wink:   <path d="M38 62 q6 5 12 0" stroke="#1b1c1e" strokeWidth="2.2" fill="#ff8090" strokeLinecap="round"/>,
  }[mood];

  return (
    <svg className="mascot" width={size} height={size} viewBox="0 0 88 88" aria-hidden="true">
      {/* shadow */}
      <ellipse cx="44" cy="82" rx="22" ry="3" fill="rgba(0,0,0,0.08)"/>

      {/* ears (back) */}
      <ellipse cx="14" cy="40" rx="10" ry="11" fill="#8a5728"/>
      <ellipse cx="74" cy="40" rx="10" ry="11" fill="#8a5728"/>
      <ellipse cx="14" cy="42" rx="5" ry="6" fill="#f0c896"/>
      <ellipse cx="74" cy="42" rx="5" ry="6" fill="#f0c896"/>

      {/* head outline */}
      <ellipse cx="44" cy="46" rx="28" ry="28" fill="#a3702f"/>
      <ellipse cx="44" cy="46" rx="28" ry="28" fill="url(#monkeyShade)"/>

      {/* face plate (heart-ish) */}
      <path d="M22 50
               C 22 32, 44 28, 44 28
               C 44 28, 66 32, 66 50
               C 66 68, 44 72, 44 72
               C 44 72, 22 68, 22 50 Z" fill="#f5d7ad"/>

      {/* mouth area lighter */}
      <ellipse cx="44" cy="62" rx="14" ry="9" fill="#fbe9ce"/>

      {/* hair tuft */}
      <path d="M36 24 q3 -6 8 -3" stroke="#5a3818" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M48 24 q3 -4 6 -1" stroke="#5a3818" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

      {/* cheeks */}
      <circle cx="27" cy="58" r="3.5" fill="#ffa8b3" opacity="0.7"/>
      <circle cx="61" cy="58" r="3.5" fill="#ffa8b3" opacity="0.7"/>

      {/* eyes / mouth */}
      {eyes}

      {/* nose */}
      <ellipse cx="44" cy="56" rx="2.6" ry="1.8" fill="#5a3818"/>

      {mouth}

      <defs>
        <linearGradient id="monkeyShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.08"/>
          <stop offset="1" stopColor="#000" stopOpacity="0.18"/>
        </linearGradient>
      </defs>
    </svg>
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
