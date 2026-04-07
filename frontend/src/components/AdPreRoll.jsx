import React, { useState, useEffect } from 'react';
import { getAds } from '../api';

const AdPreRoll = ({ onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(5);
    const [ad, setAd] = useState(null);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const ads = await getAds();
                if (ads.length > 0) {
                    setAd(ads[Math.floor(Math.random() * ads.length)]);
                }
            } catch (err) {
                console.error("AdPreRoll fetch error:", err);
            }
        };
        fetchAd();
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    return (
        <div className="ad-preroll-overlay" style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'black',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            color: 'white'
        }}>
            <div className="ad-content" style={{ textAlign: 'center', width: '100%', maxWidth: '500px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsored</div>

                <div className="ad-box" style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/9',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    {ad ? (
                        <>
                            <img src={ad.image_url} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', textAlign: 'left' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{ad.title}</div>
                                <button style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>Learn More</button>
                            </div>
                        </>
                    ) : (
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-primary)' }}>MONTEEQ</div>
                    )}
                </div>

                <div className="countdown" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    Video will start in <span style={{ color: 'var(--accent-primary)' }}>{timeLeft}s</span>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '2rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50px',
                fontSize: '0.8rem',
                color: '#888',
                backdropFilter: 'blur(5px)'
            }}>
                Upgrade to PREMIUM to skip all ads
            </div>
        </div>
    );
};

export default AdPreRoll;
