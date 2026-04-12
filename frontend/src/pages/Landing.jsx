import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, DollarSign, Frown, ShieldCheck } from 'lucide-react';
import './Landing.css';

/* ── Benefits ──────────────────────────────────────────── */
const BENEFITS = [
  {
    icon: <ShieldCheck size={24} />,
    title: 'Zero Clients Needed',
    desc: 'Be your own boss. Make what you want to make without waiting for revisions.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Insanely Fast Processing',
    desc: 'Upload and encode heavy edits in seconds without quality loss.',
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Transparent Analytics',
    desc: 'See exactly where your views and earnings are coming from in real-time.',
  }
];

/* ── How It Works ──────────────────────────────────────── */
const STEPS = [
  { num: '1', title: 'Upload', desc: 'Drop your CapCut or After Effects edits onto the platform.' },
  { num: '2', title: 'Go Viral', desc: 'Our algorithm pushes high-quality edits to audiences who care.' },
  { num: '3', title: 'Get Paid', desc: 'Watch your balance grow. Cash out directly to your bank account.' },
];

/* ── Lightweight Intersection Observer ───────────────────── */
function useReveal() {
  useEffect(() => {
    // Only apply animations if user hasn't requested reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('.ld-r').forEach(el => el.classList.add('ld-in'));
      return;
    }

    const els = document.querySelectorAll('.ld-r');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { 
          e.target.classList.add('ld-in'); 
          io.unobserve(e.target); 
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const Landing = () => {
  useReveal();

  return (
    <div className="ld-page">
      <div className="ld-bg" aria-hidden="true" />

      {/* ═══ HERO ═══ */}
      <section className="ld-hero">
        <h1 className="ld-hero-title ld-r">
          Upload your edits.<br />
          <span className="text-red">Get paid for every view.</span>
        </h1>

        <p className="ld-hero-sub ld-r">
          Stop waiting for clients. Turn your short-form video skills into steady income.
        </p>

        <div className="ld-hero-cta ld-r">
          <Link to="/signup" className="ld-btn">
            Start Earning Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ═══ PROBLEM & SOLUTION ═══ */}
      <section className="ld-section ld-bg-alt">
        <div className="ld-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          
          <div className="ld-card ld-r" style={{ border: '1px solid rgba(255, 59, 48, 0.2)', background: 'rgba(255, 59, 48, 0.02)' }}>
            <div className="ld-icon" style={{ color: 'rgba(255, 59, 48, 0.8)' }}><Frown size={32} /></div>
            <h2>You edit. Someone else profits.</h2>
            <p style={{ marginTop: '1rem', lineHeight: 1.7 }}>
              Finding clients is exhausting. You spend hours perfectly timing transitions and sourcing audio, only to hand the video over for a weak flat rate. Then the client gets millions of views. It’s unfair, and it burns you out.
            </p>
          </div>

          <div className="ld-card ld-r" style={{ border: '1px solid rgba(34, 197, 94, 0.2)', background: 'rgba(34, 197, 94, 0.02)' }}>
            <div className="ld-icon" style={{ color: '#22c55e' }}><DollarSign size={32} /></div>
            <h2>Edit on your terms. Earn on your views.</h2>
            <p style={{ marginTop: '1rem', lineHeight: 1.7 }}>
              Monteeq pays you directly for the content you create. No client revisions. No chasing invoices. Just upload your best edits, grow your audience, and get paid for the views you pull in.
            </p>
          </div>

        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="ld-section">
        <div className="ld-header ld-r">
          <h2>3 Steps to Cash</h2>
        </div>
        <div className="ld-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="ld-step ld-r">
              <div className="ld-num">{s.num}</div>
              <div className="ld-step-content">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="ld-section ld-bg-alt">
        <div className="ld-header ld-r">
          <h2>Built exactly for editors.</h2>
        </div>
        <div className="ld-grid">
          {BENEFITS.map((b, i) => (
            <div key={i} className="ld-card ld-r">
              <div className="ld-icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="ld-footer">
        <div className="ld-footer-brand">
          <div className="ld-logo">M</div>
          <span>Monteeq</span>
        </div>
        <div className="ld-footer-links">
          <Link to="/about">About Us</Link>
          <Link to="/partner">Partner</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
