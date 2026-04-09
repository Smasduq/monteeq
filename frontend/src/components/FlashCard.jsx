import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Trophy, Music, Play, Pause, Volume2, VolumeX, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { viewVideo } from '../api';
import s from './FlashCard.module.css';

const FlashCard = ({ video, isActive, onLike, onComment, onShare, onFollow, muted, toggleMute, shouldRender = true }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [viewCounted, setViewCounted] = useState(false);
    
    // Gesture Logic
    const lastTap = useRef(0);
    const longPressTimeout = useRef(null);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [scrubTime, setScrubTime] = useState(0);

    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive && video.status === 'approved') {
            videoRef.current.play().catch(() => { });
            setPlaying(true);
            setViewCounted(false);
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setPlaying(false);
        }
    }, [isActive, video.status]);

    const handleTimeUpdate = (e) => {
        if (viewCounted || !video) return;
        const { currentTime, duration } = e.target;
        if (duration > 0 && ((currentTime / duration) > 0.15 || currentTime > 3)) {
            setViewCounted(true);
            viewVideo(video.id).catch(console.error);
        }
    };

    const handleTouchStart = (e) => {
        const tapTime = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (tapTime - lastTap.current < DOUBLE_TAP_DELAY) {
            // Double Tap Detected
            handleDoubleTap(e);
            clearTimeout(longPressTimeout.current);
        } else {
            // Potential Long Press
            longPressTimeout.current = setTimeout(() => {
                setIsScrubbing(true);
                if (videoRef.current) {
                    videoRef.current.pause();
                    setScrubTime(videoRef.current.currentTime);
                }
            }, 500);
        }
        lastTap.current = tapTime;
    };

    const handleTouchEnd = () => {
        clearTimeout(longPressTimeout.current);
        if (isScrubbing) {
            setIsScrubbing(false);
            if (videoRef.current) videoRef.current.play();
        }
    };

    const handleDoubleTap = (e) => {
        const touchX = e.touches[0].clientX;
        const width = window.innerWidth;
        
        if (touchX < width * 0.4) {
            // Seek Back
            if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        } else if (touchX > width * 0.6) {
            // Seek Forward
            if (videoRef.current) videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
        } else {
            // Center - Heart Animation + Like
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
            if (!video.liked) onLike(video.id);
        }
    };

    const handleScrubMove = (e) => {
        if (!isScrubbing || !videoRef.current) return;
        const touchX = e.touches[0].clientX;
        const width = window.innerWidth;
        const percentage = touchX / width;
        const newTime = percentage * videoRef.current.duration;
        videoRef.current.currentTime = newTime;
        setScrubTime(newTime);
    };

    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={s.card}>
            <div 
                className={s.videoWrapper} 
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleScrubMove}
                onClick={() => !isScrubbing && (playing ? videoRef.current.pause() : videoRef.current.play())}
            >
                <video
                    ref={videoRef}
                    src={shouldRender ? video.video_url : ""}
                    loop
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    className={s.video}
                />

                {/* Status Overlays */}
                {video.status === 'pending' && (
                    <div className="status-overlay pending">
                        <Loader2 className="animate-spin" size={48} color="white" />
                        <span>Rendering Montage...</span>
                    </div>
                )}

                {/* Thumb Gestures Feedback */}
                <div className={`${s.scrubbingBar} ${isScrubbing ? s.visible : ''}`}>
                    <div 
                        className={s.progress} 
                        style={{ width: `${(scrubTime / (videoRef.current?.duration || 1)) * 100}%` }} 
                    />
                </div>
                {isScrubbing && (
                    <div className={`${s.previewTimestamp} ${s.visible}`}>
                        {formatTime(scrubTime)}
                    </div>
                )}

                {showHeart && (
                    <div className="heart-pop">
                        <Heart size={100} fill="var(--accent-primary)" color="var(--accent-primary)" />
                    </div>
                )}
            </div>

            {/* Sidebar Actions - Thumb Optimized */}
            <div className={s.sidebar}>
                <div className={`${s.action} ${video.liked ? s.liked : ''}`} onClick={() => onLike(video.id)}>
                    <div className={s.iconCircle}>
                        <Heart size={28} fill={video.liked ? 'var(--accent-primary)' : 'none'} />
                    </div>
                    <span className={s.label}>{video.likes_count}</span>
                </div>

                <div className={s.action} onClick={() => onComment(video.id)}>
                    <div className={s.iconCircle}>
                        <MessageCircle size={28} />
                    </div>
                    <span className={s.label}>{video.comment_count}</span>
                </div>

                <div className={s.action} onClick={() => onShare(video.id)}>
                    <div className={s.iconCircle}>
                        <Share2 size={24} />
                    </div>
                    <span className={s.label}>Share</span>
                </div>

                {/* Challenge Hook - If applicable */}
                <div className={s.action} onClick={() => navigate('/challenges')}>
                    <div className={s.iconCircle} style={{borderColor: '#ffd700', background: 'rgba(255, 215, 0, 0.1)'}}>
                        <Trophy size={24} color="#ffd700" />
                    </div>
                    <span className={s.label} style={{color: '#ffd700'}}>Join</span>
                </div>
            </div>

            {/* Bottom Metadata - Glassmorphism */}
            <div className={s.overlay}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div 
                        className="avatar-placeholder" 
                        style={{ width: '40px', height: '40px', border: '1.5px solid var(--accent-primary)' }}
                        onClick={() => navigate(`/profile/${video.owner?.username}`)}
                    >
                        {video.owner?.profile_pic ? (
                            <img src={video.owner.profile_pic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '1rem' }}>{video.owner?.username?.[0].toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 onClick={() => navigate(`/profile/${video.owner?.username}`)} style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                            @{video.owner?.username || 'creator'}
                        </h3>
                    </div>
                </div>
                <p style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: '12px', lineHeight: 1.4 }}>{video.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                    <Music size={14} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{video.song || 'Cinematic Audio'}</span>
                </div>
            </div>

            {/* Mute Toggle */}
            <button 
                className="mute-toggle" 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                style={{ top: '20px', right: '20px', bottom: 'auto' }}
            >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
        </div>
    );
};

export default FlashCard;
