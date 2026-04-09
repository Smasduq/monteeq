import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getVideoById, getComments, postComment, updateComment, deleteComment, likeVideo, shareVideo, viewVideo } from '../api';
import { Heart, Share2, Send, MessageSquare, Download, X, Check } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import CommentItem from '../components/CommentItem';
import { WatchSkeleton } from '../components/Skeleton';
import MonetizationWidget from '../components/MonetizationWidget';

const DownloadModal = ({ video, onClose, user }) => {
    const { showNotification } = useNotification();
    // Helper to identify resolution availability
    const resolutions = [
        { label: '4K', value: '4k', src: video.url_4k, premium: true },
        { label: '2K', value: '2k', src: video.url_2k, premium: true },
        { label: '1080p', value: '1080p', src: video.url_1080p, premium: true },
        { label: '720p', value: '720p', src: video.url_720p, premium: false },
        { label: '480p', value: '480p', src: video.url_480p, premium: false },
    ].filter(r => r.src); // Only show available

    // fallback if no specific resolutions
    if (resolutions.length === 0 && video.video_url) {
        resolutions.push({ label: 'Original', value: 'original', src: video.video_url, premium: false });
    }

    const handleDownload = (res) => {
        if (res.premium && !user?.is_premium) {
            showNotification('info', 'Premium Required', { message: `Downloading ${res.label} requires a Premium subscription.` });
            return;
        }

        const link = document.createElement('a');
        link.href = res.src;
        link.download = `${video.title}_${res.label}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)'
        }}>
            <div className="modal-content glass" style={{
                background: '#1a1a1a', padding: '1.5rem', borderRadius: '1.5rem',
                width: '100%', maxWidth: '400px', position: 'relative',
                border: '1px solid var(--border-glass)',
                maxHeight: '80vh', overflowY: 'auto'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'none', border: 'none', color: '#666', cursor: 'pointer',
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}><X size={20} /></button>

                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800 }}>Download Quality</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {resolutions.map(res => (
                        <button
                            key={res.value}
                            onClick={() => handleDownload(res)}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1.2rem', borderRadius: '1rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{res.label}</span>
                            {res.premium && !user?.is_premium ? (
                                <span style={{
                                    fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', color: '#aaa',
                                    padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800
                                }}>Premium</span>
                            ) : (
                                <Download size={20} color="var(--accent-primary)" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const Watch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user } = useAuth();
    const { showNotification } = useNotification();
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
    const [replyComment, setReplyComment] = useState("");
    const [isTheaterMode, setIsTheaterMode] = useState(false);



    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                // Check for share source
                const searchParams = new URLSearchParams(location.search);
                if (searchParams.get('source') === 'share') {
                    shareVideo(id).catch(console.error);
                }

                const [videoData, commentsData] = await Promise.all([
                    getVideoById(id, token),
                    getComments(id)
                ]);
                setVideo(videoData);
                setComments(commentsData);
            } catch (err) {
                console.error("Failed to load video data", err);
                setError("Video not found");
            } finally {
                setLoading(false);
            }
        };
        fetchVideoData();
    }, [id, location.search]);

    const handleTimeUpdate = (e) => {
        // Validation logic moved to VideoPlayer heartbeat system
    };

    const handleCommentSubmit = async (e, parentId = null) => {
        e.preventDefault();
        const content = parentId ? replyComment : newComment;
        if (!content.trim()) return;
        if (!token) return showNotification('info', "Please login to comment");
        
        if (video.status !== 'approved') {
            return showNotification('warning', "Comments are currently disabled", { message: "Wait for the video to be approved before sharing your thoughts!" });
        }

        try {
            const addedComment = await postComment({ videoId: id, content, parent_id: parentId }, token);

            if (parentId) {
                // Nested update: find parent and add to its replies
                const updateReplies = (list) => list.map(c => {
                    if (c.id === parentId) {
                        return { ...c, replies: [...(c.replies || []), addedComment] };
                    }
                    if (c.replies) return { ...c, replies: updateReplies(c.replies) };
                    return c;
                });
                setComments(updateReplies(comments));
                setReplyingTo(null);
                setReplyComment("");
            } else {
                setComments([addedComment, ...comments]);
                setNewComment("");
            }
        } catch (err) {
            console.error("Failed to post comment", err);
            showNotification('error', "Failed to post comment");
        }
    };

    const handleCommentEdit = async (commentId, content) => {
        if (!token) return;
        try {
            const updated = await updateComment({ videoId: id, commentId, content }, token);
            const recursiveUpdate = (list) => list.map(c => {
                if (c.id === commentId) return { ...c, ...updated };
                if (c.replies) return { ...c, replies: recursiveUpdate(c.replies) };
                return c;
            });
            setComments(recursiveUpdate(comments));
            showNotification('success', "Comment updated");
        } catch (err) {
            console.error("Failed to edit comment", err);
            showNotification('error', "Failed to edit comment");
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!token) return;
        try {
            await deleteComment({ videoId: id, commentId }, token);
            const recursiveFilter = (list) => list.filter(c => c.id !== commentId).map(c => {
                if (c.replies) return { ...c, replies: recursiveFilter(c.replies) };
                return c;
            });
            setComments(recursiveFilter(comments));
            showNotification('success', "Comment deleted");
        } catch (err) {
            console.error("Failed to delete comment", err);
            showNotification('error', "Failed to delete comment");
        }
    };

    const handleLike = async () => {
        if (!token) return showNotification('info', "Please login to like");
        if (video.status !== 'approved') {
            return showNotification('warning', "Likes are disabled", { message: "Interactions will be available once the video is approved." });
        }
        try {
            await likeVideo(id, token);
            setVideo(prev => ({
                ...prev,
                liked_by_user: !prev.liked_by_user,
                likes_count: prev.liked_by_user ? prev.likes_count - 1 : prev.likes_count + 1
            }));
        } catch (err) {
            console.error("Failed to like video", err);
        }
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/watch/${id}?source=share`;
        await navigator.clipboard.writeText(shareUrl);
        showNotification('success', "Link copied to clipboard!");
    };

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key.toLowerCase() === 'n') {
                e.preventDefault();
                // Navigate to a "next" video. 
                // For now, let's fetch videos and navigate to the first one that isn't the current etc.
                // Or if we had a list of recommendations, we'd use that.
                // Simple implementation: fetch home videos and go to one.
                const navigateToNext = async () => {
                    try {
                        const vids = await getVideos('home', token);
                        if (vids && vids.length > 0) {
                            // Filter out current and find next index or just pick a random one
                            const others = vids.filter(v => v.id.toString() !== id.toString());
                            if (others.length > 0) {
                                const next = others[Math.floor(Math.random() * others.length)];
                                navigate(`/watch/${next.id}`);
                            }
                        }
                    } catch (err) {
                        console.error("Failed to find next video:", err);
                    }
                };
                navigateToNext();
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [id, token, navigate]);

    if (loading) return <WatchSkeleton />;

    if (error || !video) return <div className="page-error">{error || "Video not found"}</div>;

    const actionBtnStyle = {
        display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem',
        borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer',
        transition: 'all 0.3s ease', fontSize: '0.95rem', fontWeight: 500
    };

    return (
        <div className="watch-container layout-monetized">
            <div className="watch-main">
                <div className={`${isTheaterMode ? 'watch-video-theater' : 'watch-video-wrapper'}`}>
                    <VideoPlayer 
                      src={video.video_url} 
                      videoId={video.id}
                      poster={video.thumbnail_url}
                      autoPlay={true} 
                      onTimeUpdate={handleTimeUpdate} 
                      isTheaterMode={isTheaterMode}
                      toggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
                    />
                </div>

                <div className="watch-meta" style={{ padding: '1.5rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3 }}>{video.title}</h1>
                        {video.status !== 'approved' && (
                            <div style={{
                                background: video.status === 'pending' ? 'rgba(255, 171, 0, 0.1)' : 'rgba(255, 62, 62, 0.1)',
                                color: video.status === 'pending' ? '#ffab00' : '#ff3e3e',
                                padding: '0.3rem 0.8rem',
                                borderRadius: '50px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                border: '1px solid currentColor',
                                letterSpacing: '1px'
                            }}>
                                {video.status.toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Video Info Section */}
                    <div className="glass" style={{ padding: '1.2rem', borderRadius: '12px', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                {video.views?.toLocaleString()} views • {video.created_at ? new Date(video.created_at).toLocaleDateString() : 'Recently'}
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                            {video.description || "No description provided."}
                        </p>

                        {video.tags && (
                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                {video.tags.split(',').map((tag, i) => (
                                    <span
                                        key={i}
                                        onClick={() => navigate(`/search?q=${encodeURIComponent('#' + tag.trim())}`)}
                                        style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div
                                onClick={() => navigate(`/profile/${video.owner?.username}`)}
                                className="avatar-placeholder"
                                style={{
                                    width: '48px', height: '48px', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                {video.owner?.profile_pic ? (
                                    <img src={video.owner.profile_pic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ fontSize: '1.2rem' }}>
                                        {video.owner?.username?.[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div
                                    onClick={() => navigate(`/profile/${video.owner?.username}`)}
                                    style={{ fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer' }}
                                    className="hover-underline"
                                >
                                    @{video.owner?.username || 'Unknown'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {video.owner?.followers_count || 0} followers
                                </div>
                            </div>
                        </div>

                        <div className="watch-actions" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', maskImage: 'linear-gradient(to right, black 90%, transparent)' }}>
                            <button
                                className={`watch-btn ${video.liked_by_user ? 'liked' : ''}`}
                                onClick={handleLike}
                                style={{ 
                                    flexShrink: 0, 
                                    padding: '0.6rem 1.2rem',
                                    opacity: video.status === 'approved' ? 1 : 0.5,
                                    cursor: video.status === 'approved' ? 'pointer' : 'not-allowed'
                                }}
                            >
                                <Heart
                                    size={18}
                                    fill={video.liked_by_user ? 'currentColor' : 'none'}
                                    color="currentColor"
                                />
                                {video.likes_count}
                            </button>
                            <button className="watch-btn" onClick={handleShare} style={{ flexShrink: 0, padding: '0.6rem 1.2rem' }}>
                                <Share2 size={18} /> Share
                            </button>
                            <button className="watch-btn" onClick={() => setShowDownloadModal(true)} style={{ flexShrink: 0, padding: '0.6rem 1.2rem' }}>
                                <Download size={18} /> Download
                            </button>
                        </div>
                    </div>
                    {/* Monetization Widget - Integrated above comments */}
                    <div style={{ marginBottom: '2.5rem' }}>
                         <MonetizationWidget video={video} />
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="avatar-placeholder" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333' }} />
                        <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={video.status !== 'approved'}
                                placeholder={video.status === 'approved' ? "Add a comment..." : "Comments are disabled while processing..."}
                                className="glass"
                                style={{
                                    flex: 1,
                                    padding: '0.8rem 1rem',
                                    borderRadius: '8px',
                                    color: 'white',
                                    border: '1px solid var(--border-glass)',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                className="btn-active"
                                disabled={!newComment.trim() || video.status !== 'approved'}
                                style={{
                                    background: 'var(--accent-primary)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0 1rem',
                                    cursor: 'pointer',
                                    opacity: newComment.trim() ? 1 : 0.5
                                }}
                            >
                                <Send size={20} color="white" />
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {comments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                onReply={(id) => setReplyingTo(id)}
                                replyingTo={replyingTo}
                                replyComment={replyComment}
                                setReplyComment={setReplyComment}
                                isApproved={video.status === 'approved'}
                                onSubmitReply={(parentId) => handleCommentSubmit({ preventDefault: () => { } }, parentId || comment.id)}
                                onEdit={handleCommentEdit}
                                onDelete={handleCommentDelete}
                            />
                        ))}
                        {comments.length === 0 && (
                            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No comments yet. Be the first to share your thoughts!</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="watch-sidebar">
                {/* Related videos or ADs could go here eventually */}
            </div>

            {showDownloadModal && (
                <DownloadModal
                    video={video}
                    onClose={() => setShowDownloadModal(false)}
                    user={user}
                />
            )}

            <style>{`
                .layout-monetized {
                    display: grid;
                    grid-template-columns: ${isTheaterMode ? '1fr' : '1fr 350px'};
                    gap: 2rem;
                    align-items: start;
                    transition: grid-template-columns 0.4s ease;
                }
                .watch-main {
                    min-width: 0;
                }
                .watch-video-theater {
                    grid-column: 1 / -1;
                    margin: 0 -2rem; /* Full span */
                    background: #000;
                }
                .watch-sidebar {
                    position: sticky;
                    top: 100px;
                    display: ${isTheaterMode ? 'none' : 'block'};
                }
                @media (max-width: 1024px) {
                    .layout-monetized {
                        grid-template-columns: 1fr;
                    }
                    .watch-sidebar {
                        position: relative;
                        top: 0;
                        margin-top: 1rem;
                        display: block;
                    }
                }
            `}</style>
        </div>
    );
};

export default Watch;