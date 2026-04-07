import React from 'react';

const FlashAdCard = ({ ad }) => {
    return (
        <div className="flash-item flash-ad-card" style={{ height: '100%', width: '100%', position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '600px', height: '100%', position: 'relative' }}>
                {ad ? (
                    <img src={ad.image_url} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #222)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '1rem' }}>MONTEEQ</div>
                        <div style={{ fontSize: '1.2rem', color: '#fff', textAlign: 'center' }}>Sponsored Ad Content</div>
                    </div>
                )}

                <div style={{ position: 'absolute', top: '2rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '5px 12px', borderRadius: '4px', fontSize: '0.7rem', color: '#fff', backdropFilter: 'blur(5px)' }}>AD</div>

                <div style={{ position: 'absolute', bottom: '2rem', left: '1rem', right: '1rem', padding: '1.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ad?.title || 'Upgrade to Premium'}</div>
                    <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1.5rem' }}>Support Monteeq and enjoy an ad-free experience with HD video playback.</p>
                    <button style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 5px 15px rgba(255, 62, 62, 0.3)'
                    }}>Learn More</button>
                </div>
            </div>
        </div>
    );
};

export default FlashAdCard;
