import React from 'react';
import Section from './Section';
import { FilePlus, Edit3, Award, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FilePlus size={32} style={{ color: 'var(--partner-primary)' }} />,
      title: "Submit a Campaign",
      description: "Define your brands's vision, objectives and style. You can also upload assets for our editors."
    },
    {
      icon: <Edit3 size={32} style={{ color: 'var(--partner-primary)' }} />,
      title: "Editors Create & Upload",
      description: "Our community of world-class video editors take your content and turn it into viral masterpieces."
    },
    {
      icon: <Award size={32} style={{ color: 'var(--partner-primary)' }} />,
      title: "Top Edits Win Rewards",
      description: "Best performing edits get rewarded, creating a win-win for your brand and our creators."
    }
  ];

  return (
    <Section id="how-it-works">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 className="partner-hero-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>How It Works</h2>
        <p className="partner-hero-desc" style={{ marginBottom: 0 }}>
          Launching a campaign on Montage is as simple as 1, 2, 3.
        </p>
      </div>

      <div className="partner-steps-container">
        {/* Connection line for desktop */}
        <div className="desktop-only" style={{
          position: 'absolute', top: '2.5rem', left: '20%', right: '20%',
          height: '2px', background: 'linear-gradient(to right, transparent, rgba(255, 62, 62, 0.2), transparent)',
          zIndex: -10
        }} />

        {steps.map((step, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <div className="partner-step-node">
              <div className="partner-step-badge">
                {index + 1}
              </div>
              {step.icon}
            </div>
            <h3 className="partner-card-title" style={{ fontSize: '1.5rem' }}>
              {step.title}
            </h3>
            <p style={{ color: 'var(--partner-text-gray)', lineHeight: 1.6, maxWidth: '20rem', margin: '0 auto' }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default HowItWorks;
