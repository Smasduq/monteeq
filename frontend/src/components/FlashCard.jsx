import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Trophy, Music, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Services
import { metricsManager } from '../services/metricsManager';
import { adaptiveDiscovery } from '../services/adaptiveDiscovery';
import { trackingManager } from '../services/trackingManager';

import s from './FlashCard.module.css';

const FlashCard = ({ 
    video, 
    isActive, 
    onLike, 
    onComment, 
    onShare, 
    muted, 
    toggleMute, 
    shouldRender = true,
    onSpeedChange 
}) => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hookProgress, setHookProgress] = useState(0);
    const [isEngaged, setIsEngaged] = useState(false);
    const [showHaptic, setShowHaptic] = useState(false);

    // Interaction Tracking
    const entryTime = useRef(0);
    const longPressTimer = useRef(null);
    const [isLongPressing, setIsLongPressing] = useState(false);

    // Smart Replay Config
    const isSmartMode = video.smart_replay || true;
    const smartStart = 0.25; 
    const smartEnd = 0.85;

    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.muted = muted;
            videoRef.current.play().catch(() => {});
            setPlaying(true);
            entryTime.current = Date.now();
            // Start recommendation tracking session with real video duration
            const vDuration = videoRef.current.duration || video.duration || 0;
            trackingManager.startSession(video.id, vDuration);
        } else {
            if (playing && entryTime.current > 0) {
                const watchMs = Date.now() - entryTime.current;
                // Legacy tracking (metricsManager + adaptiveDiscovery kept for backwards compat)
                metricsManager.trackWatchTime(video.id, watchMs);
                adaptiveDiscovery.recordWatch(video.id, watchMs, (videoRef.current?.duration || 0) * 1000, video.mood);
                // Recommendation engine tracking
                trackingManager.endSession(video.id);
            }
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setPlaying(false);
            setProgress(0);
            setIsEngaged(false);
        }
    }, [isActive, video.status, video.id, muted]);

    const handleTimeUpdate = (e) => {
        const { currentTime, duration } = e.target;
        if (duration > 0) {
            const ratio = currentTime / duration;
            setProgress(ratio * 100);
            setHookProgress(Math.min(currentTime / 3, 1) * 100);

            if (!isEngaged && ratio > 0.5) setIsEngaged(true);

            if (isSmartMode && currentTime >= duration * smartEnd) {
                videoRef.current.currentTime = duration * smartStart;
            }
        }
    };

    const triggerHaptic = () => {
        setShowHaptic(true);
        setTimeout(() => setShowHaptic(false), 400);
    };

    // Interaction Gestures (Unified for Mouse and Touch where possible)
    const handleActionStart = (e) => {
        // Only trigger for touch or primary mouse button
        if (e.type === 'mousedown' && e.button !== 0) return;

        longPressTimer.current = setTimeout(() => {
            setIsLongPressing(true);
            if (videoRef.current) videoRef.current.playbackRate = 2.0;
            if (onSpeedChange) onSpeedChange(true);
            triggerHaptic();
        }, 400);
    };

    const handleActionEnd = () => {
        clearTimeout(longPressTimer.current);
        if (isLongPressing) {
            setIsLongPressing(false);
            if (videoRef.current) videoRef.current.playbackRate = 1.0;
            if (onSpeedChange) onSpeedChange(false);
        }
    };

    const tapRef = useRef(0);
    const handleMainClick = (e) => {
        // Prevent click if we were just long pressing or if it's not the primary button
        if (isLongPressing || (e.type === 'mousedown' && e.button !== 0)) return;

        const now = Date.now();
        if (now - tapRef.current < 300) {
            triggerHaptic();
            if (!video.liked) onLike(video.id);
        } else {
            // Simple Click: Toggle Play/Pause
            if (videoRef.current) {
                videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
            }
        }
        tapRef.current = now;
    };

    return (
        <div className={s.card}>
            {/* Hook visualization */}
            <div className={s.hookBar} style={{ width: `${hookProgress}%`, opacity: hookProgress === 100 ? 0 : 1 }} />

            <div 
                className={s.videoWrapper} 
                onMouseDown={handleActionStart}
                onMouseUp={handleActionEnd}
                onMouseLeave={handleActionEnd}
                onTouchStart={handleActionStart}
                onTouchEnd={handleActionEnd}
                onClick={handleMainClick}
            >
                <video
                    ref={videoRef}
                    src={shouldRender ? video.video_url : ""}
                    loop={!isSmartMode}
                    playsInline
                    autoPlay
                    muted={muted}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => { if (isActive) trackingManager.markReplayed(video.id); }}
                    className={s.video}
                />

                <div className={`${s.hapticFlash} ${showHaptic ? s.flashActive : ''}`} />

                {video.status === 'pending' && (
                    <div className={s.statusOverlay}>
                        <Loader2 className="animate-spin" size={40} color="var(--accent-primary)" />
                    </div>
                )}
            </div>

            {/* Sidebar Actions */}
            <div className={s.sidebar}>
                <div className={`${s.action} ${video.liked ? s.liked : ''}`} onClick={(e) => { e.stopPropagation(); trackingManager.markLiked(video.id); onLike(video.id); }}>
                    <div className={s.iconCircle}>
                        <Heart size={32} fill={video.liked ? 'var(--accent-primary)' : 'none'} />
                    </div>
                    <span className={s.label}>{video.likes_count}</span>
                </div>

                <div className={s.action} onClick={(e) => { e.stopPropagation(); onComment(video.id); }}>
                    <div className={s.iconCircle}><MessageCircle size={32} /></div>
                    <span className={s.label}>{video.comments_count || 0}</span>
                </div>

                <div className={s.action} onClick={(e) => { e.stopPropagation(); onShare(video.id); }}>
                    <div className={s.iconCircle}><Share2 size={30} /></div>
                    <span className={s.label}>Share</span>
                </div>

                <div className={s.action} onClick={(e) => { e.stopPropagation(); navigate('/challenges'); }}>
                    <div className={s.iconCircle} style={{borderColor: '#ffd700'}}><Trophy size={32} color="#ffd700" /></div>
                    <span className={s.label}>Join</span>
                </div>
            </div>

            {/* Overlay Info */}
            <div className={s.overlay}>
                <div className={s.usernameRow} onClick={(e) => { e.stopPropagation(); navigate(`/profile/${video.owner?.username}`); }}>
                    <div className={s.avatar}>
                        {video.owner?.profile_pic ? (
                            <img src={video.owner.profile_pic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                            <span style={{fontSize: '0.8rem'}}>{video.owner?.username?.[0].toUpperCase()}</span>
                        )}
                    </div>
                    <span className={s.username}>@{video.owner?.username}</span>
                </div>
                <p className={s.caption}>{video.title || video.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5, marginTop: '12px' }}>
                    <Music size={12} />
                    <span style={{ fontSize: '0.75rem' }}>{video.song || 'Monteeq Pulse - Gen 4'}</span>
                </div>
            </div>

            {/* Premium Progress Bar */}
            <div className={s.progressBar}>
                <div 
                    className={`${s.progressFill} ${isEngaged ? s.progressEngaged : ''}`} 
                    style={{ width: `${progress}%` }} 
                />
            </div>

            {/* Desktop Mute Control */}
            <button className={s.muteToggle} onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
                {muted ? <VolumeX size={32} /> : <Volume2 size={32} />}
            </button>
        </div>
    );
};

export default FlashCard;
