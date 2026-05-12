// H1 Interactive Prototype — fully working state machine
// Screens: landing → step1(mode) → step2(people) → step3(mood) → step4(genre+budget+cond)
//          → result → detail (with back to result, back to start)

const { useState, useEffect, useMemo, useRef } = React;

// ───────── Toast ─────────
function useToast() {
  const [msg, setMsg] = useState(null);
  const tref = useRef();
  function show(text) {
    setMsg(text);
    clearTimeout(tref.current);
    tref.current = setTimeout(() => setMsg(null), 2200);
  }
  const el = msg ? <div className="toast"><span>✓</span>{msg}</div> : null;
  return [el, show];
}

// ───────── Top nav ─────────
function TopNav({ onHome, active = "추천" }) {
  return (
    <div className="topnav">
      <span onClick={onHome} style={{ cursor: 'pointer' }}><BrandA/></span>
      <div className="navlinks">
        {["추천","제보 피드","제보하기","이번주 핫픽"].map(l => (
          <a key={l} className={l === active ? "active" : ""} onClick={l === "추천" ? onHome : undefined}>{l}</a>
        ))}
      </div>
      <div className="spacer"/>
      <span className="pill">
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00BF40' }}/>
        넥슨 판교 · 본사
      </span>
      <div className="avatar"/>
    </div>
  );
}

// ───────── Step indicator ─────────
function Stepper({ step }) {
  const labels = ["언제", "인원", "분위기", "장르"];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
      {labels.map((l, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "now" : "todo";
        return (
          <React.Fragment key={l}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: state === "now" ? '#0066FF' : state === "done" ? '#37383c' : '#aeb0b6',
              fontWeight: state === "now" ? 600 : 500, fontSize: 13,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: state === "now" ? '#0066FF' : state === "done" ? '#37383c' : '#e1e2e4',
                color: state !== "todo" ? '#fff' : '#878a93',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, transition: 'all .25s',
              }}>{state === "done" ? '✓' : n}</div>
              {l}
            </div>
            {i < labels.length - 1 && <div style={{ width: 28, height: 1, background: '#e1e2e4' }}/>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ───────── Mascot + speech bubble row ─────────
function MascotSay({ mood = "happy", children, size = 64 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
      <YunhyeMascot size={size} mood={mood}/>
      <div className="bubble" style={{ maxWidth: 480 }}>{children}</div>
    </div>
  );
}

// ───────── Step transition wrapper ─────────
function StepFade({ stepKey, children }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(false);
    const t = setTimeout(() => setShown(true), 30);
    return () => clearTimeout(t);
  }, [stepKey]);
  return (
    <div className={shown ? "step-shown" : "step-enter"} key={stepKey}>
      {children}
    </div>
  );
}

// ───────── LANDING ─────────
function Landing({ onStart }) {
  return (
    <div style={{ background: '#f7f7f8', minHeight: '100%', padding: '64px 80px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 64 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#0066FF', fontWeight: 600, marginBottom: 16 }}>
            오늘 회식 장소, 윤혜가 골라드림
          </div>
          <h1 style={{ font: 'var(--text-display-2)', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: 1.1 }}>
            뭐 먹지<span style={{ color: '#0066FF' }}>?</span><br/>
            <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: 32, fontWeight: 500 }}>
              그 질문, 마지막에 할게요.
            </span>
          </h1>
          <p style={{ color: '#46474c', fontSize: 16, lineHeight: 1.65, margin: '0 0 32px', maxWidth: 440 }}>
            누구랑, 어떤 분위기로 가는지부터 알려주세요.<br/>
            넥슨 동료 1,284명이 제보한 곳 중에서<br/>
            <b>4번의 질문</b>으로 찾아드려요.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={onStart}>윤혜한테 물어보기 →</button>
            <button className="btn-ghost" onClick={onStart}>그냥 둘러볼래요</button>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 40, fontSize: 13, color: '#70737c' }}>
            <span>⏱ 평균 38초</span>
            <span>· 등록 가게 287곳</span>
            <span>· 이번주 신규 제보 12건</span>
          </div>
        </div>
        <div style={{ flex: '0 0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -8, right: -16, background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '8px 14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: 13, fontWeight: 500 }}>
            어디갈까~ 🍚
          </div>
          <YunhyeMascot size={260} mood="happy"/>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: '56px auto 0', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 28 }}>
        <div style={{ fontSize: 12, color: '#70737c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          지난주 가장 많이 결정된 조합
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            "점심 · 4명 · 빠릿하게 · 한식",
            "저녁 · 12명 · 왁자지껄 · 고기구이",
            "점심 · 2명 · 조용히 · 일식",
            "저녁 · 8명 · 격식 · 한정식",
          ].map(s => <span key={s} className="chip" onClick={onStart}>{s}</span>)}
        </div>
      </div>
    </div>
  );
}

