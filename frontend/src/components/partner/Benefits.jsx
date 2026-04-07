import React from 'react';
import Section from './Section';
import { Eye, Settings, Users, Monitor } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: <Eye style={{ color: 'var(--partner-primary)' }} />,
      title: "Viral Exposure",
      description: "Our editors are experts in content that captures attention and goes viral across TikTok, Reels, and YouTube Shorts."
    },
    {
      icon: <Settings style={{ color: 'var(--partner-primary)' }} />,
      title: "High-Quality UGC",
      description: "Get authentic, user-generated content from real creators that feels more organic and relatable than traditional ads."
    },
    {
      icon: <Users style={{ color: 'var(--partner-primary)' }} />,
      title: "Expert community",
      description: "Access our exclusive community of talented video editors without the hassle of individual recruitment and vetting."
    },
    {
      icon: <Monitor style={{ color: 'var(--partner-primary)' }} />,
      title: "Increased Engagement",
      description: "Drive meaningful interactions, likes, shares, and follows with content that people actually want to watch."
    }
  ];

  return (
    <Section>
      <div className="partner-benefits-split">
        <div style={{ flex: 1 }}>
          <h2 className="partner-hero-title" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '2rem' }}>What You Get</h2>
          <p className="partner-hero-desc" style={{ textAlign: 'left', maxWidth: '100%', marginBottom: '2.5rem' }}>
            Monteeq isn't just about video editing. It's about building a brand that's native to the digital-first era. Partnering with us gives you the competitive edge in short-form content.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {benefits.slice(0, 2).map((benefit, i) => (
              <div key={i} className="partner-benefit-item">
                <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {benefit.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{benefit.title}</h3>
                  <p style={{ color: 'var(--partner-text-gray)', fontSize: '0.95rem' }}>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {benefits.slice(2, 4).map((benefit, i) => (
            <div key={i} className="partner-benefit-item">
              <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {benefit.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{benefit.title}</h3>
                <p style={{ color: 'var(--partner-text-gray)', fontSize: '0.95rem' }}>{benefit.description}</p>
              </div>
            </div>
          ))}
          <div className="partner-glass" style={{ padding: '2.5rem', borderRadius: '1.25rem', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(255, 62, 62, 0.05), transparent)', zIndex: -10 }} />
             <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(255, 62, 62, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
               <Eye style={{ color: 'var(--partner-primary)' }} size={32} />
             </div>
             <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>10M+ Combined Views</p>
             <p style={{ color: 'var(--partner-text-muted)', fontWeight: 600 }}>Generated for our brand partners</p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Benefits;
