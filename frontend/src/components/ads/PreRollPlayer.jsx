import React, { useState, useEffect, useRef } from 'react';
import { Play, SkipForward, Volume2, VolumeX } from 'lucide-react';

const PreRollPlayer = ({ onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(10);
    const [canSkip, setCanSkip] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete();
                    return 0;
                }
                if (prev <= 7) setCanSkip(true); // Allow skip after 3 seconds
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onComplete]);

    const handleSkip = (e) => {
        e.stopPropagation();
        onComplete();
    };

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <video
                ref={videoRef}
                src="https://freetestdata.com/wp-content/uploads/2022/02/Free_Test_Data_1MB_MP4.mp4"
                autoPlay
                muted={isMuted}
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />

            {/* Top Info */}
            <div style={{
                position: 'absolute',
                top: '1.5rem',
                left: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                background: 'rgba(0,0,0,0.6)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 10px var(--accent-primary)'
                }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>SPONSORED PRE-ROLL</span>
            </div>

            {/* Skip / Timer Section */}
            <div style={{
                position: 'absolute',
                bottom: '3rem',
                right: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '1rem'
            }}>
                {canSkip ? (
                    <button 
                        onClick={handleSkip}
                        className="btn-active"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 700,
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        SKIP AD <SkipForward size={18} />
                    </button>
                ) : (
                    <div style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                    }}>
                        Ad ends in {timeLeft}s
                    </div>
                )}
            </div>

            {/* Mute Toggle */}
            <button 
                onClick={() => setIsMuted(!isMuted)}
                style={{
                    position: 'absolute',
                    bottom: '3rem',
                    left: '2rem',
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    color: 'white',
                    padding: '0.8rem',
                    borderRadius: '50%',
                    cursor: 'pointer'
                }}
            >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
        </div>
    );
};

export default PreRollPlayer;