// ───────── STEP 1: mode ─────────
function Step1({ filters, set, next }) {
  const opts = [
    { id: "lunch",  ico: "🌞", title: "점심", desc: "도보 10분, 회전 빠른 곳 · 대기시간 · 메뉴 사진 위주" },
    { id: "dinner", ico: "🌙", title: "저녁", desc: "술 가능, 룸/단체석 · 영업 종료 · 2차 연계" },
  ];
  return (
    <div style={{ padding: '48px 80px', maxWidth: 720, margin: '0 auto' }}>
      <Stepper step={1}/>
      <MascotSay mood="hungry">안녕! 윤혜야. 먼저 — <b>언제 가는 거</b>예요?</MascotSay>
      <h2 style={{ font: 'var(--text-h1)', margin: '24px 0 8px', letterSpacing: '-0.01em' }}>
        점심이에요, 저녁이에요?
      </h2>
      <p style={{ color: '#70737c', margin: '0 0 32px' }}>
        술 가능 여부, 도보 거리, 영업 시간이 완전히 달라져요.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {opts.map(o => {
          const on = filters.mode === o.id;
          return (
            <div key={o.id} className="opt-card" onClick={() => set({ mode: o.id })}
              style={{
                border: on ? '2px solid #0066FF' : '1px solid rgba(0,0,0,0.1)',
                background: on ? 'linear-gradient(180deg, #fffceb 0%, #fff 80%)' : '#fafafb',
                borderRadius: 16, padding: '28px 24px', cursor: 'pointer', position: 'relative',
              }}>
              {on && <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22,
                borderRadius: '50%', background: '#0066FF', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>}
              <div style={{ fontSize: 38, marginBottom: 8, opacity: on ? 1 : 0.7 }}>{o.ico}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{o.title}</div>
              <div style={{ fontSize: 13, color: '#70737c', lineHeight: 1.5 }}>{o.desc}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, alignItems: 'center' }}>
        <div style={{ width: 1 }}/>
        <div style={{ fontSize: 13, color: '#aeb0b6' }}>Enter 또는 → 키로 다음</div>
        <button className="btn-primary" onClick={next} disabled={!filters.mode}>다음 →</button>
      </div>
    </div>
  );
}

// ───────── STEP 2: people ─────────
function Step2({ filters, set, next, back }) {
  const presets = [
    { l: "2~4명 소수팀",  p: 3, range: [2, 4] },
    { l: "5~10명 팀회식", p: 6, range: [5, 10] },
    { l: "11~20명 부서",  p: 14, range: [11, 20] },
    { l: "20명+ 대규모",  p: 24, range: [21, 50] },
  ];
  const max = 30;
  const pct = Math.min(100, Math.max(0, ((filters.people - 1) / (max - 1)) * 100));
  const presetActive = presets.findIndex(p => filters.people >= p.range[0] && filters.people <= p.range[1]);

  let hint = "";
  if (filters.people <= 4) hint = "💡 소수 팀에 안성맞춤. 룸 없어도 4인 테이블 1개로 충분.";
  else if (filters.people <= 10) hint = `💡 ${filters.people}명이면 룸 없어도 4인 테이블 ${Math.ceil(filters.people/4)}개로 충분한 곳을 보여드려요.`;
  else if (filters.people <= 20) hint = "💡 룸/단체석 필수 · 예약 가능 조건도 자동으로 추가돼요.";
  else hint = "💡 20명+ 대규모 — 한정식·중식 대형룸·고기집 위주로 제안드려요.";

  return (
    <div style={{ padding: '48px 80px', maxWidth: 720, margin: '0 auto' }}>
      <Stepper step={2}/>
      <MascotSay mood="happy">
        {filters.mode === "lunch" ? "점심이군요 🌞" : "저녁이군요 🌙"} — <b>몇 명</b> 가요?
      </MascotSay>
      <h2 style={{ font: 'var(--text-h1)', margin: '24px 0 32px', letterSpacing: '-0.01em' }}>총 몇 명?</h2>

      <div style={{ background: '#f7f7f8', borderRadius: 16, padding: '32px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: '-0.04em', color: '#0066FF', lineHeight: 1,
            transition: 'transform .12s', transform: 'scale(1)' }} key={filters.people}>
            {filters.people}
          </div>
          <div style={{ fontSize: 26, fontWeight: 500, color: '#37383c' }}>명</div>
        </div>
        <input className="rg" type="range" min={1} max={max} step={1} value={filters.people}
          style={{ '--p': pct + '%' }}
          onChange={e => set({ people: parseInt(e.target.value, 10) })}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: '#878a93' }}>
          <span>1명</span><span>10명</span><span>20명</span><span>30명+</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#70737c', alignSelf: 'center', marginRight: 4 }}>빠른 선택:</span>
        {presets.map((q, i) => (
          <span key={q.l} className={"chip" + (presetActive === i ? " on" : "")}
            onClick={() => set({ people: q.p })}>{q.l}</span>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: '12px 16px', background: '#eaf2fe', borderRadius: 8,
        fontSize: 13, color: '#0054d1' }}>{hint}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48 }}>
        <button className="btn-ghost" onClick={back}>← 이전</button>
        <button className="btn-primary" onClick={next}>다음 →</button>
      </div>
    </div>
  );
}

