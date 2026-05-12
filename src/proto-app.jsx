// 먹숭이 — 메인 앱
// 탭: 추천 (위저드 + 결과) / 제보 피드 / 제보하기 / 이번주 핫픽
// 점심/저녁은 위저드 1단계에서 선택 (글로벌 토글 아님)

const { useState, useEffect, useMemo, useRef, useCallback } = React;

const TABS = ["추천", "제보 피드", "제보하기", "이번주 핫픽"];

// ───────── Toast ─────────
function useToast() {
  const [msg, setMsg] = useState(null);
  const tref = useRef();
  function show(text, kind = "ok") {
    setMsg({ text, kind });
    clearTimeout(tref.current);
    tref.current = setTimeout(() => setMsg(null), 2800);
  }
  const el = msg ? (
    <div className="toast" style={msg.kind === "err" ? { background: '#d83838' } : null}>
      <span>{msg.kind === "err" ? "!" : "✓"}</span>{msg.text}
    </div>
  ) : null;
  return [el, show];
}

// ───────── Top nav ─────────
function TopNav({ active, onNav }) {
  return (
    <div className="topnav">
      <span onClick={() => onNav("추천")} style={{ cursor: 'pointer' }}><BrandA/></span>
      <div className="navlinks">
        {TABS.map(l => (
          <a key={l} className={l === active ? "active" : ""} onClick={() => onNav(l)}>{l}</a>
        ))}
      </div>
      <div className="spacer"/>
      <span className="pill">
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00BF40' }}/>
        넥슨 판교
      </span>
      <div className="avatar"/>
    </div>
  );
}

// ───────── Empty state ─────────
function EmptyState({ onReport, title, body }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '56px 32px', textAlign: 'center',
      border: '1px solid rgba(0,0,0,0.06)', maxWidth: 520, margin: '40px auto',
    }}>
      <MeoksungMascot size={120} mood="sleepy"/>
      <h3 style={{ font: 'var(--text-h3)', marginTop: 16, marginBottom: 8 }}>
        {title || "아직 아무도 제보 안 했어요."}
      </h3>
      <p style={{ color: '#70737c', margin: '0 0 24px', lineHeight: 1.6 }}>
        {body || "팀비 어디다 쓰는지 알려주세요"}
      </p>
      {onReport && (
        <button className="btn-primary" onClick={onReport}>제보하러 가기 →</button>
      )}
    </div>
  );
}

