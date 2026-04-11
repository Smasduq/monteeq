import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Zap, Users, TrendingUp, Shield, ArrowRight, Upload, Eye, DollarSign, Sparkles } from 'lucide-react';
import './Landing.css';

/* ── Particles ─────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 5.26) % 100}%`,
  size: Math.random() * 3 + 2,
  dur: `${Math.random() * 14 + 10}s`,
  delay: `${Math.random() * 16}s`,
}));

/* ── Stats ─────────────────────────────────────────────── */
const STATS = [
  { num: '50K+', label: 'Active Creators' },
  { num: '₦2M+', label: 'Paid Monthly' },
  { num: '99ms', label: 'Avg Latency' },
  { num: '24/7', label: 'Always Online' },
];

/* ── Features ──────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Upload size={26} />,
    title: 'Upload & Earn',
    desc: 'Upload your edits. Every 1,000 views earns you ₦99. Real money, real fast.',
  },
  {
    icon: <Eye size={26} />,
    title: 'Flash Clips',
    desc: 'Short-form vertical videos built for mobile. Swipe, watch, create.',
  },
  {
    icon: <DollarSign size={26} />,
    title: 'Fair Monetization',
    desc: 'Transparent payout system. No hidden algorithms. Every naira is auditable.',
  },
  {
    icon: <Users size={26} />,
    title: 'Community Challenges',
    desc: 'Compete in editing challenges. Win cash prizes. Build your reputation.',
  },
  {
    icon: <Shield size={26} />,
    title: 'Your Data, Your Rules',
    desc: 'Privacy-first architecture. Your wallet balance stays between you and your bank.',
  },
  {
    icon: <Sparkles size={26} />,
    title: 'Built for Africa',
    desc: 'Nigerian banks, Naira currency, local CDN. Made for creators who create here.',
  },
];

/* ── How It Works ──────────────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Create an Account', desc: 'Sign up in seconds. No paperwork, no gatekeeping.' },
  { num: '02', title: 'Upload Your Content', desc: 'Videos, flash clips, or posts. Your creativity, your format.' },
  { num: '03', title: 'Get Paid', desc: 'Earn per view. Request payouts directly to your Nigerian bank account.' },
];

/* ── Scroll reveal hook ────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.ld-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('ld-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── 3D Tilt Card ──────────────────────────────────────── */
const TiltCard = ({ className = '', children, style = {} }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--cx', `${y * -12}deg`);
      el.style.setProperty('--cy', `${x * 12}deg`);
      el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    };
    const onLeave = () => { el.style.setProperty('--cx', '0deg'); el.style.setProperty('--cy', '0deg'); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);
  return <div ref={ref} className={className} style={style}>{children}</div>;
};

/* ── Animated counting number ──────────────────────────── */
const CountNum = ({ value, delay = 0 }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.animation = `ld-counter-snap 0.6s ${delay}s cubic-bezier(0.22,1,0.36,1) both`;
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <span ref={ref} className="ld-stat-num">{value}</span>;
};

