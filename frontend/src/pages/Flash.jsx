import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getVideos, likeVideo, shareVideo, toggleFollow } from '../api';
import FlashCard from '../components/FlashCard';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FlashSkeleton } from '../components/Skeleton';
import s from './Flash.module.css';

const Flash = () => {
    const { showNotification } = useNotification();
    const [clips, setClips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState(null);
    const [muted, setMuted] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { token } = useAuth();

    const containerRef = useRef(null);

    const fetchClips = async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const currentSkip = isInitial ? 0 : skip;
            const limit = 5;
            const data = await getVideos('flash', token, currentSkip, limit);

            if (Array.isArray(data)) {
                const formatted = data.map(video => ({
                    ...video,
                    liked: video.liked_by_user,
                    owner_followed: video.owner?.is_following || false
                }));

                if (isInitial) {
                    setClips(formatted);
                    if (formatted.length > 0) setActiveVideoId(formatted[0].id);
                } else {
                    setClips(prev => [...prev, ...formatted]);
                }
                setHasMore(data.length === limit);
            }
        } catch (err) {
            console.error("Failed to load clips", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchClips(true);
    }, [token]);

    // Virtualization / Intersection Observer Logic
    useEffect(() => {
        if (loading || clips.length === 0) return;

        const handleIntersection = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = parseInt(entry.target.getAttribute('data-id'));
                    setActiveVideoId(id);

                    // Infinite Scroll trigger
                    if (entry.target.getAttribute('data-last') === 'true' && hasMore && !loadingMore) {
                        setSkip(clips.length);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, {
            threshold: 0.7
        });

        const cardContainers = document.querySelectorAll(`.${s.cardContainer}`);
        cardContainers.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [loading, clips.length, hasMore, loadingMore]);

    // Performant Rendering Logic (Virtualization subset)
    const visibleClips = useMemo(() => {
        const activeIndex = clips.findIndex(c => c.id === activeVideoId);
        return clips.map((clip, index) => ({
            ...clip,
            shouldRender: Math.abs(activeIndex - index) <= 2,
            isLast: index === clips.length - 1
        }));
    }, [clips, activeVideoId]);

    const handleLike = async (id) => {
        if (!token) {
            showNotification('info', "Please login to like!");
            return;
        }
        setClips(prev => prev.map(c =>
            c.id === id ? { ...c, liked: !c.liked, likes_count: c.liked ? c.likes_count - 1 : c.likes_count + 1 } : c
        ));
        try { await likeVideo(id, token); } catch (err) { /* revert logic optionally */ }
    };

    const handleShare = async (id) => {
        await navigator.clipboard.writeText(`${window.location.origin}/watch/${id}`);
        showNotification('success', "Link copied!");
    };

    if (loading) return (
        <div className={s.container}>
            <div className={s.feed}>
                {[...Array(2)].map((_, i) => (
                    <div key={i} className={s.cardContainer}>
                        <FlashSkeleton />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className={s.container}>
            <div className={s.feed} ref={containerRef}>
                {visibleClips.map((clip) => (
                    <div
                        className={`${s.cardContainer} ${activeVideoId === clip.id ? s.activeCard : ''}`}
                        key={clip.id}
                        data-id={clip.id}
                        data-last={clip.isLast}
                    >
                        <FlashCard
                            video={clip}
                            isActive={activeVideoId === clip.id}
                            onLike={handleLike}
                            onShare={handleShare}
                            onComment={() => {}} // Integration pending
                            muted={muted}
                            toggleMute={() => setMuted(!muted)}
                            shouldRender={clip.shouldRender}
                        />
                    </div>
                ))}
                
                {loadingMore && (
                    <div className={s.cardContainer}>
                        <FlashSkeleton />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Flash;
