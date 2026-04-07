import React from 'react';
import Section from './Section';
import { Mail, Briefcase, DollarSign, MessageSquare, Send, CheckCircle } from 'lucide-react';

const ContactForm = () => {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Section id="contact">
        <div className="partner-form" style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <CheckCircle style={{ color: '#22c55e' }} size={40} />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>Request Received!</h2>
          <p className="partner-hero-desc" style={{ maxWidth: '100%', marginBottom: '2.5rem' }}>
            Thank you for reaching out. Our team will review your proposal and get back to you within 24-48 hours to discuss how we can grow your brand.
          </p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="partner-btn partner-btn-glass"
          >
            Send another request
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section id="contact">
      <div className="partner-form-container">
        <div style={{ flex: 1 }}>
          <h2 className="partner-hero-title" style={{ fontSize: '3.5rem', textAlign: 'left', marginBottom: '2rem' }}>
            Partner <br /><span style={{ color: 'var(--partner-primary)' }}>Now</span>
          </h2>
          <p className="partner-hero-desc" style={{ textAlign: 'left', maxWidth: '100%', fontSize: '1.25rem', marginBottom: '2.5rem' }}>
            Ready to scale your brand through viral content? Fill out the form as best you can and our partnership team will reach out.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="partner-glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1rem', color: 'var(--partner-text-gray)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <Mail size={18} style={{ color: 'var(--partner-primary)' }} />
                partnerships@monteeq.com
             </div>
             <div className="partner-glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1rem', color: 'var(--partner-text-gray)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <MessageSquare size={18} style={{ color: 'var(--partner-primary)' }} />
                Quick support available 24/7
             </div>
          </div>
        </div>

        <div style={{ flex: 2, width: '100%' }}>
          <form onSubmit={handleSubmit} className="partner-form" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '8rem', height: '8rem', background: 'rgba(255, 62, 62, 0.05)', borderRadius: '50%', filter: 'blur(40px)', zIndex: -10 }} />

            <div className="partner-two-cols">
              <div className="partner-input-group">
                <label className="partner-label">
                  <Briefcase size={14} /> Full Name
                </label>
                <input 
                  required
                  placeholder="John Doe"
                  className="partner-input"
                />
              </div>
              <div className="partner-input-group">
                <label className="partner-label">
                  <Mail size={14} /> Business Email
                </label>
                <input 
                  required
                  type="email"
                  placeholder="name@business.com"
                  className="partner-input"
                />
              </div>
            </div>

            <div className="partner-input-group">
              <label className="partner-label">
                <DollarSign size={14} /> Monthly Budget (Estimated)
              </label>
              <select className="partner-select">
                <option value="50-100k">₦50,000 - ₦100,000</option>
                <option value="100-500k">₦100,000 - ₦500,000</option>
                <option value="500k-1m">₦500,000 - ₦1,000,000+</option>
                <option value="custom">Custom Partnership</option>
              </select>
            </div>

            <div className="partner-input-group">
              <label className="partner-label">
                <MessageSquare size={14} /> Campaign Description
              </label>
              <textarea 
                required
                rows="4"
                placeholder="Tell us about your brand and what you hope to achieve..."
                className="partner-textarea"
              />
            </div>

            <button 
              type="submit"
              className="partner-btn partner-btn-primary"
              style={{ width: '100%', fontSize: '1.25rem', padding: '1.5rem' }}
            >
              Partner Now
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
};

export default ContactForm;
