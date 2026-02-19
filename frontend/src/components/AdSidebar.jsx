import React, { useEffect, useState } from 'react';
import { getAds } from '../api';
import GoogleAdSense from './GoogleAdSense';

const AdSidebar = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const data = await getAds();
                setAds(data);
            } catch (err) {
                console.error("Failed to fetch ads", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAds();
    }, []);

    if (loading) return null;

    return (
        <aside className="ad-sidebar glass" style={{ width: '100%', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsored</div>
            {ads.length > 0 ? ads.map(ad => (
                <div key={ad.id} className="ad-item ad-sponsored" style={{ borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                    <img src={ad.image_url} alt={ad.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    <div style={{ padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }}>{ad.title}</div>
                    <div style={{ padding: '0 0.8rem 0.8rem', textAlign: 'right' }}>
                        <button style={{ fontSize: '0.7rem', background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontWeight: 700 }}>Shop Now</button>
                    </div>
                </div>
            )) : (
                <GoogleAdSense />
            )}

            {/* Always show one Google Ad at the bottom of the sidebar if it's long */}
            {ads.length > 0 && ads.length < 3 && <GoogleAdSense slot="SIDEBAR_BOTTOM_SLOT" />}

            <style>{`
                .ad-sidebar {
                    height: fit-content;
                    position: sticky;
                    top: 2rem;
                }
                .ad-item:hover {
                    transform: translateY(-2px);
                    transition: transform 0.2s ease;
                }
            `}</style>
        </aside>
    );
};

export default AdSidebar;
