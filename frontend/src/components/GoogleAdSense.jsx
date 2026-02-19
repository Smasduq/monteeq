import React, { useEffect } from 'react';

/**
 * Google AdSense Component
 * This component handles the injection of the AdSense script and provides a placeholder for ad units.
 */
const GoogleAdSense = ({ client = "ca-pub-XXXXXXXXXXXXXXXX", slot = "XXXXXXXXXX", format = "auto", responsive = "true" }) => {
    useEffect(() => {
        try {
            // Push to Google Adsense array
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense Error:", e);
        }
    }, [slot]);

    return (
        <div className="adsense-wrapper" style={{ overflow: 'hidden', margin: '1rem 0', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
            <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Advertisement</div>
            <ins className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}></ins>
        </div>
    );
};

export default GoogleAdSense;
