import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './About.css';

/* ── Config ─────────────────────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left:  `${(i * 4.17) % 100}%`,
  size:  Math.random() * 3 + 2,
  dur:   `${Math.random() * 14 + 10}s`,
  delay: `${Math.random() * 16}s`,
}));

const CHIPS = ['NGN Payments', 'Rust Engine', 'Fair Revenue', 'Transparent Data', 'Built in Gombe', 'Privacy First'];

const STATS = [
  { num: '50K+', label: 'Creators Joined'  },
  { num: '₦2M+', label: 'Paid Out Monthly' },
  { num: '99ms', label: 'Avg Latency'      },
  { num: '∞',    label: 'Room to Grow'     },
];

const HUD_DATA = [
  { key: 'Platform',      val: 'Monteeq v2.0', cls: '' },
  { key: 'Currency',      val: 'NGN (₦)',       cls: '' },
  { key: 'Per 1K views',  val: '₦99.00',        cls: '' },
  { key: 'Min payout',    val: '₦1,000',        cls: '' },
  { key: 'Payout SLA',    val: '≤ 48 hours',    cls: '' },
  { key: 'Status',        val: 'LIVE ✓',         cls: 'ok' },
];

const VALUES = [
  { icon: '🌍', title: 'Africa First',       desc: 'Built for Nigerian creators — priced in Naira, tuned for local networks.' },
  { icon: '⚡', title: 'Millisecond Speed',  desc: 'Rust video engine. Sub-100ms API. CDN-first architecture globally.' },
  { icon: '🔒', title: 'Privacy Sacred',     desc: 'Your wallet balance is yours. Viewers never see your real earnings.' },
  { icon: '💎', title: 'Fair Algorithm',     desc: 'No black-box demonetization. Every ₦99 is logged, auditable, yours.' },
  { icon: '🎨', title: 'Creator-Obsessed',  desc: 'Every feature starts with: does this help the creator win?' },
  { icon: '🚀', title: 'Built to Scale',     desc: 'Designed for millions. Real-time queues, async workers, zero downtime.' },
];

const TIMELINE = [
  { year: '1 Nov 2025', title: 'Development Begins', desc: 'First line of code written in Gombe, Nigeria. The idea: a video platform that actually pays creators fairly.' },
  { year: 'Nov 2025',   title: 'Flash Clips Added',   desc: 'Short-form vertical video format shipped days after launch. Creators immediately embraced it.' },
  { year: 'Dec 2025',   title: 'Monetization v1',     desc: 'Creator wallets, tipping, subscriptions, and bank payout requests all went live.' },
  { year: 'Early 2026', title: 'Growing Fast',         desc: 'More features. More creators. The foundation is solid. Everything else is next.' },
  { year: 'Now',        title: 'This Is Just Day 1',   desc: 'We are at the very beginning. The infrastructure is here. The creators are coming.' },
];

const TEAM = [
  { initials: 'MT', name: 'Monteeq Core',     role: 'Mission Control',    dur: '6s', delay: '0s' },
  { initials: 'BE', name: 'Backend Eng.',     role: 'API Architects',     dur: '7s', delay: '0.4s' },
  { initials: 'FE', name: 'Frontend Crew',    role: 'Interface Craft',    dur: '5s', delay: '0.8s' },
  { initials: 'CR', name: 'Creator Rel.',     role: 'Community Pilots',   dur: '8s', delay: '1.2s' },
];

/* ── Hook: 3D mouse tilt on an element ─────────────────────────────── */
function use3DTilt(ref, intensity = 18) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.setProperty('--tilt-x', `${y * -intensity}deg`);
      el.style.setProperty('--tilt-y', `${x *  intensity}deg`);
      // Also update sheen position
      el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    };
    const onLeave = () => {
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [ref, intensity]);
}

/* ── Hook: Magnetic button ─────────────────────────────────────────── */
function useMagnetic(ref, strength = 12) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      el.style.setProperty('--mx', `${(e.clientX - cx) * 0.25}px`);
      el.style.setProperty('--my', `${(e.clientY - cy) * 0.25}px`);
    };
    const onLeave = () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [ref, strength]);
}

