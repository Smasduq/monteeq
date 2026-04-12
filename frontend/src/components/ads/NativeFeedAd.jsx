import React from 'react';
import { ExternalLink } from 'lucide-react';

const NativeFeedAd = React.memo(({ ad = {}, variant = 'grid' }) => {
    // Default ad content if none provided
    const content = {
        title: ad.title || "Experience Premium Performance",
        brand: ad.brand || "Monteeq Partners",
        image: ad.image || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=800&q=60",
        cta: ad.cta || "LEARN MORE",
        url: ad.url || "#"
    };

    return (
        <div 
            className={`video-card-v2 ad-native ${variant === 'list' ? 'vc-list' : 'vc-grid'}`}
            onClick={() => window.open(content.url, '_blank')}
        >
            <div className="vc-thumbnail-area">
                <div className="vc-thumb-inner" style={{ background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)' }}>
                    <img
                        src={content.image}
                        alt={content.title}
                        className="vc-img"
                        style={{ opacity: 0.8 }}
                    />
                    
                    <div className="vc-status" style={{ 
                        background: 'rgba(255, 60, 60, 0.9)', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        top: '12px',
                        left: '12px',
                        bottom: 'auto',
                        width: 'auto'
                    }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>SPONSORED</span>
                    </div>

                    <div className="vc-play-indicator" style={{ background: 'var(--accent-primary)' }}>
                        <ExternalLink size={14} color="white" />
                    </div>
                </div>
            </div>

            <div className="vc-info-area">
                <div className="vc-info-flex">
                    <div className="vc-text">
                        <h3 className="vc-title" style={{ color: 'var(--text-primary)' }}>{content.title}</h3>
                        <div className="vc-meta-wrap">
                            <div className="vc-channel" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                                {content.brand}
                            </div>
                            <div className="vc-stats">
                                Sponsored Growth
                            </div>
                        </div>
                        <div style={{ marginTop: '0.8rem' }}>
                            <button className="btn-active" style={{ 
                                padding: '6px 16px', 
                                fontSize: '0.75rem', 
                                borderRadius: '50px',
                                background: 'transparent',
                                border: '1px solid var(--accent-primary)',
                                color: 'var(--accent-primary)',
                                fontWeight: 800
                            }}>
                                {content.cta}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

NativeFeedAd.displayName = 'NativeFeedAd';

export default NativeFeedAd;
