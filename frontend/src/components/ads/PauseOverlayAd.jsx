import React from 'react';
import { Info, ExternalLink } from 'lucide-react';

const PauseOverlayAd = () => {
    return (
        <div style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            width: '240px',
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 50
        }} className="pause-ad-anim">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '1.5px' }}>ADVERTISEMENT</span>
                <Info size={14} color="rgba(255,255,255,0.4)" />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '8px', 
                    background: 'linear-gradient(45deg, #FF3B30, #900)',
                    flexShrink: 0,
                    overflow: 'hidden'
                }}>
                   <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=100&q=60" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Next-Gen Editing</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Monteeq Partner Pro</div>
                </div>
            </div>

            <button 
                onClick={() => window.open('https://monteeq.com', '_blank')}
                style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '10px',
                    background: 'var(--accent-primary)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                }}
            >
                GET STARTED <ExternalLink size={14} />
            </button>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .pause-ad-anim {
                    animation: slideIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PauseOverlayAd;
