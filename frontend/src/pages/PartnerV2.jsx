import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Network, Users, TrendingUp,
  Eye, Settings, Monitor,
  Target, Megaphone, MessageSquare, Check,
  FilePlus, Edit3, Award,
  ArrowRight, Zap, ArrowUp, Loader2
} from 'lucide-react';
import './PartnerV2.css';

/* ── Particles ────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i, left: `${(i * 5.26) % 100}%`,
  size: Math.random() * 3 + 2,
  dur:  `${Math.random() * 14 + 10}s`,
  delay:`${Math.random() * 16}s`,
}));

/* ── Content pulled from existing components ─────────── */
const WHAT_WE_DO = [
  { icon: <Network size={26} />, title: 'Content Bridge',    desc: 'We act as the bridge between your brand\'s raw vision and a network of world-class video editors.' },
  { icon: <Users   size={26} />, title: 'Viral Community',   desc: 'Our community specialises in short-form, high-impact content that thrives on social media.' },
  { icon: <TrendingUp size={26} />, title: 'Engagement Growth', desc: 'Content that doesn\'t just look good — it drives real interaction, shares, and measurable growth.' },
];

const STEPS = [
  { num: '01', icon: <FilePlus size={30} />, title: 'Submit a Campaign',     desc: 'Define your brand\'s vision, objectives and style guide. Upload assets for our editors.' },
  { num: '02', icon: <Edit3    size={30} />, title: 'Editors Create',        desc: 'Our world-class editors transform your assets into viral masterpieces across all formats.' },
  { num: '03', icon: <Award    size={30} />, title: 'Top Edits Win Rewards', desc: 'Best performing edits get rewarded — a win for your brand and for our creators.' },
];

const BENEFITS = [
  { icon: <Eye     size={22} />, title: 'Viral Exposure',       desc: 'Experts in content that captures attention across TikTok, Reels, and YouTube Shorts.' },
  { icon: <Settings size={22} />, title: 'High-Quality UGC',    desc: 'Authentic, user-generated content that feels organic and relatable — not like an ad.' },
  { icon: <Users   size={22} />, title: 'Expert Community',     desc: 'Access our exclusive editor community without the hassle of individual recruitment.' },
  { icon: <Monitor size={22} />, title: 'Increased Engagement', desc: 'Drive meaningful likes, shares, and follows with content people actually want to watch.' },
];

const OPTIONS = [
  {
    icon: <Target    size={28} />, title: 'Sponsored Challenges',
    desc: 'Encourage editors to create content around your product for a prize. Generates high-quality assets and massive buzz.',
    tags: ['High engagement', 'Viral opportunity', 'Authentic content'],
  },
  {
    icon: <Megaphone size={28} />, title: 'Brand Promotion',
    desc: 'Partner with our top-tier editors for a direct promotional campaign across our entire platform.',
    tags: ['Top editor access', 'Brand awareness', 'Consistent styling'],
    featured: true,
  },
  {
    icon: <MessageSquare size={28} />, title: 'Content Collaboration',
    desc: 'Co-create content with our community for unique experiences that resonate with the Monteeq audience.',
    tags: ['Unique ideas', 'Native placement', 'Creative synergy'],
  },
];

/* ── 3D Tilt Card ────────────────────────────────────── */
const TiltCard = ({ className = '', children, style = {} }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.setProperty('--cx', `${y * -12}deg`);
      el.style.setProperty('--cy', `${x *  12}deg`);
      el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    };
    const onLeave = () => { el.style.setProperty('--cx','0deg'); el.style.setProperty('--cy','0deg'); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);
  return <div ref={ref} className={className} style={style}>{children}</div>;
};