/* ── Hook: Intersection observer reveal ───────────────────────────── */
function useReveal(rootSelector = '.abt-reveal') {
  useEffect(() => {
    const els = document.querySelectorAll(rootSelector);
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [rootSelector]);
}

/* ── Generic 3D card: applies mousemove tilt per-card ──────────────── */
const TiltCard = ({ className = '', children, style = {} }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.setProperty('--cx', `${y * -14}deg`);
      el.style.setProperty('--cy', `${x *  14}deg`);
      el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    };
    const onLeave = () => {
      el.style.setProperty('--cx', '0deg');
      el.style.setProperty('--cy', '0deg');
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  return <div ref={ref} className={className} style={style}>{children}</div>;
};

/* ── Animated character-by-character title ─────────────────────────── */
const SplitText = ({ text, className, delay = 0 }) => (
  <span className={className} aria-label={text}>
    {text.split('').map((char, i) => (
      <span
        key={i}
        aria-hidden="true"
        style={{
          display: 'inline-block',
          opacity: 0,
          animation: `slide-up-stagger 0.5s ${delay + i * 0.03}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
);

/* ── Animated counting number ──────────────────────────────────────── */
const CountNum = ({ value, delay = 0 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.animation = `counter-snap 0.6s ${delay}s cubic-bezier(0.22,1,0.36,1) both`;
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <span ref={ref} className="ab-stat-num">{value}</span>;
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
const About = () => {
  const hudRef = useRef(null);
  const btnRef = useRef(null);

  use3DTilt(hudRef, 12);
  useMagnetic(btnRef);
  useReveal('.abt-reveal');

  return (
    <div className="ab-page">

      {/* BG layers */}
      <div className="ab-grid" aria-hidden="true" />
      <div className="ab-grid-3d" aria-hidden="true" />
      <div className="ab-grain" aria-hidden="true" />

      {/* Ambient blobs */}
      <div aria-hidden="true" className="ab-blob" style={{ width: 700, height: 500, top: '-10%',   right: '-15%', background: 'rgba(255,59,48,0.08)',  '--dur': '28s', '--fdur': '20s', '--fdelay': '0s'  }} />
      <div aria-hidden="true" className="ab-blob" style={{ width: 500, height: 500, top: '50%',    left: '-12%',  background: 'rgba(255,59,48,0.05)',  '--dur': '22s', '--fdur': '24s', '--fdelay': '3s'  }} />
      <div aria-hidden="true" className="ab-blob" style={{ width: 300, height: 300, bottom: '15%', right: '20%',  background: 'rgba(255,255,255,0.02)', '--dur': '18s', '--fdur': '16s', '--fdelay': '6s'  }} />

      {/* Rising particles */}
      {PARTICLES.map(p => (
        <div key={p.id} aria-hidden="true" className="ab-particle" style={{
          left: p.left, bottom: '-20px',
          width: p.size, height: p.size,
          '--dur': p.dur, '--delay': p.delay,
        }} />
      ))}

      {/* ═══ HERO ═══════════════════════════════════════ */}
      <section className="ab-hero">
        {/* Concentric pulse rings */}
        <div className="ab-hero-rings" aria-hidden="true">
          <div className="ab-ring"       style={{ width: 400, height: 400 }} />
          <div className="ab-ring"       style={{ width: 600, height: 600 }} />
          <div className="ab-ring"       style={{ width: 800, height: 800 }} />
          <div className="ab-ring-pulse" style={{ width: 300, height: 300 }} />
          <div className="ab-ring-pulse" style={{ width: 300, height: 300 }} />
          <div className="ab-ring-pulse" style={{ width: 300, height: 300 }} />
        </div>

        {/* Badge */}
        <div className="ab-badge">
          <span className="ab-badge-dot" />
          Monteeq · Dev started Nov 1, 2025 · Gombe, Nigeria
        </div>

        {/* Chromatic aberration title */}
        <h1 className="ab-hero-title">
          <SplitText text="Built Different." className="ab-title-line white" delay={0.1} />
          <span
            className="ab-title-line red"
            data-text="Paying Fair."
            style={{ display: 'block', opacity: 0, animation: 'slide-up-stagger 0.8s 0.5s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            Paying Fair.
          </span>
        </h1>

        <p className="ab-hero-sub">
          Born in Gombe on <strong style={{color:'white'}}>November 1st, 2025</strong> — this is just the beginning.
          A platform built to pay Nigerian creators fairly, move fast, and grow with them.
        </p>

        {/* Floating chips */}
        <div className="ab-chips">
          {CHIPS.map((c, i) => (
            <div key={i} className="ab-chip" style={{ '--dur': `${3.8 + i * 0.4}s`, '--delay': `${i * 0.15}s` }}>
              {c}
            </div>
          ))}
        </div>

        <div className="ab-scroll-cue" aria-hidden="true">
          <div className="ab-scroll-bar" />
          scroll
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════ */}
      <div className="ab-section" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        <div className="ab-stats abt-reveal">
          {STATS.map((s, i) => (
            <div key={i} className="ab-stat">
              <CountNum value={s.num} delay={i * 0.1} />
              <span className="ab-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ MISSION ════════════════════════════════════ */}
      <div className="ab-section">
        <div className="abt-reveal">
          <div className="ab-eyebrow">Mission</div>
          <h2 className="ab-h2">Built to Fix<br />What Was Broken</h2>
          <div className="ab-rule" />
        </div>

        <div className="ab-mission-grid">
          <div className="ab-mission-copy abt-reveal">
            <p>We started on <strong>November 1st, 2025</strong> from Gombe, Nigeria — not Silicon Valley, not Lagos. A small city with a big idea: what if creators were actually paid first?</p>
            <p><strong>Most platforms treat creators as an afterthought.</strong> Monteeq was built the other way around — the wallet, the payout, the Naira rate, that all came before everything else.</p>
            <p>This is Year 1. The foundation is solid. The community is growing. And we are just getting started.</p>
          </div>

          <div className="ab-hud abt-reveal" ref={hudRef}>
            <div className="ab-hud-br" aria-hidden="true" />
            <div className="ab-hud-header">
              <div className="ab-hud-dot" />
              Creator HUD · LIVE FEED
            </div>
            {HUD_DATA.map((row, i) => (
              <div className="ab-hud-row" key={i}>
                <span className="ab-hud-key">{row.key}</span>
                <span className={`ab-hud-val ${row.cls}`}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ VALUES ═════════════════════════════════════ */}
      <div className="ab-section">
        <div className="abt-reveal">
          <div className="ab-eyebrow">Core Values</div>
          <h2 className="ab-h2">The Principles<br />We Ship By</h2>
          <div className="ab-rule" />
        </div>

        <div className="ab-values-grid">
          {VALUES.map((v, i) => (
            <TiltCard
              key={i}
              className="ab-card abt-reveal"
              style={{ animationDelay: `${i * 0.08}s`, '--ifloat': `${4 + i * 0.4}s`, '--idelay': `${i * 0.3}s` }}
            >
              <div className="ab-card-sheen" aria-hidden="true" />
              <span className="ab-card-icon">{v.icon}</span>
              <div className="ab-card-title">{v.title}</div>
              <div className="ab-card-desc">{v.desc}</div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* ═══ TIMELINE ═══════════════════════════════════ */}
      <div className="ab-section">
        <div className="abt-reveal">
          <div className="ab-eyebrow">Journey</div>
          <h2 className="ab-h2">How We Got Here</h2>
          <div className="ab-rule" />
        </div>

        <div className="ab-timeline">
          {TIMELINE.map((t, i) => (
            <div
              key={i}
              className="ab-tl-item abt-reveal"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="ab-tl-year">{t.year}</div>
              <div className="ab-tl-spine">
                <div className="ab-tl-dot" />
                <div className="ab-tl-line" />
              </div>
              <div>
                <div className="ab-tl-title">{t.title}</div>
                <div className="ab-tl-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TEAM ═══════════════════════════════════════ */}
      <div className="ab-section">
        <div className="abt-reveal">
          <div className="ab-eyebrow">Crew</div>
          <h2 className="ab-h2">The People<br />Behind the Platform</h2>
          <div className="ab-rule" />
        </div>

        <div className="ab-team-grid">
          {TEAM.map((m, i) => (
            <TiltCard
              key={i}
              className="ab-team-card abt-reveal"
              style={{ '--fdur': m.dur, '--fdelay': m.delay, animationDelay: `${i * 0.1}s` }}
            >
              <div className="ab-avatar">{m.initials}</div>
              <div className="ab-team-name">{m.name}</div>
              <div className="ab-team-role">{m.role}</div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* ═══ CTA ════════════════════════════════════════ */}
      <div className="ab-cta">
        <div className="ab-cta-glow" aria-hidden="true" />
        <h2 className="ab-cta-title abt-reveal">
          Ready to <em>Take Off?</em>
        </h2>
        <p className="ab-cta-sub abt-reveal">
          Development began November 1st, 2025 in Gombe. Still building — this is just the start.<br />
          Be one of the first to upload when we go live.
        </p>
        <Link to="/upload" className="ab-cta-btn" ref={btnRef}>
          Start Creating →
        </Link>
      </div>

    </div>
  );
};

export default About;
