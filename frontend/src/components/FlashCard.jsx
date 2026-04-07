import React, { useRef, useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Music, Play, Pause, Volume2, VolumeX, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { viewVideo } from '../api';

const FlashCard = ({ video, isActive, onLike, onComment, onShare, onFollow, muted, toggleMute, shouldRender = true }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [viewCounted, setViewCounted] = useState(false);
    // Double tap logic
    const lastTap = useRef(0);

    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive && video.status === 'approved') {
            videoRef.current.play().catch(() => { });
            setPlaying(true);
            setViewCounted(false); // Reset for new active video
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setPlaying(false);
        }
    }, [isActive, video.status]);

    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = muted;
    }, [muted]);

    const handleTimeUpdate = (e) => {
        if (viewCounted || !video) return;

        const { currentTime, duration } = e.target;
        if (duration > 0) {
            // For short flash videos, count view after 15% or 3 seconds
            if ((currentTime / duration) > 0.15 || currentTime > 3) {
                setViewCounted(true);
                viewVideo(video.id).catch(console.error);
            }
        }
    };

    const handleTap = (e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // Double tap
            handleLikeAnimation(e);
            if (!video.liked) onLike(video.id);
        } else {
            // Single tap - toggle play
            togglePlay();
        }
        lastTap.current = now;
    };

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setPlaying(true);
        } else {
            videoRef.current.pause();
            setPlaying(false);
        }
    };

    const handleLikeAnimation = (e) => {
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    };

    return (
        <div className="flash-card">
            <div className="video-wrapper" onClick={handleTap}>
                <video
                    ref={videoRef}
                    src={shouldRender ? video.video_url : ""}
                    loop
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    className="flash-video-player"
                />

                {/* Status Overlays */}
                {video.status === 'pending' && (
                    <div className="status-overlay pending">
                        <Loader2 className="animate-spin" size={48} color="white" />
                        <span>Processing...</span>
                    </div>
                )}

                {video.status === 'failed' && (
                    <div className="status-overlay failed">
                        <AlertTriangle size={48} color="#ff3e3e" />
                        <h3 style={{ color: 'white', marginTop: '1rem' }}>Upload Failed</h3>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate('/manage-content'); }}
                            className="retry-btn"
                        >
                            <RefreshCw size={16} /> Manage & Retry
                        </button>
                    </div>
                )}

                {/* Heart Animation Overlay */}
                {showHeart && (
                    <div className="heart-pop">
                        <Heart size={100} fill="var(--accent-primary)" color="var(--accent-primary)" />
                    </div>
                )}

                {/* Play/Pause Indicator (optional, transient) */}
                {!playing && video.status === 'approved' && (
                    <div className="play-indicator">
                        <Play size={50} fill="rgba(255,255,255,0.5)" color="white" />
                    </div>
                )}
            </div>

            {/* Sidebar Actions */}
            <div className="flash-sidebar">
                <div className="sidebar-action" onClick={() => onLike(video.id)} title="Like (l)">
                    <div className={`icon-circle ${video.liked ? 'liked' : ''}`}>
                        <Heart size={28} fill={video.liked ? 'var(--accent-primary)' : 'rgba(0,0,0,0.3)'} color={video.liked ? 'var(--accent-primary)' : 'white'} />
                    </div>
                    <span>{video.likes_count}</span>
                </div>

                <div className="sidebar-action" onClick={() => onComment(video.id)} title="Comments (c)">
                    <div className="icon-circle">
                        <MessageCircle size={28} fill="rgba(0,0,0,0.3)" color="white" />
                    </div>
                    <span>{video.comment_count}</span>
                </div>

                <div className="sidebar-action" onClick={() => onShare(video.id)} title="Share">
                    <div className="icon-circle">
                        <Share2 size={28} fill="rgba(0,0,0,0.3)" color="white" />
                    </div>
                    <span>Share</span>
                </div>
            </div>

            {/* Bottom Metadata */}
            <div className="flash-info">
                <div className="info-user">
                    <div
                        className="avatar-placeholder"
                        style={{ width: '42px', height: '42px', cursor: 'pointer', border: '2px solid white' }}
                        onClick={() => navigate(`/profile/${video.owner?.username}`)}
                    >
                        {video.owner?.profile_pic ? (
                            <img src={video.owner.profile_pic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '1.2rem' }}>{video.owner?.username?.[0].toUpperCase()}</span>
                        )}
                    </div>
                    <div className="user-text-meta">
                        <h3
                            onClick={() => navigate(`/profile/${video.owner?.username}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            @{video.owner?.username || 'user'}
                        </h3>
                        {video.owner?.id !== user?.id && (
                            <button
                                className={`follow-btn ${video.owner_followed ? 'followed' : ''}`}
                                title={video.owner_followed ? 'Unfollow User' : 'Follow User'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFollow();
                                }}
                                style={{
                                    background: video.owner_followed ? 'rgba(255,255,255,0.2)' : 'var(--accent-primary)',
                                    border: video.owner_followed ? '1px solid rgba(255,255,255,0.3)' : 'none',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {video.owner_followed ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>
                <p className="info-description">{video.title}</p>
                {video.tags && (
                    <div className="info-tags" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {video.tags.split(',').map((tag, i) => (
                            <span
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/search?q=${encodeURIComponent('#' + tag.trim())}`);
                                }}
                                style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>
                )}
                <div className="info-music">
                    <Music size={14} />
                    <div className="marquee">
                        <span>{video.song || 'Original Sound'}</span>
                    </div>
                </div>
            </div>

            {/* Spinner Disc */}
            <div className={`disc-spinner ${playing ? 'spinning' : ''}`}>
                <div className="disc-art" />
            </div>

            {/* Mute Toggle */}
            {video.status === 'approved' && (
                <button className="mute-toggle" onClick={(e) => { e.stopPropagation(); toggleMute(); }} title="Mute (m)">
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            )}

            <style>{`
                .status-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(5px);
                    z-index: 10;
                }
                .status-overlay.pending span {
                    color: white;
                    margin-top: 1rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                .retry-btn {
                    margin-top: 1.5rem;
                    background: var(--accent-primary);
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 99px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 8px 20px rgba(255, 62, 62, 0.3);
                    transition: transform 0.2s;
                }
                .retry-btn:hover {
                    transform: scale(1.05);
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default FlashCard;