/* ═══════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════ */
const Landing = () => {
  const navigate = useNavigate();
  useReveal();

  return (
    <div className="ld-page">
      {/* BG Layers */}
      <div className="ld-grid" aria-hidden="true" />
      <div className="ld-grid-3d" aria-hidden="true" />
      <div className="ld-grain" aria-hidden="true" />

      {/* Ambient blobs */}
      <div aria-hidden="true" className="ld-blob" style={{ width: 700, height: 500, top: '-10%', right: '-15%', background: 'rgba(255,59,48,0.08)', '--dur': '28s', '--fdur': '20s', '--fdelay': '0s' }} />
      <div aria-hidden="true" className="ld-blob" style={{ width: 500, height: 500, top: '50%', left: '-12%', background: 'rgba(255,59,48,0.05)', '--dur': '22s', '--fdur': '24s', '--fdelay': '3s' }} />
      <div aria-hidden="true" className="ld-blob" style={{ width: 300, height: 300, bottom: '15%', right: '20%', background: 'rgba(255,255,255,0.02)', '--dur': '18s', '--fdur': '16s', '--fdelay': '6s' }} />

      {/* Particles */}
      {PARTICLES.map(p => (
        <div key={p.id} aria-hidden="true" className="ld-particle" style={{ left: p.left, bottom: '-20px', width: p.size, height: p.size, '--dur': p.dur, '--delay': p.delay }} />
      ))}

      {/* ═══ HERO ═══ */}
      <section className="ld-hero">
        {/* Pulse rings */}
        <div className="ld-hero-rings" aria-hidden="true">
          {[400, 600, 800].map(s => <div key={s} className="ld-ring" style={{ width: s, height: s }} />)}
          {[1, 2, 3].map(i => <div key={`p${i}`} className="ld-ring-pulse" style={{ width: 300, height: 300 }} />)}
        </div>

        <div className="ld-badge">
          <span className="ld-badge-dot" />
          The Home for Video Editors
        </div>

        <h1 className="ld-hero-title">
          <span className="ld-title-white">Create.</span>
          <span className="ld-title-red" data-text="Get Paid.">Get Paid.</span>
        </h1>

        <p className="ld-hero-sub">
          Nigeria's first video platform built to actually pay creators fairly.
          <br />Upload your edits, grow your audience, and earn in <strong style={{ color: 'white' }}>Naira</strong>.
        </p>

        <div className="ld-hero-btns">
          <Link to="/signup" className="ld-primary-btn">
            Start Creating <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="ld-ghost-btn">
            Sign In <Play size={16} />
          </Link>
        </div>

        {/* Floating stat pill */}
        <div className="ld-hero-float">
          <div className="ld-hero-float-icon"><TrendingUp size={18} /></div>
          <div>
            <div className="ld-hero-float-top">₦99 / 1K views</div>
            <div className="ld-hero-float-bot">Transparent rate</div>
          </div>
        </div>

        <div className="ld-scroll-cue" aria-hidden="true">
          <div className="ld-scroll-bar" />
          scroll
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <div className="ld-section" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
        <div className="ld-stats ld-reveal">
          {STATS.map((s, i) => (
            <div key={i} className="ld-stat">
              <CountNum value={s.num} delay={i * 0.1} />
              <span className="ld-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FLOATING TAGS ═══ */}
      <div className="ld-marquee-wrap ld-reveal">
        <div className="ld-marquee">
          {['Video Editing', '₦99/1K Views', 'Flash Clips', 'Nigerian Banks', 'Naira Payouts', 'Community Challenges', 'Creator First', 'Privacy Sacred', 'Sub-100ms API', 'Built in Gombe'].map((tag, i) => (
            <span key={i} className="ld-marquee-tag">{tag}</span>
          ))}
          {['Video Editing', '₦99/1K Views', 'Flash Clips', 'Nigerian Banks', 'Naira Payouts', 'Community Challenges', 'Creator First', 'Privacy Sacred', 'Sub-100ms API', 'Built in Gombe'].map((tag, i) => (
            <span key={`d${i}`} className="ld-marquee-tag" aria-hidden="true">{tag}</span>
          ))}
        </div>
      </div>
      <div className="ld-section">
        <div className="ld-reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="ld-eyebrow">Platform</div>
          <h2 className="ld-h2">Everything You Need<br />To Win as a Creator</h2>
          <div className="ld-rule" style={{ margin: '0 auto' }} />
        </div>
        <div className="ld-features-grid">
          {FEATURES.map((f, i) => (
            <TiltCard
              key={i}
              className="ld-card ld-reveal"
              style={{ animationDelay: `${i * 0.08}s`, '--ifloat': `${4 + i * 0.4}s`, '--idelay': `${i * 0.3}s` }}
            >
              <div className="ld-card-sheen" aria-hidden="true" />
              <div className="ld-card-icon">{f.icon}</div>
              <div className="ld-card-title">{f.title}</div>
              <div className="ld-card-desc">{f.desc}</div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <div className="ld-section">
        <div className="ld-reveal" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="ld-eyebrow">Process</div>
          <h2 className="ld-h2">Three Steps<br />To Your First Naira</h2>
          <div className="ld-rule" style={{ margin: '0 auto' }} />
        </div>
        <div className="ld-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="ld-step ld-reveal" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="ld-step-num">{s.num}</div>
              <div className="ld-step-title">{s.title}</div>
              <div className="ld-step-desc">{s.desc}</div>
              {i < STEPS.length - 1 && <div className="ld-step-arrow" aria-hidden="true"><ArrowRight size={18} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SOCIAL PROOF ═══ */}
      <div className="ld-section">
        <TiltCard className="ld-proof-card ld-reveal">
          <div className="ld-card-sheen" aria-hidden="true" />
          <div className="ld-proof-quote">"Finally, a platform that treats Nigerian creators like professionals."</div>
          <div className="ld-proof-author">— Early Monteeq Creator</div>
        </TiltCard>
      </div>

      {/* ═══ CTA ═══ */}
      <div className="ld-cta">
        <div className="ld-cta-glow" aria-hidden="true" />
        <h2 className="ld-cta-title ld-reveal">
          Ready to <em>Create?</em>
        </h2>
        <p className="ld-cta-sub ld-reveal">
          Join thousands of editors already earning on Monteeq.<br />
          Your audience is waiting.
        </p>
        <div className="ld-cta-btns ld-reveal">
          <Link to="/signup" className="ld-primary-btn">
            Join Free <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="ld-ghost-btn">
            Learn More <Zap size={16} />
          </Link>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="ld-footer">
        <div className="ld-footer-inner">
          <div className="ld-footer-logo">
            <div className="ld-footer-M">M</div>
            <span>Monteeq</span>
          </div>
          <p className="ld-footer-copy">
            © 2026 Monteeq Platform · Founded Nov 1, 2025 · Gombe, Nigeria
          </p>
          <div className="ld-footer-links">
            <Link to="/about">About</Link>
            <Link to="/partner">Partner</Link>
            <Link to="/pro">Pro</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
