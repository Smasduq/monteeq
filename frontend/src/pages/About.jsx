import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, DollarSign, Zap, Fingerprint } from 'lucide-react';
import './About.css';

/* ── Content ─────────────────────────────────────────────── */
const VALUES = [
  { icon: <DollarSign size={24} />, title: 'Direct Monetization', desc: 'You earn ₦99 for every 1K views. No hidden fees.' },
  { icon: <Zap size={24} />, title: 'Insane Speed', desc: 'Fast video processing that instantly renders your highest-quality uploads.' },
  { icon: <Fingerprint size={24} />, title: 'Pure Independence', desc: 'You don’t need to find a single client to start making a living off your editing skills.' },
];

/* ── Lightweight Intersection Observer ───────────────────── */
function useReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('.ab-r').forEach(el => el.classList.add('ab-in'));
      return;
    }

    const els = document.querySelectorAll('.ab-r');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { 
          e.target.classList.add('ab-in'); 
          io.unobserve(e.target); 
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const About = () => {
  useReveal();

  return (
    <div className="ab-page">
      <div className="ab-bg" aria-hidden="true" />

      {/* ═══ HERO & THE STORY ═══ */}
      <section className="ab-hero">
        <h1 className="ab-hero-title ab-r">
          The Story Behind <span className="text-red">Monteeq.</span>
        </h1>

        <p className="ab-hero-sub ab-r" style={{ maxWidth: '650px' }}>
          We built Monteeq for one simple reason: we were tired of watching talented editors get exploited.
        </p>

        <div className="ab-mission-content ab-r" style={{ textAlign: 'left', margin: 0 }}>
          <p>
            For years, the story was the same: you spend countless hours mastering CapCut, Premiere, or After Effects. You hunt for clients, deal with endless revisions, and finally hand over a masterpiece for a flat, low rate.
          </p>
          <p>
            Then, you watch that client rack up millions of views and make real money off your hard work. It felt like a trap. We built Monteeq to break it.
          </p>
        </div>
      </section>

      {/* ═══ MISSION & WHAT WE DO ═══ */}
      <section className="ab-section ab-bg-alt">
        <div className="ab-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
          
          <div className="ab-r">
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', marginBottom: '1rem' }}>Our Mission</h2>
            <p style={{ color: 'var(--ab-text-muted)', lineHeight: 1.7 }}>
              To give video editors a platform where their art directly translates to their income. No middlemen. No chasing invoices.
            </p>
          </div>

          <div className="ab-r">
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', marginBottom: '1rem' }}>What We Actually Do</h2>
            <p style={{ color: 'var(--ab-text-muted)', lineHeight: 1.7 }}>
              Monteeq is incredibly simple. It’s a platform built exclusively for short-form video editors. You upload your edits, and we pay you directly for the views you generate. You focus on making great content; we focus on making sure you get paid for it.
            </p>
          </div>

        </div>
      </section>

      {/* ═══ WHY WE STAND OUT ═══ */}
      <section className="ab-section">
        <div className="ab-header ab-r">
          <h2>Why We Stand Out</h2>
          <p>Most platforms treat creators as an afterthought. We don't.</p>
        </div>
        <div className="ab-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {VALUES.map((v, i) => (
            <div key={i} className="ab-card ab-r">
              <div className="ab-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section className="ab-section ab-bg-alt">
        <div className="ab-header ab-r" style={{ textAlign: 'center', margin: '0 auto 3rem auto', maxWidth: '800px' }}>
          <h2>Built on Trust</h2>
          <p style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
            We know talk is cheap in the creator economy. That’s why we built a transparent dashboard where you watch your view count and your actual balance grow in real-time. We don't hold your money hostage. When you hit the threshold, you cash out straight to your bank account safely and securely.
          </p>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="ab-cta ab-r">
        <h2 style={{ fontSize: '2.5rem' }}>Ready to change the way you work?</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          Your talent shouldn't be making someone else rich. Stop waiting for the perfect client and start building your own asset.
        </p>
        <Link to="/signup" className="ab-btn">
          Join Monteeq Today <ArrowRight size={18} />
        </Link>
      </section>

      {/* ═══ APP FOOTER LOGIC ASSUMED OUTSIDE OR SIMPLE FOOTER INCLUDED ═══ */}
      <footer className="ab-footer" style={{ padding: '3rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'var(--ab-red)', color: 'white', borderRadius: '8px', fontSize: '1rem' }}>M</div>
          <span>Monteeq</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--ab-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Home</Link>
          <Link to="/partner" style={{ color: 'var(--ab-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Partner</Link>
        </div>
      </footer>
    </div>
  );
};

export default About;