// ───────── STEP 3: mood ─────────
function Step3({ filters, set, next, back }) {
  const moods = [
    { id: "quiet",  ico: "🤫", label: "조용히 먹고 끝내기", desc: "회의 전후, 빠른 식사" },
    { id: "social", ico: "🎉", label: "분위기 좋게 수다 위주", desc: "팀 빌딩, 친목" },
    { id: "formal", ico: "💼", label: "격식 있게",          desc: "임원 동석, 손님 접대" },
    { id: "casual", ico: "🎮", label: "게임·캐주얼",         desc: "부서 MT, 신입 환영" },
  ];
  return (
    <div style={{ padding: '48px 80px', maxWidth: 720, margin: '0 auto' }}>
      <Stepper step={3}/>
      <MascotSay mood="wink">{filters.people}명이군요. <b>어떤 자리</b>로 만들 거예요?</MascotSay>
      <h2 style={{ font: 'var(--text-h1)', margin: '24px 0 8px', letterSpacing: '-0.01em' }}>
        오늘은 어떤 분위기예요?
      </h2>
      <p style={{ color: '#70737c', margin: '0 0 32px' }}>
        이게 음식 종류보다 더 중요해요. 하나만 골라주세요.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {moods.map(m => {
          const on = filters.mood === m.id;
          return (
            <div key={m.id} className="opt-card" onClick={() => set({ mood: m.id })}
              style={{
                border: on ? '2px solid #0066FF' : '1px solid rgba(0,0,0,0.1)',
                background: on ? '#f7fbff' : '#fff',
                borderRadius: 12, padding: '20px 18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{ fontSize: 30 }}>{m.ico}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: '#70737c' }}>{m.desc}</div>
              </div>
              {on && <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0066FF',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48 }}>
        <button className="btn-ghost" onClick={back}>← 이전</button>
        <button className="btn-primary" onClick={next} disabled={!filters.mood}>다음 →</button>
      </div>
    </div>
  );
}

// ───────── STEP 4: genre + budget + conditions ─────────
function Step4({ filters, set, toggleGenre, toggleCond, finish, back }) {
  const genres = [
    { ico: "🍚", l: "한식" }, { ico: "🍣", l: "일식" }, { ico: "🥟", l: "중식" },
    { ico: "🍝", l: "양식" }, { ico: "🍜", l: "아시안" }, { ico: "🥩", l: "고기구이" },
    { ico: "🦐", l: "해산물" }, { ico: "🍱", l: "분식·면" }, { ico: "🥗", l: "채식 가능" }, { ico: "🍣", l: "뷔페" },
  ];
  const budgets = [
    { id: "u1", l: "~1만원" }, { id: "1-2", l: "1~2만원" },
    { id: "2-3", l: "2~3만원" }, { id: "3+", l: "3만원+" },
  ];
  const conds = [
    { id: "walk10", l: "도보 10분 이내" },
    { id: "parking", l: "주차 가능" },
    { id: "reserve", l: "예약 가능" },
    { id: "room", l: "룸/단체석" },
  ];
  return (
    <div style={{ padding: '48px 80px', maxWidth: 720, margin: '0 auto' }}>
      <Stepper step={4}/>
      <MascotSay mood="full">
        마지막 — <b>음식 종류</b>는 끌리는 거 다 골라요. 안 골라도 돼요.
      </MascotSay>
      <h2 style={{ font: 'var(--text-h1)', margin: '24px 0 8px', letterSpacing: '-0.01em' }}>땡기는 게 있어요?</h2>
      <p style={{ color: '#70737c', margin: '0 0 32px' }}>여러 개 선택 가능 · 비워두면 전체 추천</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 32 }}>
        {genres.map(g => {
          const on = filters.genres.includes(g.l);
          return (
            <div key={g.l} className="opt-card" onClick={() => toggleGenre(g.l)}
              style={{
                border: on ? '2px solid #0066FF' : '1px solid rgba(0,0,0,0.1)',
                background: on ? '#f7fbff' : '#fff',
                borderRadius: 12, padding: '14px 8px', cursor: 'pointer', textAlign: 'center',
              }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{g.ico}</div>
              <div style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{g.l}</div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 13, color: '#37383c', fontWeight: 600, marginBottom: 12 }}>예산 (인당)</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {budgets.map(b => (
          <span key={b.id} className={"chip" + (filters.budget === b.id ? " on" : "")}
            onClick={() => set({ budget: filters.budget === b.id ? null : b.id })}>{b.l}</span>
        ))}
      </div>

      <div style={{ fontSize: 13, color: '#37383c', fontWeight: 600, marginBottom: 12 }}>추가 조건</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {conds.map(c => (
          <span key={c.id} className={"chip" + (filters.conditions.includes(c.id) ? " on" : "")}
            onClick={() => toggleCond(c.id)}>{c.l}</span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48 }}>
        <button className="btn-ghost" onClick={back}>← 이전</button>
        <button className="btn-primary" onClick={finish}>윤혜야 찾아줘 →</button>
      </div>
    </div>
  );
}

// ───────── RESULT ─────────
function Result({ filters, onDetail, onReset, onBack, toast }) {
  const ranked = useMemo(() => rankPlaces(filters), [filters]);
  const top = ranked.slice(0, 3);
  const more = ranked.slice(3, 6);
  const [saved, setSaved] = useState(new Set());

  const summary = [
    filters.mode === "lunch" ? "🌞 점심" : "🌙 저녁",
    `${filters.people}명`,
    { quiet: "조용히", social: "수다", formal: "격식", casual: "캐주얼" }[filters.mood],
    ...filters.genres,
    filters.budget && { u1: "~1만", "1-2": "1~2만", "2-3": "2~3만", "3+": "3만+" }[filters.budget],
    ...filters.conditions.map(c => ({ walk10: "도보 10분", parking: "주차", reserve: "예약", room: "룸" }[c])),
  ].filter(Boolean);

  return (
    <div style={{ background: '#f7f7f8', minHeight: '100%', padding: '36px 60px 60px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <YunhyeMascot size={56} mood="happy"/>
          <div>
            <div style={{ fontSize: 13, color: '#0066FF', fontWeight: 600 }}>윤혜의 추천 · {ranked.length}곳 중 상위 3곳</div>
            <h2 style={{ font: 'var(--text-h2)', margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              {summary.slice(0, 4).join(' · ')}
            </h2>
          </div>
          <div style={{ flex: 1 }}/>
          <button className="btn-ghost" style={{ height: 38, fontSize: 13 }} onClick={onBack}>← 조건 다시</button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {summary.map(t => (
            <span key={t} style={{ fontSize: 12, padding: '4px 10px', background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)', borderRadius: 999, color: '#46474c' }}>{t}</span>
          ))}
        </div>

        {ranked.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 60, textAlign: 'center',
            border: '1px solid rgba(0,0,0,0.06)' }}>
            <YunhyeMascot size={120} mood="sleepy"/>
            <h3 style={{ font: 'var(--text-h3)', marginTop: 16 }}>조건에 맞는 가게가 없어요</h3>
            <p style={{ color: '#70737c' }}>조건을 조금 풀어볼까요?</p>
            <button className="btn-primary" onClick={onBack}>← 조건 수정</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {top.map(({ p, reasons }, i) => {
              const isSaved = saved.has(p.id);
              const price = filters.mode === "lunch" ? p.lunch : p.dinner;
              return (
                <div key={p.id} className="opt-card" style={{
                  background: '#fff', borderRadius: 16, padding: 20,
                  border: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 20,
                  boxShadow: i === 0 ? '0 8px 24px rgba(0,102,255,0.08)' : 'none',
                  cursor: 'pointer',
                }} onClick={() => onDetail(p.id)}>
                  <div style={{ width: 180, flex: '0 0 180px' }}>
                    <FoodTile tone={p.tone} h={140}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700,
                        color: i === 0 ? '#FF9200' : i === 1 ? '#878a93' : '#a78368' }}>
                        {["🥇 No.1","🥈 No.2","🥉 No.3"][i]}
                      </span>
                      {i === 0 && <span style={{ fontSize: 11, padding: '2px 8px', background: '#FEF4E6',
                        color: '#D17600', borderRadius: 4, fontWeight: 600 }}>윤혜's PICK</span>}
                    </div>
                    <div style={{ font: 'var(--text-title-1)', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#70737c', marginBottom: 10, flexWrap: 'wrap' }}>
                      <span>{p.genre} · {p.sub}</span>·<span>도보 {p.dist}분</span>·<span>{price}만원/인</span>
                      ·<span>{p.capMin}~{p.capMax}명{p.room ? " · 룸" : ""}</span>
                    </div>
                    <div style={{ background: '#f7f7f8', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: '#37383c' }}>"{p.comment}"</div>
                      <div style={{ fontSize: 11, color: '#878a93', marginTop: 4 }}>
                        — {p.by} · {p.team} · 제보 {p.reports}건
                      </div>
                    </div>
                    {reasons.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {reasons.map(r => (
                          <span key={r} style={{ fontSize: 11, color: '#0054D1', background: '#EAF2FE',
                            padding: '3px 8px', borderRadius: 4 }}>✓ {r}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <button onClick={e => {
                      e.stopPropagation();
                      const next = new Set(saved);
                      if (isSaved) { next.delete(p.id); toast("저장 해제"); }
                      else { next.add(p.id); toast(`'${p.name}' 저장됨`); }
                      setSaved(next);
                    }} style={{ width: 36, height: 36, borderRadius: 8,
                      border: '1px solid ' + (isSaved ? '#0066FF' : 'rgba(0,0,0,0.1)'),
                      background: isSaved ? '#EAF2FE' : '#fff', cursor: 'pointer', fontSize: 16 }}>
                      {isSaved ? "★" : "☆"}
                    </button>
                    <button className="btn-primary" onClick={e => { e.stopPropagation(); onDetail(p.id); }}
                      style={{ height: 36, padding: '0 14px', fontSize: 13 }}>상세 →</button>
                  </div>
                </div>
              );
            })}

            {more.length > 0 && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', textAlign: 'center', padding: 14,
                  color: '#0066FF', fontWeight: 500, fontSize: 14, listStyle: 'none',
                  background: '#fff', borderRadius: 12, border: '1px dashed rgba(0,102,255,0.3)' }}>
                  ↓ 다른 {more.length}곳도 보기
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                  {more.map(({ p }, i) => (
                    <div key={p.id} className="opt-card" onClick={() => onDetail(p.id)}
                      style={{ background: '#fff', borderRadius: 12, padding: 14,
                        border: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 14, cursor: 'pointer' }}>
                      <div style={{ width: 80, flex: '0 0 80px' }}><FoodTile tone={p.tone} h={64}/></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>#{i + 4} {p.name}</div>
                        <div style={{ fontSize: 12, color: '#70737c', marginTop: 2 }}>
                          {p.genre} · 도보 {p.dist}분 · {filters.mode === "lunch" ? p.lunch : p.dinner}만원/인
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn-ghost" onClick={onReset}>처음부터 다시</button>
        </div>
      </div>
    </div>
  );
}

// ───────── DETAIL ─────────
function Detail({ placeId, mode, onBack }) {
  const p = PLACES.find(x => x.id === placeId);
  if (!p) return null;
  const price = mode === "lunch" ? p.lunch : p.dinner;
  const reviews = [
    { n: p.by, t: p.team, a: "방금 전", q: p.comment, rec: p.menu, visit: `${mode === "lunch" ? "점심" : "저녁"} · ${Math.min(p.capMax, 8)}명` },
    { n: "팀장님", t: "개발", a: "2주 전", q: "예약하고 가세요. 평일 저녁 룸은 일주일 전부터 차요.",
      rec: [p.menu[0]], visit: "저녁 · 9명 · 팀 회식" },
    { n: "점심신자", t: "QA", a: "한 달 전", q: "12시 5분 도착이 골든타임. 5분만 늦어도 줄.",
      rec: [p.menu[0]], visit: "점심 · 3명" },
  ];

  return (
    <div style={{ background: '#fff', minHeight: '100%' }}>
      <div style={{ height: 240, position: 'relative' }}>
        <FoodTile tone={p.tone} h={240}/>
        <button onClick={onBack} style={{
          position: 'absolute', top: 16, left: 24, height: 36, padding: '0 14px',
          borderRadius: 8, background: 'rgba(255,255,255,0.95)', border: 0,
          fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>← 결과로</button>
        <div style={{ position: 'absolute', bottom: 16, left: 32, color: '#fff' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {p.modes.includes("lunch") && <span style={{ fontSize: 11, padding: '3px 8px',
              background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}>점심 OK</span>}
            {p.modes.includes("dinner") && <span style={{ fontSize: 11, padding: '3px 8px',
              background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}>저녁 OK</span>}
            {p.room && <span style={{ fontSize: 11, padding: '3px 8px',
              background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}>룸</span>}
            {p.parking && <span style={{ fontSize: 11, padding: '3px 8px',
              background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}>주차</span>}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{p.name}</div>
          <div style={{ fontSize: 13, opacity: 0.95 }}>
            {p.genre} · {p.sub} · 도보 {p.dist}분 · 최대 {p.capMax}명
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: 1040, margin: '0 auto', padding: '28px 32px 48px', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <div style={{ background: 'linear-gradient(135deg, #f7fbff, #eaf2fe)',
            border: '1px solid rgba(0,102,255,0.15)', borderRadius: 12, padding: '14px 16px',
            marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {["#ffb86b","#ff6b6b","#6aa8ff","#9e7bff"].map((c,i)=>(
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c,
                  border: '2px solid #fff', marginLeft: i ? -8 : 0 }}/>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                넥슨 동료 <span style={{ color: '#0066FF' }}>{p.reports}명</span>이 다녀왔어요
              </div>
              <div style={{ fontSize: 12, color: '#70737c' }}>최근 제보: 2일 전</div>
            </div>
          </div>

          <h3 style={{ font: 'var(--text-h3)', margin: '0 0 14px' }}>동료 리뷰 {p.reports}</h3>
          {reviews.map((r,i)=>(
            <div key={i} style={{ padding: '16px 0', borderTop: i ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%',
                  background: `hsl(${r.n.charCodeAt(0)*13}, 55%, 65%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 12 }}>{r.n[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.n}
                    <span style={{ fontSize: 11, color: '#0066FF', background: '#EAF2FE',
                      padding: '1px 6px', borderRadius: 4, marginLeft: 6, fontWeight: 500 }}>{r.t}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#878a93' }}>{r.a} · {r.visit}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8, color: '#37383c' }}>"{r.q}"</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {r.rec.map(m=>(
                  <span key={m} style={{ fontSize: 11, padding: '3px 8px', background: '#FFF1DB',
                    color: '#D17600', borderRadius: 4 }}>👍 {m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside style={{ width: 280, flex: '0 0 280px' }}>
          <div style={{ position: 'sticky', top: 16, background: '#f7f7f8', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#878a93', marginBottom: 4 }}>인당 평균 ({mode === "lunch" ? "점심" : "저녁"})</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>{price}만원</div>
            <button className="btn-primary" style={{ width: '100%', marginBottom: 8 }}>예약하기 →</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <button className="btn-ghost" style={{ height: 38, fontSize: 12 }}>📞 전화</button>
              <button className="btn-ghost" style={{ height: 38, fontSize: 12 }}>🗺 지도</button>
            </div>
            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 12, color: '#878a93', marginBottom: 8 }}>이 가게의 시그널</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>수용</span><b>{p.capMin}~{p.capMax}명</b></div>
                <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>룸</span><b>{p.room ? "있음" : "없음"}</b></div>
                <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>주류</span><b>{p.alcohol ? "가능" : "없음"}</b></div>
                <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>마감</span><b>{p.end}</b></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ───────── APP ─────────
function App() {
  const [screen, setScreen] = useState("landing"); // landing | step1..4 | result | detail
  const [filters, setFilters] = useState({
    mode: null, people: 6, mood: null, genres: [], budget: null, conditions: ["walk10"],
  });
  const [detailId, setDetailId] = useState(null);
  const [toastEl, toast] = useToast();

  const set = (patch) => setFilters(f => ({ ...f, ...patch }));
  const toggleGenre = (g) => setFilters(f => ({
    ...f, genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g],
  }));
  const toggleCond = (c) => setFilters(f => ({
    ...f, conditions: f.conditions.includes(c) ? f.conditions.filter(x => x !== c) : [...f.conditions, c],
  }));

  const reset = () => {
    setFilters({ mode: null, people: 6, mood: null, genres: [], budget: null, conditions: ["walk10"] });
    setScreen("landing");
  };

  // Keyboard nav for stepper
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Enter" || e.key === "ArrowRight") {
        if (screen === "step1" && filters.mode) setScreen("step2");
        else if (screen === "step2") setScreen("step3");
        else if (screen === "step3" && filters.mood) setScreen("step4");
        else if (screen === "step4") setScreen("result");
      } else if (e.key === "ArrowLeft") {
        if (screen === "step2") setScreen("step1");
        else if (screen === "step3") setScreen("step2");
        else if (screen === "step4") setScreen("step3");
      } else if (e.key === "Escape") {
        if (screen === "detail") setScreen("result");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, filters.mode, filters.mood]);

  const urlMap = {
    landing: "jjop.nexon.internal/",
    step1: "jjop.nexon.internal/decide?step=1",
    step2: "jjop.nexon.internal/decide?step=2",
    step3: "jjop.nexon.internal/decide?step=3",
    step4: "jjop.nexon.internal/decide?step=4",
    result: "jjop.nexon.internal/decide/result",
    detail: `jjop.nexon.internal/place/${detailId}`,
  };

  let content;
  if (screen === "landing") {
    content = <Landing onStart={() => setScreen("step1")}/>;
  } else if (screen === "step1") {
    content = <Step1 filters={filters} set={set} next={() => setScreen("step2")}/>;
  } else if (screen === "step2") {
    content = <Step2 filters={filters} set={set} next={() => setScreen("step3")} back={() => setScreen("step1")}/>;
  } else if (screen === "step3") {
    content = <Step3 filters={filters} set={set} next={() => setScreen("step4")} back={() => setScreen("step2")}/>;
  } else if (screen === "step4") {
    content = <Step4 filters={filters} set={set} toggleGenre={toggleGenre} toggleCond={toggleCond}
      finish={() => setScreen("result")} back={() => setScreen("step3")}/>;
  } else if (screen === "result") {
    content = <Result filters={filters} onDetail={id => { setDetailId(id); setScreen("detail"); }}
      onReset={reset} onBack={() => setScreen("step4")} toast={toast}/>;
  } else if (screen === "detail") {
    content = <Detail placeId={detailId} mode={filters.mode} onBack={() => setScreen("result")}/>;
  }

  return (
    <div className="app-shell">
      <div className="browser">
        <div className="chrome">
          <div className="dots"><b/><b/><b/></div>
          <div className="url">🔒 {urlMap[screen]}</div>
          <div style={{ width: 60 }}/>
        </div>
        <TopNav onHome={reset} active="추천"/>
        <div className="body">
          <StepFade stepKey={screen}>{content}</StepFade>
        </div>
      </div>
      {toastEl}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