/* ── Magnetic button ─────────────────────────────────── */
const MagBtn = ({ children, onClick, className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${(e.clientX - r.left - r.width  / 2) * 0.25}px`);
      el.style.setProperty('--my', `${(e.clientY - r.top  - r.height / 2) * 0.25}px`);
    };
    const onLeave = () => { el.style.setProperty('--mx','0px'); el.style.setProperty('--my','0px'); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);
  return <button ref={ref} className={`pt-mag-btn ${className}`} onClick={onClick}>{children}</button>;
};

/* ── Scroll reveal ───────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.pt-reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('pt-in'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const PartnerV2 = () => {
  useReveal();
  const [showTop, setShowTop] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  useEffect(() => {
    const el = document.querySelector('.main-stage') || window;
    const onScroll = () => setShowTop((el.scrollTop ?? el.scrollY) > 400);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const backToTop = () => {
    const el = document.querySelector('.main-stage');
    el ? el.scrollTo({ top: 0, behavior: 'smooth' }) : window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-page">

      {/* ── BG layers ── */}
      <div className="pt-grid"    aria-hidden="true" />
      <div className="pt-grid-3d" aria-hidden="true" />
      <div className="pt-grain"   aria-hidden="true" />
      <div aria-hidden="true" className="pt-blob" style={{ width:700, height:500, top:'-8%',   right:'-12%', background:'rgba(255,59,48,0.07)',  '--dur':'26s', '--fdur':'20s', '--fdelay':'0s'  }} />
      <div aria-hidden="true" className="pt-blob" style={{ width:500, height:500, top:'50%',   left:'-10%',  background:'rgba(255,59,48,0.04)',  '--dur':'22s', '--fdur':'24s', '--fdelay':'4s'  }} />
      <div aria-hidden="true" className="pt-blob" style={{ width:300, height:300, bottom:'15%',right:'18%',  background:'rgba(255,255,255,0.02)', '--dur':'18s', '--fdur':'16s', '--fdelay':'8s'  }} />
      {PARTICLES.map(p => (
        <div key={p.id} aria-hidden="true" className="pt-particle" style={{ left:p.left, bottom:'-20px', width:p.size, height:p.size, '--dur':p.dur, '--delay':p.delay }} />
      ))}

      {/* ══════════════════════════════
          HERO
          ══════════════════════════════ */}
      <section className="pt-hero">
        {/* Concentric rings */}
        <div className="pt-rings" aria-hidden="true">
          {[350, 550, 750].map(s => <div key={s} className="pt-ring" style={{ width:s, height:s }} />)}
          {[260, 260, 260].map((s, i) => <div key={`p${i}`} className="pt-ring-pulse" style={{ width:s, height:s }} />)}
        </div>

        <div className="pt-badge">
          <span className="pt-badge-dot" />
          For Brands &amp; Content Creators
        </div>

        <h1 className="pt-hero-title">
          <span className="pt-title-white">Partner With</span>
          <span className="pt-title-red" data-text="Monteeq.">Monteeq.</span>
        </h1>

        <p className="pt-hero-sub">
          Grow your brand through viral edits created by talented Nigerian editors.<br />
          Monteeq turns your raw content into engaging, shareable videos that drive real growth.
        </p>

        <div className="pt-hero-btns">
          <MagBtn onClick={() => scrollTo('contact')}>
            Start a Campaign <ArrowRight size={18} />
          </MagBtn>
          <button className="pt-ghost-btn" onClick={() => scrollTo('how-it-works')}>
            See How It Works <Zap size={16} />
          </button>
        </div>

        {/* Floating stat */}
        <div className="pt-hero-float">
          <div className="pt-hero-float-icon"><TrendingUp size={18} /></div>
          <div>
            <div className="pt-hero-float-top">+250% Engagement</div>
            <div className="pt-hero-float-bot">Avg. brand lift</div>
          </div>
        </div>

        <div className="pt-scroll-cue" aria-hidden="true">
          <div className="pt-scroll-bar" />
          scroll
        </div>
      </section>

      {/* ══════════════════════════════
          WHAT WE DO
          ══════════════════════════════ */}
      <div className="pt-section">
        <div className="pt-reveal" style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <div className="pt-eyebrow">What We Do</div>
          <h2 className="pt-h2">Where Brands Meet<br />Creative Talent</h2>
          <div className="pt-rule" style={{ margin:'0 auto 0' }} />
          <p className="pt-section-sub">
            At Monteeq, every brand has a story that deserves to go viral. We provide the platform where brands meet unparalleled creative talent.
          </p>
        </div>
        <div className="pt-3col">
          {WHAT_WE_DO.map((c, i) => (
            <TiltCard key={i} className="pt-card pt-reveal" style={{ animationDelay:`${i*0.1}s` }}>
              <div className="pt-card-sheen" aria-hidden="true" />
              <div className="pt-card-icon">{c.icon}</div>
              <div className="pt-card-title">{c.title}</div>
              <div className="pt-card-desc">{c.desc}</div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          HOW IT WORKS
          ══════════════════════════════ */}
      <div className="pt-section" id="how-it-works">
        <div className="pt-reveal" style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <div className="pt-eyebrow">Process</div>
          <h2 className="pt-h2">Launching a Campaign<br />Is as Simple as 1-2-3</h2>
          <div className="pt-rule" style={{ margin:'0 auto 0' }} />
        </div>
        <div className="pt-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="pt-step pt-reveal" style={{ animationDelay:`${i*0.12}s` }}>
              <div className="pt-step-num">{s.num}</div>
              <div className="pt-step-icon">{s.icon}</div>
              <div className="pt-step-title">{s.title}</div>
              <div className="pt-step-desc">{s.desc}</div>
              {i < STEPS.length - 1 && <div className="pt-step-arrow" aria-hidden="true"><ArrowRight size={18} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          BENEFITS
          ══════════════════════════════ */}
      <div className="pt-section">
        <div className="pt-benefits-grid">
          <div className="pt-reveal">
            <div className="pt-eyebrow">What You Get</div>
            <h2 className="pt-h2">The Competitive<br />Edge in Short-Form</h2>
            <div className="pt-rule" />
            <p className="pt-section-sub" style={{ textAlign:'left', maxWidth:'none' }}>
              Monteeq isn't just about video editing. It's about building a brand native to the digital-first era.
            </p>
          </div>
          <div className="pt-benefits-cards">
            {BENEFITS.map((b, i) => (
              <TiltCard key={i} className="pt-benefit-card pt-reveal" style={{ animationDelay:`${i*0.1}s` }}>
                <div className="pt-card-sheen" aria-hidden="true" />
                <div className="pt-benefit-icon">{b.icon}</div>
                <div className="pt-benefit-title">{b.title}</div>
                <div className="pt-benefit-desc">{b.desc}</div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Stat callout */}
        <TiltCard className="pt-stat-callout pt-reveal">
          <div className="pt-card-sheen" aria-hidden="true" />
          <div className="pt-callout-num">10M+</div>
          <div className="pt-callout-label">Combined views generated for brand partners</div>
        </TiltCard>
      </div>

      {/* ══════════════════════════════
          OPTIONS
          ══════════════════════════════ */}
      <div className="pt-section">
        <div className="pt-reveal" style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <div className="pt-eyebrow">Partnership Models</div>
          <h2 className="pt-h2">Choose Your<br />Partnership Path</h2>
          <div className="pt-rule" style={{ margin:'0 auto 0' }} />
          <p className="pt-section-sub">
            Pick the model that aligns with your brand's unique goals.
          </p>
        </div>
        <div className="pt-3col">
          {OPTIONS.map((o, i) => (
            <TiltCard key={i} className={`pt-option-card pt-reveal ${o.featured ? 'pt-option-featured' : ''}`} style={{ animationDelay:`${i*0.1}s` }}>
              {o.featured && <div className="pt-option-badge">Most Popular</div>}
              <div className="pt-card-sheen" aria-hidden="true" />
              <div className="pt-option-icon">{o.icon}</div>
              <div className="pt-card-title">{o.title}</div>
              <div className="pt-card-desc">{o.desc}</div>
              <ul className="pt-option-tags">
                {o.tags.map((t, j) => (
                  <li key={j}><Check size={11} /> {t}</li>
                ))}
              </ul>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          CTA BEFORE FORM
          ══════════════════════════════ */}
      <div className="pt-pre-form pt-reveal">
        <div className="pt-pre-form-glow" aria-hidden="true" />
        <h2 className="pt-cta-title">Ready to Revolutionize<br /><em>Your Brand's Content?</em></h2>
        <p className="pt-cta-sub">Join brands already scaling their reach through Monteeq editors.</p>
        <MagBtn onClick={() => scrollTo('contact')}>
          Partner Now <ArrowRight size={18} />
        </MagBtn>
      </div>

      {/* ══════════════════════════════
          CONTACT FORM
          ══════════════════════════════ */}
      <div className="pt-section" id="contact">
        <div className="pt-reveal" style={{ textAlign:'center', marginBottom:'3rem' }}>
          <div className="pt-eyebrow">Get In Touch</div>
          <h2 className="pt-h2">Start a Conversation</h2>
          <div className="pt-rule" style={{ margin:'0 auto 0' }} />
        </div>
        <TiltCard className="pt-form-card pt-reveal">
          <div className="pt-card-sheen" aria-hidden="true" />
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Check style={{ color: '#22c55e' }} size={32} />
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Brief Received!</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Our team will review your brand's vision and reach out within 48 hours.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="pt-ghost-btn"
                style={{ margin: '0 auto' }}
              >
                Send Another Brief
              </button>
            </div>
          ) : (
            <form className="pt-form" onSubmit={handleContactSubmit}>
              <div className="pt-form-row">
                <div className="pt-form-field">
                  <label>Brand / Company Name</label>
                  <input type="text" placeholder="e.g. Indomie Nigeria" required disabled={isLoading} />
                </div>
                <div className="pt-form-field">
                  <label>Contact Email</label>
                  <input type="email" placeholder="hello@yourbrand.com" required disabled={isLoading} />
                </div>
              </div>
              <div className="pt-form-field">
                <label>Campaign Type</label>
                <select required disabled={isLoading}>
                  <option value="">Select a partnership model…</option>
                  <option>Sponsored Challenges</option>
                  <option>Brand Promotion</option>
                  <option>Content Collaboration</option>
                  <option>Not sure yet</option>
                </select>
              </div>
              <div className="pt-form-field">
                <label>Tell us about your brand</label>
                <textarea rows={4} placeholder="What are your goals? Budget range? Content style?" required disabled={isLoading} />
              </div>
              <MagBtn type="submit" disabled={isLoading} className={isLoading ? 'loading' : ''}>
                {isLoading ? (
                  <>Analysing Brief... <Loader2 className="animate-spin" size={18} /></>
                ) : (
                  <>Send Campaign Brief <ArrowRight size={18} /></>
                )}
              </MagBtn>
            </form>
          )}
        </TiltCard>
      </div>

      {/* ══════════════════════════════
          FOOTER
          ══════════════════════════════ */}
      <footer className="pt-footer">
        <div className="pt-footer-inner">
          <div className="pt-footer-logo">
            <div className="pt-footer-M">M</div>
            <span>Monteeq</span>
          </div>
          <p className="pt-footer-copy">
            © 2026 Monteeq Platform · Founded Nov 1, 2025 · Gombe, Nigeria
          </p>
          <div className="pt-footer-links">
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
            <a href="#">Discord</a>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      {showTop && (
        <button className="pt-top-btn" onClick={backToTop} aria-label="Back to top">
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
};

export default PartnerV2;
