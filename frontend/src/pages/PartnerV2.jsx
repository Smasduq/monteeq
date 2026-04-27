import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Network, TrendingUp, Users, Target, Megaphone, Loader2 } from 'lucide-react';
import './PartnerV2.css';
import Footer from '../components/Footer';

/* ── Content ─────────────────────────────────────────────── */
const WHAT_WE_DO = [
  { icon: <Network size={24} />, title: 'Content Bridge', desc: 'The bridge between your brand and a network of world-class video editors.' },
  { icon: <Users size={24} />, title: 'Viral Community', desc: 'Short-form, high-impact content that thrives on social media.' },
  { icon: <TrendingUp size={24} />, title: 'Engagement Growth', desc: 'Drive real interaction, shares, and measurable follower growth.' },
];

const OPTIONS = [
  {
    icon: <Target size={28} />, 
    title: 'Sponsored Challenges',
    desc: 'Encourage editors to create content around your product for a prize. Generates high-quality assets.',
    tags: ['Viral opportunity', 'Authentic content'],
  },
  {
    icon: <Megaphone size={28} />, 
    title: 'Brand Promotion',
    desc: 'Partner with our top-tier editors for a direct promotional campaign across the platform.',
    tags: ['Brand awareness', 'Consistent styling'],
  }
];

/* ── Lightweight Intersection Observer ───────────────────── */
function useReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      document.querySelectorAll('.pt-r').forEach(el => el.classList.add('pt-in'));
      return;
    }

    const els = document.querySelectorAll('.pt-r');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { 
          e.target.classList.add('pt-in'); 
          io.unobserve(e.target); 
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const PartnerV2 = () => {
  useReveal();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="pt-page">
      <div className="pt-bg" aria-hidden="true" />

      {/* ═══ HERO ═══ */}
      <section className="pt-hero">
        <div className="pt-badge pt-r">
          For Brands & Agencies
        </div>

        <h1 className="pt-hero-title pt-r">
          Partner With <span className="text-red">Monteeq.</span>
        </h1>

        <p className="pt-hero-sub pt-r">
          Turn your raw assets into engaging, shareable videos that drive real growth natively across Nigeria's fastest growing creator network.
        </p>

        <div className="pt-hero-cta pt-r">
          <button className="pt-btn" onClick={scrollToContact}>
            Start a Campaign <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ═══ WHAT WE DO ═══ */}
      <section className="pt-section">
        <div className="pt-header pt-r">
          <h2>Where Brands Meet Creative Talent</h2>
          <p>Every brand has a story that deserves to go viral.</p>
        </div>
        <div className="pt-grid">
          {WHAT_WE_DO.map((c, i) => (
            <div key={i} className="pt-card pt-r">
              <div className="pt-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MODELS ═══ */}
      <section className="pt-section pt-bg-alt">
        <div className="pt-header pt-r">
          <h2>Partnership Models</h2>
          <p>Pick the path that aligns with your brand's unique goals.</p>
        </div>
        <div className="pt-grid-cols-2">
          {OPTIONS.map((o, i) => (
            <div key={i} className="pt-option-card pt-r">
              <div className="pt-icon">{o.icon}</div>
              <h3>{o.title}</h3>
              <p>{o.desc}</p>
              <ul className="pt-tags">
                {o.tags.map((t, j) => (
                  <li key={j}><Check size={14} className="text-red" /> {t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CONTACT FORM ═══ */}
      <section className="pt-section pt-contact" id="contact">
        <div className="pt-header pt-r">
          <h2>Start a Conversation</h2>
        </div>
        
        <div className="pt-form-card pt-r">
          {isSubmitted ? (
            <div className="pt-success">
              <div className="pt-success-icon"><Check size={32} /></div>
              <h3>Brief Received!</h3>
              <p>Our team will review your brand's vision and reach out within 48 hours.</p>
              <button onClick={() => setIsSubmitted(false)} className="pt-btn-outline">
                Send Another Brief
              </button>
            </div>
          ) : (
            <form className="pt-form" onSubmit={handleContactSubmit}>
              <div className="pt-form-group">
                <label>Brand / Company Name</label>
                <input type="text" placeholder="e.g. Indomie Nigeria" required disabled={isLoading} />
              </div>
              <div className="pt-form-group">
                <label>Contact Email</label>
                <input type="email" placeholder="hello@yourbrand.com" required disabled={isLoading} />
              </div>
              <div className="pt-form-group">
                <label>Campaign Type</label>
                <select required disabled={isLoading}>
                  <option value="">Select a partnership model…</option>
                  <option>Sponsored Challenges</option>
                  <option>Brand Promotion</option>
                  <option>Not sure yet</option>
                </select>
              </div>
              <div className="pt-form-group">
                <label>Tell us about your brand</label>
                <textarea rows={4} placeholder="Goals? Budget range? Content style?" required disabled={isLoading} />
              </div>
              <button type="submit" disabled={isLoading} className="pt-btn pt-submit-btn">
                {isLoading ? (
                  <>Analysing Brief... <Loader2 className="animate-spin" size={18} /></>
                ) : (
                  <>Send Campaign Brief <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default PartnerV2;
