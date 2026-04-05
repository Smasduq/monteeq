import React from 'react';
import Section from './Section';
import { Network, Users, TrendingUp, Sparkles } from 'lucide-react';

const WhatWeDo = () => {
  const cards = [
    {
      icon: <Network style={{ color: 'var(--partner-primary)' }} size={24} />,
      title: "Content Bridge",
      description: "We act as the bridge between your brand's raw vision and a network of world-class video editors."
    },
    {
      icon: <Users style={{ color: 'var(--partner-primary)' }} size={24} />,
      title: "Viral Community",
      description: "Our community of creators specializes in short-form, high-impact content that thrives on social media."
    },
    {
      icon: <TrendingUp style={{ color: 'var(--partner-primary)' }} size={24} />,
      title: "Engagement Growth",
      description: "Focus on creating content that doesn't just look good, but drives real interaction and growth."
    }
  ];

  return (
    <Section className="partner-section-dark">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 className="partner-hero-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>What We Do</h2>
        <p className="partner-hero-desc" style={{ marginBottom: 0 }}>
          At Montage, we believe every brand has a story that deserves to go viral. We provide the platform where brands meets unparalleled creative talent.
        </p>
      </div>

      <div className="partner-card-grid">
        {cards.map((card, index) => (
          <div key={index} className="partner-card">
            <div className="partner-card-icon">
              {card.icon}
            </div>
            <h3 className="partner-card-title">{card.title}</h3>
            <p style={{ color: 'var(--partner-text-gray)', lineHeight: 1.6 }}>{card.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default WhatWeDo;
