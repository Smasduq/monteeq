import React from 'react';
import { Heart, MessageSquare, Repeat2, Send, MoreHorizontal, Loader2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getPosts } from '../api';
import { useNavigate } from 'react-router-dom';
import CommentsDrawer from '../components/CommentsDrawer';
import { PostSkeleton } from '../components/Skeleton';

const Posts = () => {
    const { showNotification } = useNotification();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [skip, setSkip] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(true);
    const [activeCommentPostId, setActiveCommentPostId] = React.useState(null);
    const observer = React.useRef();

    const lastPostElementRef = React.useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setSkip(prevSkip => prevSkip + 10);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const fetchPosts = async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const data = await getPosts(token, isInitial ? 0 : skip, 10);
            if (Array.isArray(data)) {
                if (isInitial) {
                    setPosts(data);
                } else {
                    setPosts(prev => [...prev, ...data]);
                }
                setHasMore(data.length === 10);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
            showNotification('error', 'Failed to load community feed');
        } finally {
            if (isInitial) setLoading(false);
            else setLoadingMore(false);
        }
    };

    React.useEffect(() => {
        fetchPosts(true);
    }, [token]);

    React.useEffect(() => {
        if (skip > 0) {
            fetchPosts(false);
        }
    }, [skip]);

    const formatTime = (dateStr) => {
        if (!dateStr) return 'some time ago';
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    const handleLike = async (id) => {
        if (!token) {
            showNotification('error', 'Please login to like');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setPosts(posts.map(p => p.id === id ? {
                    ...p,
                    liked_by_user: result.liked,
                    likes_count: result.likes_count
                } : p));
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const handleRepost = async (id) => {
        if (!token) {
            showNotification('error', 'Please login to repost');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${id}/repost`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                showNotification('success', 'Reposted to your profile!');
                setSkip(0);
                fetchPosts(true); // Refresh to see the new repost
            } else {
                showNotification('error', 'Failed to repost');
            }
        } catch (error) {
            showNotification('error', 'Something went wrong while reposting');
        }
    };

    const handleTagClick = (tag) => {
        const query = tag.startsWith('#') ? tag : `#${tag}`;
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="page-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem' }}>Community Feed</h2>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {[...Array(3)].map((_, i) => (
                        <PostSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {posts.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>No posts yet. Be the first to share something!</p>
                        </div>
                    ) : (
                        posts.map((post, index) => {
                            const isRepost = !!post.original_post;
                            const displayData = isRepost ? post.original_post : post;
                            const reposter = isRepost ? post.owner : null;

                            return (
                                <div
                                    key={post.id}
                                    className="glass hover-scale"
                                    style={{ padding: '2rem', borderRadius: '24px' }}
                                    ref={posts.length === index + 1 ? lastPostElementRef : null}
                                >
                                    {isRepost && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                                            <Repeat2 size={14} /> Reposted by {reposter.username}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: displayData.owner?.profile_pic ? `url(${displayData.owner.profile_pic}) center/cover` : 'linear-gradient(45deg, var(--accent-primary), #ff8e8e)',
                                                border: '2px solid var(--border-glass)'
                                            }} />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{displayData.owner?.username || 'Anonymous'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatTime(displayData.created_at)}</div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-active"
                                            onClick={() => showNotification('info', 'Post options coming soon')}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>

                                    <div style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                                        {displayData.content}
                                    </div>

                                    {displayData.image_url && (
                                        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
                                            <img src={displayData.image_url} alt="post content" style={{ width: '100%', display: 'block' }} />
                                        </div>
                                    )}

                                    {displayData.tags && (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                            {displayData.tags.split(',').map((tag, i) => (
                                                <span
                                                    key={i}
                                                    onClick={() => handleTagClick(tag.trim())}
                                                    style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    #{tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                                        <button
                                            onClick={() => handleLike(displayData.id)}
                                            className="btn-active"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: displayData.liked_by_user ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <Heart size={18} fill={displayData.liked_by_user ? 'var(--accent-primary)' : 'none'} /> {displayData.likes_count || 0}
                                        </button>
                                        <button
                                            onClick={() => setActiveCommentPostId(displayData.id)}
                                            className="btn-active"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <MessageSquare size={18} /> {displayData.comments_count || 0}
                                        </button>
                                        <button
                                            onClick={() => handleRepost(displayData.id)}
                                            className="btn-active"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            <Repeat2 size={18} /> {isRepost ? 'Reposted' : ''}
                                        </button>
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {displayData.views_count || 0} views
                                        </div>
                                        <button
                                            onClick={() => showNotification('success', 'Post link copied!')}
                                            className="btn-active"
                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {loadingMore && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                    <PostSkeleton />
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    You've reached the end of the feed!
                </div>
            )}

            {activeCommentPostId && (
                <CommentsDrawer
                    postId={activeCommentPostId}
                    onClose={() => setActiveCommentPostId(null)}
                />
            )}
        </div>
    );
};

export default Posts;
