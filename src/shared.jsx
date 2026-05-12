// Shared components / mascots / branding for 쩝쩝윤혜 prototype

// ───────── Mascot SVGs (윤혜 - a friendly rice-bowl character) ─────────
// Two variants to differentiate branding:
//   - 쩝쩝윤혜 (A): playful rice-bowl mascot, cheeks pink, eating noises
//   - 판교한끼 (B): minimal monogram + utensil mark

function YunhyeMascot({ size = 72, mood = "happy" }) {
  // mood: happy, hungry, sleepy, full, wink
  const eyes = {
    happy:  <g><path d="M30 38 q4 -5 8 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M50 38 q4 -5 8 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/></g>,
    hungry: <g><circle cx="34" cy="40" r="2.5" fill="#1b1c1e"/><circle cx="54" cy="40" r="2.5" fill="#1b1c1e"/><circle cx="33" cy="39" r="1" fill="#fff"/><circle cx="53" cy="39" r="1" fill="#fff"/></g>,
    sleepy: <g><path d="M30 40 h8" stroke="#1b1c1e" strokeWidth="2.5" strokeLinecap="round"/><path d="M50 40 h8" stroke="#1b1c1e" strokeWidth="2.5" strokeLinecap="round"/></g>,
    full:   <g><path d="M28 38 q6 6 12 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M48 38 q6 6 12 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/></g>,
    wink:   <g><path d="M30 38 q4 -5 8 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M50 40 h8" stroke="#1b1c1e" strokeWidth="2.5" strokeLinecap="round"/></g>,
  }[mood];

  const mouth = {
    happy:  <path d="M38 50 q6 6 12 0" stroke="#1b1c1e" strokeWidth="2.5" fill="#ff7081" strokeLinecap="round"/>,
    hungry: <ellipse cx="44" cy="52" rx="6" ry="5" fill="#ff5252"/>,
    sleepy: <path d="M40 52 q4 2 8 0" stroke="#1b1c1e" strokeWidth="2" fill="none" strokeLinecap="round"/>,
    full:   <path d="M38 52 q6 -4 12 0" stroke="#1b1c1e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>,
    wink:   <path d="M38 50 q6 6 12 0" stroke="#1b1c1e" strokeWidth="2.5" fill="#ff7081" strokeLinecap="round"/>,
  }[mood];

  return (
    <svg className="mascot" width={size} height={size} viewBox="0 0 88 88" aria-hidden="true">
      {/* shadow */}
      <ellipse cx="44" cy="80" rx="22" ry="3" fill="rgba(0,0,0,0.08)"/>
      {/* bowl bottom */}
      <path d="M14 50 q0 26 30 26 t30 -26 z" fill="#1a4fcc"/>
      <path d="M14 50 q0 26 30 26 t30 -26 z" fill="url(#bowlShade)"/>
      {/* bowl rim */}
      <ellipse cx="44" cy="50" rx="30" ry="6" fill="#0040b3"/>
      <ellipse cx="44" cy="50" rx="30" ry="6" fill="none" stroke="#001a66" strokeWidth="0.5"/>
      {/* rice head */}
      <path d="M18 50 q0 -28 26 -28 t26 28 z" fill="#fff8e7"/>
      <path d="M18 50 q0 -28 26 -28 t26 28 z" fill="url(#riceShade)"/>
      {/* rice grains */}
      <ellipse cx="32" cy="32" rx="2.5" ry="1.5" fill="#fff" stroke="#e8d9b5" strokeWidth="0.4" transform="rotate(-20 32 32)"/>
      <ellipse cx="44" cy="26" rx="2.5" ry="1.5" fill="#fff" stroke="#e8d9b5" strokeWidth="0.4"/>
      <ellipse cx="56" cy="32" rx="2.5" ry="1.5" fill="#fff" stroke="#e8d9b5" strokeWidth="0.4" transform="rotate(20 56 32)"/>
      <ellipse cx="38" cy="22" rx="2" ry="1.2" fill="#fff" stroke="#e8d9b5" strokeWidth="0.4" transform="rotate(-10 38 22)"/>
      <ellipse cx="50" cy="22" rx="2" ry="1.2" fill="#fff" stroke="#e8d9b5" strokeWidth="0.4" transform="rotate(10 50 22)"/>
      {/* cheeks */}
      <circle cx="28" cy="46" r="3.5" fill="#ffb3bc" opacity="0.85"/>
      <circle cx="60" cy="46" r="3.5" fill="#ffb3bc" opacity="0.85"/>
      {/* face */}
      {eyes}
      {mouth}
      <defs>
        <linearGradient id="bowlShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0"/>
          <stop offset="1" stopColor="#000" stopOpacity="0.18"/>
        </linearGradient>
        <linearGradient id="riceShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0"/>
          <stop offset="1" stopColor="#d9c89f" stopOpacity="0.35"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

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
// Variant A: 쩝쩝윤혜 (mascot wordmark)
function BrandA({ size = 18 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)' }}>
      <YunhyeMascot size={size * 1.7} mood="wink" />
      <span style={{ fontWeight: 700, fontSize: size, letterSpacing: '-0.02em', color: '#1b1c1e' }}>
        쩝쩝<span style={{ color: '#0066FF' }}>윤혜</span>
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
  YunhyeMascot, Steam, BrandA, BrandB, Chrome, TopNav, FoodTile, Note,
});
