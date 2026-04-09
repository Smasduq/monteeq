import React, { useState, useRef, useEffect } from 'react';
import { Play, AlertTriangle, Loader2, Clock } from 'lucide-react';

const VideoPreviewCard = ({ video, onClick, onLike }) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isHovered && videoRef.current) {
            videoRef.current.play().catch(err => {
                console.warn("Preview autoplay failed:", err);
            });
        }
    }, [isHovered]);

    const formatDuration = (seconds) => {
        if (!seconds) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="video-preview-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className="preview-container glass">
                {/* Static Thumbnail with Cinematic Overlay */}
                <div className="thumbnail-wrapper">
                    <img
                        src={video.thumbnail_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=60"}
                        alt={video.title}
                        className={`thumbnail ${isHovered && isLoaded ? 'hidden' : ''}`}
                    />
                    <div className="gradient-overlay"></div>
                </div>

                {/* Video Preview */}
                {isHovered && (
                    <video
                        ref={videoRef}
                        src={video.video_url}
                        muted
                        loop
                        playsInline
                        onLoadedData={() => setIsLoaded(true)}
                        className={`preview-video ${isLoaded ? 'visible' : ''}`}
                    />
                )}

                {/* Duration Badge */}
                {video.status === 'approved' && video.duration > 0 && (
                    <div className="duration-badge">
                        {formatDuration(video.duration)}
                    </div>
                )}

                {/* Status Overlays */}
                {video.status === 'pending' && (
                    <div className="status-overlay pending">
                        <Loader2 className="animate-spin" size={24} color="white" />
                        <span style={{ fontSize: '0.7rem', color: 'white', marginTop: '4px', fontWeight: 700 }}>PROCESSING</span>
                    </div>
                )}

                {video.status === 'failed' && (
                    <div className="status-overlay failed">
                        <AlertTriangle size={24} color="#ff3e3e" />
                        <span style={{ fontSize: '0.7rem', color: 'white', marginTop: '4px', fontWeight: 700 }}>FAILED</span>
                    </div>
                )}

                {/* Hover Play Icon */}
                {isHovered && !isLoaded && video.status === 'approved' && (
                    <div className="preview-loading">
                        <div className="mini-loader"></div>
                    </div>
                )}

                {isHovered && isLoaded && (
                    <div className="preview-indicator">
                        <Play size={12} fill="white" />
                    </div>
                )}
            </div>

            <style>{`
                .video-preview-card {
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                }
                .preview-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    border-radius: 1.5rem;
                    overflow: hidden;
                    box-shadow: var(--shadow-cinematic), var(--inner-glow);
                    transition: var(--transition-smooth);
                    border: 1px solid var(--border-glass);
                }
                .thumbnail-wrapper {
                    position: absolute;
                    inset: 0;
                }
                .gradient-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.8) 100%);
                    pointer-events: none;
                }
                .video-preview-card:hover .preview-container {
                    transform: scale(1.03);
                    box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 20px rgba(255, 62, 62, 0.2);
                    border-color: var(--accent-primary);
                }
                .thumbnail {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: opacity 0.3s ease;
                }
                .thumbnail.hidden {
                    opacity: 0;
                }
                .preview-video {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }
                .preview-video.visible {
                    opacity: 1;
                }
                .duration-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(0, 0, 0, 0.85);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    font-family: 'JetBrains Mono', monospace;
                    z-index: 10;
                    backdrop-filter: blur(4px);
                    border: 1px solid var(--border-glass);
                }
                .status-overlay {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    z-index: 5;
                }
                .mini-loader {
                    width: 24px;
                    height: 24px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-top-color: var(--accent-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VideoPreviewCard;
