import React from 'react';
import Section from './Section';
import { Trophy, Users, Zap, TrendingUp, PlayCircle } from 'lucide-react';

const CampaignExample = () => {
  return (
    <Section>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 className="partner-hero-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Example Campaign</h2>
        <p className="partner-hero-desc" style={{ marginBottom: 0 }}>
          See how a real campaign looks for both brands and editors.
        </p>
      </div>

      <div className="partner-campaign-card">
        {/* Subtle glow */}
        <div style={{
          position: 'absolute', top: '-6rem', right: '-6rem', width: '16rem', height: '16rem',
          backgroundColor: 'rgba(255, 62, 62, 0.1)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0
        }} />
        
        <div className="partner-campaign-grid">
          {/* Visual Card Representation */}
          <div className="partner-mock-card">
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, black, transparent)', zIndex: 10, borderRadius: '1.5rem' }} />
             
             <div style={{ position: 'relative', zIndex: 20 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--partner-primary)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                 <Zap size={14} fill="currentColor" />
                 Active Challenge
               </div>
               <h4 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>Summer Beats Challenge</h4>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="partner-glass" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 800, fontSize: '0.875rem' }}>
                     <Trophy size={16} style={{ color: 'var(--partner-primary)' }} />
                     ₦50,000 Prize
                  </div>
                  <div className="partner-glass" style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--partner-text-gray)', fontSize: '0.875rem' }}>
                     <Users size={16} />
                     124 Entries
                  </div>
               </div>
             </div>

             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '4rem', height: '4rem', borderRadius: '50%', background: 'var(--partner-bg-glass)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', zIndex: 15, border: '1px solid var(--partner-border)' }}>
                <PlayCircle size={40} strokeWidth={1.5} style={{ margin: 'auto' }} />
             </div>
          </div>

          {/* Campaign Details Text */}
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'white', lineHeight: 1.1 }}>“Best edit wins <span style={{ color: 'var(--partner-primary)' }}>₦50,000</span>”</h3>
            <p style={{ color: 'var(--partner-text-gray)', marginBottom: '2rem', fontSize: '1.125rem', lineHeight: 1.6 }}>
              Our editors were tasked to create a high-energy 15-second edit using the brand's new summer track. 
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--partner-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '0.25rem' }}>Impressions</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>1.2M+</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--partner-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '0.25rem' }}>UGC Edits</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>450+</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--partner-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '0.25rem' }}>Click Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>+14%</p>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--partner-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '0.25rem' }}>Audience</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>Gen Z</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--partner-border)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'rgba(255, 62, 62, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp style={{ color: 'var(--partner-primary)' }} size={20} />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--partner-text-gray)', margin: 0 }}>The brand saw a <span style={{ color: 'var(--partner-primary)' }}>300% increase</span> in mentions within 7 days.</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CampaignExample;
