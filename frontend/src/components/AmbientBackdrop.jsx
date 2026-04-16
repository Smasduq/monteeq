/**
 * AmbientBackdrop.jsx
 * Dynamic, performance-aware background glow for the vertical feed.
 */
import React, { useMemo } from 'react';
import { TIERS } from '../services/adaptiveEngine';

const AmbientBackdrop = ({ videoThumbnail, tier }) => {
    
    // Performance Tiers styling mapper
    const styles = useMemo(() => {
        if (tier === TIERS.LOW) {
            return {
                background: 'linear-gradient(135deg, #0a0b0d 0%, #1a1c1e 100%)',
                filter: 'none',
                opacity: 1
            };
        }

        const blurAmount = tier === TIERS.HIGH ? '80px' : '40px';
        const animationSpeed = tier === TIERS.HIGH ? '15s' : '0s'; // Disable motion for Mid

        return {
            backgroundImage: `url(${videoThumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${blurAmount}) saturate(1.5) brightness(0.6)`,
            opacity: 0.4,
            animation: tier === TIERS.HIGH ? `ambientMotion ${animationSpeed} infinite alternate ease-in-out` : 'none'
        };
    }, [videoThumbnail, tier]);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            <div style={{
                position: 'absolute',
                inset: '-10%',
                ...styles,
                transition: 'all 1s ease-in-out'
            }} />
            
            {/* Dark overlay to ensure contrast */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 1
            }} />

            <style>{`
                @keyframes ambientMotion {
                    0% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.1) rotate(2deg); }
                    100% { transform: scale(1.2) rotate(-2deg); }
                }
            `}</style>
        </div>
    );
};

export default AmbientBackdrop;