// ───────── Step indicator ─────────
function Stepper({ step, total = 4 }) {
  const labels = ["언제", "인원", "분위기", "장르"].slice(0, total);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
      {labels.map((l, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "now" : "todo";
        return (
          <React.Fragment key={l}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: state === "now" ? '#B07900' : state === "done" ? '#37383c' : '#aeb0b6',
              fontWeight: state === "now" ? 600 : 500, fontSize: 13,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: state === "now" ? '#FFC107' : state === "done" ? '#37383c' : '#e1e2e4',
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

function MascotSay({ mood = "happy", children, size = 64 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
      <MeoksungMascot size={size} mood={mood}/>
      <div className="bubble" style={{ maxWidth: 480 }}>{children}</div>
    </div>
  );
}

// 가게 썸네일: place.thumbnail 이 있으면 그 이미지를, 없으면 그라데이션 폴백.
function PlaceThumb({ place, h = 140, rounded = 8 }) {
  if (place && place.thumbnail) {
    return (
      <div style={{
        width: '100%', height: h, borderRadius: rounded,
        overflow: 'hidden', background: '#eee',
      }}>
        <img src={place.thumbnail} alt={place.name || ""} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
      </div>
    );
  }
  return <FoodTile tone={place && place.tone} h={h} label={place && place.name}/>;
}

// 가게 네이버지도 URL — naverLink(정확한 가게 페이지)가 있으면 그걸 쓰고, 없으면 검색 URL.
function naverMapUrlFor(place) {
  if (!place) return null;
  if (place.naverLink) return place.naverLink;
  const q = [place.name, place.address].filter(Boolean).join(" ").trim();
  if (!q) return null;
  return `https://map.naver.com/v5/search/${encodeURIComponent(q)}`;
}

function StepFade({ stepKey, children }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(false);
    const t = setTimeout(() => setShown(true), 30);
    return () => clearTimeout(t);
  }, [stepKey]);
  return <div className={shown ? "step-shown" : "step-enter"} key={stepKey}>{children}</div>;
}

// ───────── LANDING ─────────
function Landing({ onStart, onBrowse, places, onNav }) {
  const recent = dataHelpers.recentSubmissionCount(places);
  return (
    <div className="landing-pad">
      <div className="landing-hero">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#B07900', fontWeight: 600, marginBottom: 16 }}>
            조직운영비, 알차게 쓰자 🐒
          </div>
          <h1 style={{ font: 'var(--text-display-2)', letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: 1.1 }}>
            팀비 어디 쓰지<span style={{ color: '#FFC107' }}>?</span><br/>
            <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: 32, fontWeight: 500 }}>
              먹숭이가 동료 추천만 모았어요.
            </span>
          </h1>
          <p style={{ color: '#46474c', fontSize: 16, lineHeight: 1.65, margin: '0 0 32px', maxWidth: 440 }}>
            법카 긁어본 사람들이 직접 남긴 한 줄 추천.<br/>
            팀장님도 만족하고, 팀비도 살아남는<br/>
            <b>회식 한 끼</b>를 4가지 질문으로 찾아드려요.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onStart}>먹숭이한테 물어보기 →</button>
            <button className="btn-ghost" onClick={onBrowse}>그냥 둘러볼래요</button>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 40, fontSize: 13, color: '#70737c', flexWrap: 'wrap' }}>
            <span>⏱ 평균 38초</span>
            <span>· 등록 가게 {places.length}곳</span>
            <span>· 이번주 신규 제보 {recent}건</span>
          </div>
        </div>
        <div style={{ flex: '0 0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -8, right: -16, background: '#fff',
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '8px 14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontSize: 13, fontWeight: 500 }}>
            오늘 어디 긁어? 🍌
          </div>
          <MeoksungMascot size={320} mood="full"/>
        </div>
      </div>

      {places.length === 0 ? (
        <div className="landing-foot">
          <EmptyState onReport={() => onNav("제보하기")}/>
        </div>
      ) : (
        <div className="landing-foot">
          <div style={{ fontSize: 12, color: '#70737c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            동료들이 알려준 가게 {places.length}곳
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {places.slice(0, 6).map(p => (
              <span key={p.id} className="chip" onClick={onBrowse}>{p.name} · {p.genre}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ───────── STEP 1: meal type (lunch / dinner) ─────────
function StepMode({ filters, set, next, back }) {
  const opts = [
    { id: "lunch",  ico: "🌞", title: "팀 점심 / 캐주얼",
      desc: "도보 10분 안, 회전 빠른 곳 · 메뉴 단가 부담 적음" },
    { id: "dinner", ico: "🌙", title: "본 회식 / 법카 디너",
      desc: "술 가능, 룸·단체석 · 늦게까지 가능 · 2차 연계" },
  ];
  return (
    <div className="wizard-page">
      <Stepper step={1}/>
      <MascotSay mood="hungry">안녕! 먹숭이야. 먼저 — <b>언제 가는 거</b>예요?</MascotSay>
      <h2 style={{ font: 'var(--text-h1)', margin: '24px 0 8px', letterSpacing: '-0.01em' }}>
        팀 점심이에요, 본 회식이에요?
      </h2>
      <p style={{ color: '#70737c', margin: '0 0 32px' }}>
        예산 단위, 영업 시간, 술 가능 여부가 통째로 달라져요.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {opts.map(o => {
          const on = filters.mealType === o.id;
          return (
            <div key={o.id} className="opt-card" onClick={() => set({ mealType: o.id })}
              style={{
                border: on ? '2px solid #FFC107' : '1px solid rgba(0,0,0,0.1)',
                background: on ? 'linear-gradient(180deg, #fffceb 0%, #fff 80%)' : '#fafafb',
                borderRadius: 16, padding: '28px 24px', cursor: 'pointer', position: 'relative',
              }}>
              {on && <div style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22,
                borderRadius: '50%', background: '#FFC107', color: '#1b1c1e',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>}
              <div style={{ fontSize: 38, marginBottom: 8, opacity: on ? 1 : 0.7 }}>{o.ico}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{o.title}</div>
              <div style={{ fontSize: 13, color: '#70737c', lineHeight: 1.5 }}>{o.desc}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, alignItems: 'center' }}>
        <button className="btn-ghost" onClick={back}>← 처음으로</button>
        <button className="btn-primary" onClick={next} disabled={!filters.mealType}>다음 →</button>
      </div>
    </div>
  );
}

// ───────── STEP 2: people ─────────
// 제보 폼과 동일한 버킷(`PEOPLE_OPTS`)을 그대로 사용한다.
function StepPeople({ filters, set, next, back }) {
  const buckets = [
    { l: "2~4명 소수팀",  ico: "👥", desc: "회의 전후 빠른 식사, 4인 테이블 한 개로 충분" },
    { l: "5~10명 팀회식", ico: "🍻", desc: "테이블 두 개 붙이기 / 작은 룸 정도" },
    { l: "11~20명 부서",  ico: "🎉", desc: "룸·단체석 필수, 예약 권장" },
    { l: "20명+ 대규모",  ico: "🏛️", desc: "한정식·중식 대형룸·고기집 위주" },
  ];

  return (
    <div className="wizard-page">
      <Stepper step={2}/>
      <MascotSay mood="happy">
        {filters.mealType === "lunch" ? "팀 점심이군요 🌞" : "본 회식이군요 🌙"} — <b>몇 명</b> 가요?
      </MascotSay>
      <h2 style={{ font: 'var(--text-h1)', margin: '24px 0 8px', letterSpacing: '-0.01em' }}>총 몇 명?</h2>
      <p style={{ color: '#70737c', margin: '0 0 32px' }}>제보된 가게의 적정 인원과 매칭해서 찾아드려요.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {buckets.map(b => {
          const on = filters.people === b.l;
          return (
            <div key={b.l} className="opt-card" onClick={() => set({ people: on ? null : b.l })}
              style={{
                border: on ? '2px solid #FFC107' : '1px solid rgba(0,0,0,0.1)',
                background: on ? '#FFFDF0' : '#fff',
                borderRadius: 12, padding: '18px 18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{ fontSize: 28 }}>{b.ico}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{b.l}</div>
                <div style={{ fontSize: 12, color: '#70737c' }}>{b.desc}</div>
              </div>
              {on && <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#FFC107',
                color: '#1b1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button className="btn-ghost" onClick={back}>← 처음으로</button>
        <button className="btn-primary" onClick={next}>다음 →</button>
      </div>
    </div>
  );
}

// ───────── STEP 2: mood ─────────
function StepMood({ filters, set, next, back }) {
  const moods = [
    { id: "quiet",  ico: "🤫", label: "조용히 먹고 끝내기", desc: "회의 전후, 빠른 식사" },
    { id: "social", ico: "🎉", label: "분위기 좋게 수다 위주", desc: "팀 빌딩, 친목" },
    { id: "formal", ico: "💼", label: "격식 있게",          desc: "임원 동석, 손님 접대" },
    { id: "casual", ico: "🎮", label: "게임·캐주얼",         desc: "부서 MT, 신입 환영" },
  ];
  return (
    <div className="wizard-page">
      <Stepper step={3}/>
      <MascotSay mood="wink">
        {filters.people ? `${filters.people}이군요. ` : ""}<b>어떤 자리</b>로 만들 거예요?
      </MascotSay>
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
                border: on ? '2px solid #FFC107' : '1px solid rgba(0,0,0,0.1)',
                background: on ? '#FFFDF0' : '#fff',
                borderRadius: 12, padding: '20px 18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <div style={{ fontSize: 30 }}>{m.ico}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: '#70737c' }}>{m.desc}</div>
              </div>
              {on && <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#FFC107',
                color: '#1b1c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>}
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

// ───────── STEP 3: genre + budget + conditions ─────────
// 예산·조건 옵션 모두 제보 폼(PRICE_OPTS, EXTRA_OPTS)과 동일한 라벨을 사용한다.
function StepGenre({ filters, set, toggleGenre, toggleCond, finish, back }) {
  const genreIcons = {
    "한식": "🍚", "일식": "🍣", "중식": "🥟", "양식": "🍝", "아시안": "🍜",
    "고기구이": "🥩", "해산물": "🦐", "분식·면": "🍱", "채식 가능": "🥗", "뷔페": "🍽",
  };
  return (
    <div className="wizard-page">
      <Stepper step={4}/>
      <MascotSay mood="hungry">
        마지막 — <b>음식 종류</b>는 끌리는 거 다 골라요. 안 골라도 돼요.
      </MascotSay>
      <h2 style={{ font: 'var(--text-h1)', margin: '24px 0 8px', letterSpacing: '-0.01em' }}>땡기는 게 있어요?</h2>
      <p style={{ color: '#70737c', margin: '0 0 32px' }}>여러 개 선택 가능 · 비워두면 전체 추천</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 32 }}>
        {GENRE_OPTS.map(g => {
          const on = filters.genres.includes(g);
          return (
            <div key={g} className="opt-card" onClick={() => toggleGenre(g)}
              style={{
                border: on ? '2px solid #FFC107' : '1px solid rgba(0,0,0,0.1)',
                background: on ? '#FFFDF0' : '#fff',
                borderRadius: 12, padding: '14px 8px', cursor: 'pointer', textAlign: 'center',
              }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{genreIcons[g] || "🍽"}</div>
              <div style={{ fontSize: 13, fontWeight: on ? 600 : 500 }}>{g}</div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 13, color: '#37383c', fontWeight: 600, marginBottom: 12 }}>예산 (인당)</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {PRICE_OPTS.map(b => (
          <span key={b} className={"chip" + (filters.budget === b ? " on" : "")}
            onClick={() => set({ budget: filters.budget === b ? null : b })}>{b}</span>
        ))}
      </div>

      <div style={{ fontSize: 13, color: '#37383c', fontWeight: 600, marginBottom: 12 }}>추가 조건</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {EXTRA_OPTS.map(c => (
          <span key={c} className={"chip" + (filters.conditions.includes(c) ? " on" : "")}
            onClick={() => toggleCond(c)}>{c}</span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48 }}>
        <button className="btn-ghost" onClick={back}>← 이전</button>
        <button className="btn-primary" onClick={finish}>먹숭이야 찾아줘 →</button>
      </div>
    </div>
  );
}

// ───────── RESULT (with live filter editing) ─────────
function Result({ filters, set, toggleGenre, toggleCond, places, onDetail, onReset, onBack, onNav, toast }) {
  const filtered = useMemo(() => dataHelpers.filterPlaces(places, filters), [places, filters]);
  const [saved, setSaved] = useState(new Set());

  const mealType = filters.mealType;
  const summary = [
    mealType === "lunch" ? "🌞 팀 점심" : mealType === "dinner" ? "🌙 본 회식" : null,
    filters.people,
    filters.mood ? { quiet: "조용히", social: "수다", formal: "격식", casual: "캐주얼" }[filters.mood] : null,
    ...filters.genres,
    filters.budget,
    ...filters.conditions,
  ].filter(Boolean);

  return (
    <div className="result-page">
      <div className="result-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <MeoksungMascot size={56} mood="happy"/>
          <div>
            <div style={{ fontSize: 13, color: '#B07900', fontWeight: 600 }}>
              먹숭이의 추천 · {filtered.length}곳 매칭
            </div>
            <h2 style={{ font: 'var(--text-h2)', margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              {summary.slice(0, 4).join(' · ') || "전체 둘러보기"}
            </h2>
          </div>
          <div style={{ flex: 1 }}/>
          {onBack && (
            <button className="btn-ghost" style={{ height: 38, fontSize: 13 }} onClick={onBack}>← 조건 다시</button>
          )}
        </div>

        {/* 실시간 필터 칩들 — 폼 옵션과 동일 */}
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12,
          padding: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#70737c', alignSelf: 'center', marginRight: 4 }}>장르:</span>
            {GENRE_OPTS.map(g => (
              <span key={g} className={"chip" + (filters.genres.includes(g) ? " on" : "")}
                onClick={() => toggleGenre(g)} style={{ fontSize: 12, height: 28 }}>{g}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#70737c', alignSelf: 'center', marginRight: 4 }}>조건:</span>
            {EXTRA_OPTS.map(c => (
              <span key={c} className={"chip" + (filters.conditions.includes(c) ? " on" : "")}
                onClick={() => toggleCond(c)} style={{ fontSize: 12, height: 28 }}>{c}</span>
            ))}
          </div>
        </div>

        {places.length === 0 ? (
          <EmptyState onReport={() => onNav("제보하기")}/>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 16, padding: 60, textAlign: 'center',
            border: '1px solid rgba(0,0,0,0.06)' }}>
            <MeoksungMascot size={120} mood="sleepy"/>
            <h3 style={{ font: 'var(--text-h3)', marginTop: 16 }}>조건에 맞는 가게가 없어요</h3>
            <p style={{ color: '#70737c' }}>조건을 조금 풀어볼까요?</p>
            <button className="btn-primary" onClick={onReset} style={{ marginTop: 8 }}>필터 초기화</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((p, i) => {
              const isSaved = saved.has(p.id);
              return (
                <div key={p.id} className="opt-card result-card" style={{
                  background: '#fff', borderRadius: 16, padding: 20,
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: i === 0 ? '0 8px 24px rgba(0,102,255,0.08)' : 'none',
                  cursor: 'pointer',
                }} onClick={() => onDetail(p.id)}>
                  <div className="result-card-img"><PlaceThumb place={p} h={140}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {i < 3 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700,
                          color: i === 0 ? '#FF9200' : i === 1 ? '#878a93' : '#a78368' }}>
                          {["🥇 No.1","🥈 No.2","🥉 No.3"][i]}
                        </span>
                        {i === 0 && <span style={{ fontSize: 11, padding: '2px 8px', background: '#FEF4E6',
                          color: '#D17600', borderRadius: 4, fontWeight: 600 }}>먹숭이's PICK</span>}
                      </div>
                    )}
                    <div style={{ font: 'var(--text-title-1)', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#70737c', marginBottom: 10, flexWrap: 'wrap' }}>
                      <span>{p.genre}{p.sub ? ` · ${p.sub}` : ""}</span>
                      {p.priceRange && <><span>·</span><span>{p.priceRange}</span></>}
                      {p.people && <><span>·</span><span>{p.people}</span></>}
                      {p.hasRoom && <><span>·</span><span>룸 가능</span></>}
                    </div>
                    {p.comment && (
                      <div style={{ background: '#f7f7f8', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                        <div style={{ fontSize: 13, lineHeight: 1.5, color: '#37383c' }}>"{p.comment}"</div>
                        <div style={{ fontSize: 11, color: '#878a93', marginTop: 4 }}>
                          — {p.nickname}{p.team ? ` · ${p.team}` : ""} · 제보 {p.reports}건
                        </div>
                      </div>
                    )}
                    {p.extras && p.extras.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {p.extras.slice(0, 4).map(r => (
                          <span key={r} style={{ fontSize: 11, color: '#B07900', background: '#FFF8E1',
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
                      border: '1px solid ' + (isSaved ? '#FFC107' : 'rgba(0,0,0,0.1)'),
                      background: isSaved ? '#FFF8E1' : '#fff', cursor: 'pointer', fontSize: 16 }}>
                      {isSaved ? "★" : "☆"}
                    </button>
                    <button className="btn-primary" onClick={e => { e.stopPropagation(); onDetail(p.id); }}
                      style={{ height: 36, padding: '0 14px', fontSize: 13 }}>상세 →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn-ghost" onClick={onReset}>필터 초기화</button>
        </div>
      </div>
    </div>
  );
}

// ───────── DETAIL MODAL ─────────
function DetailModal({ place, onClose, onUpdate, onDelete, toast }) {
  const [mode, setMode] = useState("view"); // view | edit
  const [busy, setBusy] = useState(false);

  // Esc로 닫기 (편집 모드에선 비활성화)
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && mode === "view") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, mode]);

  // place가 바뀌면 view 모드로 복귀
  useEffect(() => { setMode("view"); }, [place && place.id]);

  if (!place) return null;
  const naverUrl = naverMapUrlFor(place);

  async function handleSave(form) {
    if (busy) return;
    if (!form.name.trim() || !form.address.trim()) {
      toast && toast("가게 이름과 주소는 필수예요.", "err");
      return;
    }
    setBusy(true);
    const updated = {
      ...place,
      ...form,
      id: place.id,
      reports: place.reports,
      submittedAt: new Date().toISOString(),
    };
    try {
      await postToAppsScript({ action: "update", id: place.id, patch: form });
      onUpdate && onUpdate(updated);
      toast && toast("수정 완료!");
      onClose();
    } catch (err) {
      toast && toast(err.message || "수정에 실패했어요.", "err");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    if (!window.confirm(`'${place.name}' 항목을 정말 삭제할까요?`)) return;
    setBusy(true);
    try {
      await postToAppsScript({ action: "delete", id: place.id });
      onDelete && onDelete(place.id);
      toast && toast("삭제 완료!");
      onClose();
    } catch (err) {
      toast && toast(err.message || "삭제에 실패했어요.", "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={mode === "view" ? onClose : undefined}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="닫기" disabled={busy}>✕</button>

        {mode === "edit" ? (
          <div style={{ padding: '24px 28px 28px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>맛집 정보 수정</div>
            <PlaceForm initial={place} submitLabel="저장" busy={busy}
              onSubmit={handleSave} onCancel={() => setMode("view")}/>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ height: 200, position: 'relative', overflow: 'hidden',
              borderRadius: '16px 16px 0 0', background: '#eee' }}>
              {place.thumbnail ? (
                <img src={place.thumbnail} alt={place.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
              ) : (
                <FoodTile tone={place.tone} h={200}/>
              )}
              <div style={{ position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.55))' }}/>
              <div style={{ position: 'absolute', bottom: 16, left: 24, right: 24, color: '#fff' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}>
                    {place.mealType === "lunch" ? "점심" : place.mealType === "dinner" ? "저녁" : "점심·저녁"}
                  </span>
                  {place.hasRoom && <span style={{ fontSize: 11, padding: '3px 8px',
                    background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}>룸</span>}
                  {place.hasParking && <span style={{ fontSize: 11, padding: '3px 8px',
                    background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}>주차</span>}
                  {place.naverCategory && <span style={{ fontSize: 11, padding: '3px 8px',
                    background: 'rgba(0,0,0,0.4)', borderRadius: 4 }}>{place.naverCategory}</span>}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{place.name}</div>
                <div style={{ fontSize: 13, opacity: 0.95 }}>
                  {place.genre}{place.sub ? ` · ${place.sub}` : ""}
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 28px 28px' }}>
              {place.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                  fontSize: 13, color: '#46474c' }}>
                  <span>📍</span><span>{place.address}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#f7f7f8', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#878a93', marginBottom: 2 }}>인당 예산</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{place.priceRange || "—"}</div>
                </div>
                <div style={{ background: '#f7f7f8', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#878a93', marginBottom: 2 }}>인원</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{place.people || "—"}</div>
                </div>
              </div>

              {place.extras && place.extras.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                  {place.extras.map(r => (
                    <span key={r} style={{ fontSize: 12, color: '#B07900', background: '#FFF8E1',
                      padding: '4px 10px', borderRadius: 999 }}>✓ {r}</span>
                  ))}
                </div>
              )}

              {place.comment && (
                <div style={{ background: '#fffaf0', border: '1px solid #ffe1b3', borderRadius: 10,
                  padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: '#37383c', marginBottom: 6 }}>
                    "{place.comment}"
                  </div>
                  <div style={{ fontSize: 12, color: '#878a93' }}>
                    — {place.nickname}{place.team ? ` · ${place.team}` : ""}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {naverUrl ? (
                  <a className="btn-primary" href={naverUrl} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                    🗺 네이버 지도에서 보기
                  </a>
                ) : (
                  <div style={{ flex: 1, textAlign: 'center', color: '#aeb0b6', fontSize: 13, padding: '12px 0' }}>
                    지도 연결을 위해 주소 정보가 필요해요
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 12,
                borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button className="btn-ghost" onClick={() => setMode("edit")} disabled={busy}
                  style={{ flex: 1, justifyContent: 'center' }}>✏️ 수정</button>
                <button className="btn-ghost" onClick={handleDelete} disabled={busy}
                  style={{ flex: 1, justifyContent: 'center', color: '#d83838', borderColor: 'rgba(216,56,56,0.3)' }}>
                  🗑 삭제
                </button>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ───────── REPORT FORM ─────────
// 폼 옵션 상수 (제보/수정 공통)
const GENRE_OPTS  = ["한식","일식","중식","양식","아시안","고기구이","해산물","분식·면","채식 가능","뷔페"];
const MOOD_OPTS   = [
  { id: "quiet",  l: "조용히 먹고 끝내기" },
  { id: "social", l: "수다 위주" },
  { id: "formal", l: "격식 있게" },
  { id: "casual", l: "캐주얼" },
];
const PEOPLE_OPTS = ["2~4명 소수팀", "5~10명 팀회식", "11~20명 부서", "20명+ 대규모"];
const PRICE_OPTS  = ["~1만원", "1~2만원", "2~3만원", "3~5만원", "5만원+"];
const EXTRA_OPTS  = ["도보 10분 이내","주차 가능","예약 가능","룸/단체석","술 가능","채식 옵션"];

function emptyForm(mealType = "lunch") {
  return {
    name: "", address: "", genre: "한식", mood: "quiet", mealType,
    people: "2~4명 소수팀", priceRange: "1~2만원", extras: [],
    comment: "", nickname: "", team: "",
  };
}

// 제보 폼 / 수정 폼이 공유하는 입력 컴포넌트.
// onSubmit(form), onCancel() 콜백을 prop으로 받음.
function PlaceForm({ initial, submitLabel = "보내기", busy = false, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...emptyForm(), ...initial }));
  const set = (patch) => setForm(f => ({ ...f, ...patch }));
  const toggleExtra = (v) =>
    setForm(f => ({
      ...f,
      extras: f.extras.includes(v) ? f.extras.filter(x => x !== v) : [...f.extras, v],
    }));

  function submit(e) {
    e.preventDefault();
    if (busy) return;
    onSubmit && onSubmit(form);
  }

  const label = { fontSize: 13, color: '#37383c', fontWeight: 600, marginBottom: 8 };
  const input = {
    width: '100%', height: 42, padding: '0 12px', borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.12)', fontSize: 14, fontFamily: 'inherit',
    background: '#fff', boxSizing: 'border-box', color: '#1b1c1e',
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={label}>가게 이름 *</div>
        <input style={input} value={form.name} onChange={e => set({ name: e.target.value })}
          placeholder="예: 법카로 다녀온 그 가게" />
      </div>

      <div>
        <div style={label}>주소 *</div>
        <input style={input} value={form.address} onChange={e => set({ address: e.target.value })}
          placeholder="예: 경기 성남시 분당구 판교역로 152" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={label}>점심 / 저녁</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ id: "lunch", l: "🌞 점심" }, { id: "dinner", l: "🌙 저녁" }, { id: "both", l: "둘 다" }].map(m => (
              <span key={m.id} className={"chip" + (form.mealType === m.id ? " on" : "")}
                onClick={() => set({ mealType: m.id })}>{m.l}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={label}>장르</div>
          <select style={input} value={form.genre} onChange={e => set({ genre: e.target.value })}>
            {GENRE_OPTS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div style={label}>분위기</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {MOOD_OPTS.map(m => (
            <span key={m.id} className={"chip" + (form.mood === m.id ? " on" : "")}
              onClick={() => set({ mood: m.id })}>{m.l}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={label}>적정 인원</div>
          <select style={input} value={form.people} onChange={e => set({ people: e.target.value })}>
            {PEOPLE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <div style={label}>인당 예산</div>
          <select style={input} value={form.priceRange} onChange={e => set({ priceRange: e.target.value })}>
            {PRICE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div style={label}>특징 (해당되는 것 모두)</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EXTRA_OPTS.map(x => (
            <span key={x} className={"chip" + (form.extras.includes(x) ? " on" : "")}
              onClick={() => toggleExtra(x)}>{x}</span>
          ))}
        </div>
      </div>

      <div>
        <div style={label}>한 줄 추천</div>
        <textarea style={{ ...input, height: 80, padding: '10px 12px', resize: 'vertical' }}
          value={form.comment} onChange={e => set({ comment: e.target.value })}
          placeholder="예: 법카 긁기 딱 좋은 가격대. 팀장님도 만족하심."/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={label}>닉네임</div>
          <input style={input} value={form.nickname} onChange={e => set({ nickname: e.target.value })}
            placeholder="예: 회식왕"/>
        </div>
        <div>
          <div style={label}>팀 / 부서</div>
          <input style={input} value={form.team} onChange={e => set({ team: e.target.value })}
            placeholder="예: 개발팀"/>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "제출 중..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>취소</button>
        )}
      </div>
    </form>
  );
}

// Apps Script로 POST. action이 없으면 신규 등록(create), 있으면 update/delete.
async function postToAppsScript(payload) {
  const url = (window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL) || "";
  if (!url || url === "여기에_URL_입력") {
    throw new Error("Apps Script URL이 설정되지 않았어요. config.js를 확인해주세요.");
  }
  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

function ReportForm({ toast, onSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0); // 리셋 트리거

  async function handle(form) {
    if (submitting) return;
    if (!form.name.trim() || !form.address.trim()) {
      toast("가게 이름과 주소는 필수예요.", "err");
      return;
    }
    setSubmitting(true);
    const entry = {
      ...form,
      submittedAt: new Date().toISOString(),
      id: `restaurant-${Date.now()}`,
      reports: 1,
    };
    try {
      await postToAppsScript(entry);
      toast("먹숭이가 받았어요! 동료들 팀비 고민 해결에 큰 도움이 됩니다 🍌");
      setFormKey(k => k + 1);
      onSubmitted && onSubmitted(entry);
    } catch (err) {
      toast(err.message || "제출에 실패했어요. 잠시 후 다시 시도해주세요.", "err");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wizard-page" style={{ maxWidth: 720 }}>
      <MascotSay mood="hungry">
        팀비 잘 쓰는 법, 동료들이 궁금해해요. <b>가게 정보</b>를 알려주세요.
      </MascotSay>
      <PlaceForm key={formKey} submitLabel="제보 올리기"
        busy={submitting} onSubmit={handle}/>
    </div>
  );
}

// ───────── REPORT FEED ─────────
function ReportFeed({ places, onDetail, onNav }) {
  const filtered = useMemo(() => dataHelpers.sortByRecent(places), [places]);

  return (
    <div className="result-page">
      <div className="result-inner">
        <h2 style={{ font: 'var(--text-h2)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          제보 피드
        </h2>
        <p style={{ color: '#70737c', margin: '0 0 24px' }}>
          동료들이 직접 다녀와서 남긴 한 줄 추천이에요.
        </p>
        {filtered.length === 0 ? (
          <EmptyState onReport={() => onNav("제보하기")}/>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => (
              <div key={p.id} className="opt-card" onClick={() => onDetail(p.id)}
                style={{ background: '#fff', borderRadius: 12, padding: 16,
                  border: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 14, cursor: 'pointer' }}>
                <div style={{ width: 80, flex: '0 0 80px' }}><PlaceThumb place={p} h={64} rounded={6}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#70737c', marginTop: 2, marginBottom: 6 }}>
                    {p.genre} · {p.priceRange || "예산 미정"}
                    {p.nickname && ` · ${p.nickname}`}
                  </div>
                  {p.comment && (
                    <div style={{ fontSize: 13, color: '#37383c', lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      "{p.comment}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ───────── HOT PICKS ─────────
function HotPicks({ places, onDetail, onNav }) {
  const sorted = useMemo(() => dataHelpers.sortByReports(places), [places]);

  return (
    <div className="result-page">
      <div className="result-inner">
        <h2 style={{ font: 'var(--text-h2)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          🔥 이번주 핫픽
        </h2>
        <p style={{ color: '#70737c', margin: '0 0 24px' }}>
          동료들 사이에서 제보가 가장 많이 들어온 가게들이에요.
        </p>
        {sorted.length === 0 ? (
          <EmptyState onReport={() => onNav("제보하기")}/>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sorted.map((p, i) => (
              <div key={p.id} className="opt-card result-card" style={{
                background: '#fff', borderRadius: 16, padding: 20,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: i === 0 ? '0 8px 24px rgba(0,102,255,0.08)' : 'none',
                cursor: 'pointer',
              }} onClick={() => onDetail(p.id)}>
                <div className="result-card-img"><PlaceThumb place={p} h={140}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700,
                      color: i === 0 ? '#FF9200' : i === 1 ? '#878a93' : '#a78368' }}>
                      #{i + 1}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 8px', background: '#FFF1DB',
                      color: '#D17600', borderRadius: 4, fontWeight: 600 }}>제보 {p.reports}건</span>
                  </div>
                  <div style={{ font: 'var(--text-title-1)', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: '#70737c', marginBottom: 8 }}>
                    {p.genre}{p.sub ? ` · ${p.sub}` : ""} · {p.priceRange || "예산 미정"}
                  </div>
                  {p.comment && (
                    <div style={{ background: '#f7f7f8', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, color: '#37383c' }}>"{p.comment}"</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ───────── APP ─────────
// 위저드 필터는 제보 폼과 동일한 한국어 라벨을 저장한다 (필터/폼 일치)
const DEFAULT_FILTERS = {
  mode: null, people: null, mood: null, genres: [], budget: null, conditions: [],
};

// 낙관적 업데이트용: Apps Script가 JSON에 반영하기 전까지 localStorage에서 유지.
// 정식 JSON에 같은 id가 등장하면 자동으로 정리됨.
// pending: 신규 등록 + 로컬 수정본 (id 같으면 JSON보다 우선)
// deletedIds: 로컬에서 삭제한 id 목록 (JSON에서 사라질 때까지 숨김)
const PENDING_KEY = "jjop.pending";
const DELETED_KEY = "jjop.deletedIds";
function loadJsonArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveJsonArray(key, arr) {
  try { localStorage.setItem(key, JSON.stringify(arr)); } catch {}
}
const loadPending = () => loadJsonArray(PENDING_KEY);
const savePending = (arr) => saveJsonArray(PENDING_KEY, arr);
const loadDeletedIds = () => loadJsonArray(DELETED_KEY);
const saveDeletedIds = (arr) => saveJsonArray(DELETED_KEY, arr);

function App() {
  const [tab, setTab] = useState("추천");
  const [recScreen, setRecScreen] = useState("landing"); // landing | step1..4 | result
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [detailId, setDetailId] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [toastEl, toast] = useToast();

  // 데이터 로드 — JSON + localStorage 펜딩/삭제 머지
  const loadData = useCallback(() => {
    const path = (window.APP_CONFIG && window.APP_CONFIG.RESTAURANTS_JSON) || "src/data/restaurants.json";
    fetch(path, { cache: "no-cache" })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.statusText)))
      .then(arr => {
        const jsonList = Array.isArray(arr) ? arr.map(dataHelpers.normalize) : [];
        const jsonIds = new Set(jsonList.map(p => p.id));

        // 1) deletedIds 정리: 이미 JSON에서 사라졌으면 더 이상 숨길 필요 없음
        const deleted = loadDeletedIds();
        const stillDeleted = deleted.filter(id => jsonIds.has(id));
        if (stillDeleted.length !== deleted.length) saveDeletedIds(stillDeleted);
        const deletedSet = new Set(stillDeleted);

        // 2) pending 정리: 같은 id가 JSON에 등장했으면 정식 데이터에 양보
        const pending = loadPending();
        const stillPending = pending.filter(p => !jsonIds.has(p.id));
        if (stillPending.length !== pending.length) savePending(stillPending);
        const pendingIds = new Set(stillPending.map(p => p.id));

        // 3) 머지: pending(상단) + JSON(deletedSet 제외, pendingIds 와 충돌 안 함)
        const merged = [
          ...stillPending.map(dataHelpers.normalize),
          ...jsonList.filter(p => !deletedSet.has(p.id) && !pendingIds.has(p.id)),
        ];
        setPlaces(merged);
        setLoadError(null);
      })
      .catch(err => {
        // JSON 로드 실패해도 펜딩 항목은 보여줌
        const pending = loadPending();
        setPlaces(pending.map(dataHelpers.normalize));
        setLoadError(err.message || "데이터 로드 실패");
      });
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  // 제보 폼 성공 시: 즉시 places에 추가 + localStorage 저장
  const handleSubmitted = useCallback((entry) => {
    if (!entry || !entry.id) return;
    const pending = loadPending();
    savePending([entry, ...pending.filter(p => p.id !== entry.id)]);
    const normalized = dataHelpers.normalize(entry);
    setPlaces(prev => [normalized, ...prev.filter(p => p.id !== entry.id)]);
  }, []);

  // 상세 모달에서 수정 성공: pending 에 덮어쓰기 (JSON 보다 우선되도록)
  const handleUpdated = useCallback((entry) => {
    if (!entry || !entry.id) return;
    const pending = loadPending();
    savePending([entry, ...pending.filter(p => p.id !== entry.id)]);
    const normalized = dataHelpers.normalize(entry);
    setPlaces(prev => prev.map(p => p.id === entry.id ? normalized : p));
  }, []);

  // 상세 모달에서 삭제 성공: 화면에서 제거 + deletedIds 에 기록 + pending 에서도 제거
  const handleDeleted = useCallback((id) => {
    if (!id) return;
    savePending(loadPending().filter(p => p.id !== id));
    const deleted = loadDeletedIds();
    if (!deleted.includes(id)) saveDeletedIds([id, ...deleted]);
    setPlaces(prev => prev.filter(p => p.id !== id));
    setDetailId(curr => curr === id ? null : curr);
  }, []);

  const set = (patch) => setFilters(f => ({ ...f, ...patch }));
  const toggleGenre = (g) => setFilters(f => ({
    ...f, genres: f.genres.includes(g) ? f.genres.filter(x => x !== g) : [...f.genres, g],
  }));
  const toggleCond = (c) => setFilters(f => ({
    ...f, conditions: f.conditions.includes(c) ? f.conditions.filter(x => x !== c) : [...f.conditions, c],
  }));

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleNav = (target) => {
    setTab(target);
    if (target === "추천") setRecScreen("landing");
  };

  const handleStart = () => setRecScreen("step1");
  const handleBrowse = () => {
    resetFilters();
    setRecScreen("result");
  };
  const handleHome = () => {
    setTab("추천");
    setRecScreen("landing");
  };

  // 키보드 네비 (위저드 동안) — 4단계: mode → people → mood → genre → result
  useEffect(() => {
    function onKey(e) {
      if (tab !== "추천") return;
      if (e.key === "Enter" || e.key === "ArrowRight") {
        if (recScreen === "step1" && filters.mealType) setRecScreen("step2");
        else if (recScreen === "step2") setRecScreen("step3");
        else if (recScreen === "step3" && filters.mood) setRecScreen("step4");
        else if (recScreen === "step4") setRecScreen("result");
      } else if (e.key === "ArrowLeft") {
        if (recScreen === "step2") setRecScreen("step1");
        else if (recScreen === "step3") setRecScreen("step2");
        else if (recScreen === "step4") setRecScreen("step3");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab, recScreen, filters.mealType, filters.mood]);

  const detailPlace = detailId ? places.find(p => p.id === detailId) : null;

  let content;
  if (tab === "추천") {
    if (recScreen === "landing") {
      content = <Landing onStart={handleStart} onBrowse={handleBrowse}
        places={places} onNav={handleNav}/>;
    } else if (recScreen === "step1") {
      content = <StepMode filters={filters} set={set}
        next={() => setRecScreen("step2")} back={handleHome}/>;
    } else if (recScreen === "step2") {
      content = <StepPeople filters={filters} set={set}
        next={() => setRecScreen("step3")} back={() => setRecScreen("step1")}/>;
    } else if (recScreen === "step3") {
      content = <StepMood filters={filters} set={set}
        next={() => setRecScreen("step4")} back={() => setRecScreen("step2")}/>;
    } else if (recScreen === "step4") {
      content = <StepGenre filters={filters} set={set} toggleGenre={toggleGenre} toggleCond={toggleCond}
        finish={() => setRecScreen("result")} back={() => setRecScreen("step3")}/>;
    } else if (recScreen === "result") {
      content = <Result filters={filters} set={set} toggleGenre={toggleGenre} toggleCond={toggleCond}
        places={places}
        onDetail={id => setDetailId(id)}
        onReset={() => { resetFilters(); }}
        onBack={() => setRecScreen("step4")}
        onNav={handleNav}
        toast={toast}/>;
    }
  } else if (tab === "제보 피드") {
    content = <ReportFeed places={places}
      onDetail={id => setDetailId(id)} onNav={handleNav}/>;
  } else if (tab === "제보하기") {
    content = <ReportForm toast={toast} onSubmitted={handleSubmitted}/>;
  } else if (tab === "이번주 핫픽") {
    content = <HotPicks places={places}
      onDetail={id => setDetailId(id)} onNav={handleNav}/>;
  }

  return (
    <div className="app-shell">
      <TopNav active={tab} onNav={handleNav}/>
      <div className="body">
        {loadError && (
          <div style={{ background: '#fff3cd', color: '#7a5a00', padding: '10px 16px',
            fontSize: 13, textAlign: 'center', borderBottom: '1px solid #f0e0a0' }}>
            데이터를 불러오지 못했어요: {loadError} (HTTP 서버로 열어야 동작해요)
          </div>
        )}
        <StepFade stepKey={tab + ":" + recScreen}>{content}</StepFade>
      </div>
      {detailPlace && <DetailModal place={detailPlace}
        onClose={() => setDetailId(null)}
        onUpdate={handleUpdated} onDelete={handleDeleted} toast={toast}/>}
      {toastEl}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
