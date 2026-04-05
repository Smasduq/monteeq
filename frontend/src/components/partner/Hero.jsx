import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Play } from 'lucide-react';

const Hero = ({ onCtaClick, onWatchClick }) => {
  return (
    <section className="partner-hero">
      {/* Background glow effects - styles moved to inline or CSS if needed, 
          but keeping inline for simplicity of gradients that change often */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', backgroundColor: 'rgba(255, 62, 62, 0.2)',
        borderRadius: '50%', filter: 'blur(120px)', zIndex: -10, pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="partner-hero-content"
      >
        <div className="partner-hero-tag">
          <Zap size={14} fill="currentColor" />
          <span>For Brands & Content Creators</span>
        </div>

        <h1 className="partner-hero-title">
          Partner With <span className="partner-gradient-text">Montage</span>
        </h1>

        <p className="partner-hero-subtitle">
          Grow your brand through viral edits created by talented editors
        </p>

        <p className="partner-hero-desc">
          Montage helps brands turn static or raw content into engaging, highly shareable video edits that capture attention and drive real growth.
        </p>

        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onCtaClick} className="partner-btn partner-btn-primary">
            Start a Campaign
            <ArrowRight size={20} className="hover-icon" />
          </button>
          <button onClick={onWatchClick} className="partner-btn partner-btn-glass">
             Watch How It Works
            <Play size={18} fill="white" />
          </button>
        </div>
      </motion.div>

      {/* Floating elements */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="partner-glass desktop-only"
        style={{ position: 'absolute', bottom: '5rem', left: '5rem', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--partner-border)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: 'rgba(255, 62, 62, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} style={{ color: 'var(--partner-primary)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--partner-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Growth</p>
            <p style={{ fontSize: '0.875rem', color: 'white', fontWeight: 800, margin: 0 }}>+250% Engagement</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
