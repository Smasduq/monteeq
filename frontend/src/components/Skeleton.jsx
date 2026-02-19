import React from 'react';

export const VideoSkeleton = () => (
    <div className="video-item" style={{ width: '100%' }}>
        <div className="skeleton skeleton-thumbnail" style={{ marginBottom: '0.8rem' }} />
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="skeleton skeleton-avatar" style={{ minWidth: '36px' }} />
            <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '90%', height: '1.2rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '60%', height: '0.9rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '40%', height: '0.8rem' }} />
            </div>
        </div>
    </div>
);

export const FlashSkeleton = () => (
    <div className="flash-shelf-item" style={{ width: '100%' }}>
        <div className="skeleton skeleton-flash" style={{ position: 'relative' }}>
            <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                padding: '0.8rem',
                gap: '0.5rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="skeleton skeleton-text" style={{ width: '80%', height: '1rem', background: 'rgba(255,255,255,0.1)' }} />
                <div className="skeleton skeleton-text" style={{ width: '50%', height: '0.8rem', background: 'rgba(255,255,255,0.1)' }} />
            </div>
        </div>
    </div>
);

export const WatchSkeleton = () => (
    <div className="watch-container">
        <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%', borderRadius: '0' }} />
        <div className="watch-meta" style={{ padding: '1.5rem 1rem' }}>
            <div className="skeleton skeleton-text" style={{ width: '70%', height: '2rem', marginBottom: '1.5rem' }} />
            <div className="skeleton" style={{ height: '150px', borderRadius: '12px', marginBottom: '2rem' }} />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="skeleton skeleton-avatar" style={{ width: '48px', height: '48px' }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '20%', height: '1.2rem' }} />
                    <div className="skeleton skeleton-text" style={{ width: '10%', height: '0.8rem' }} />
                </div>
            </div>
        </div>
    </div>
);

export const ProfileHeaderSkeleton = () => (
    <div className="profile-header glass" style={{ marginTop: '1rem', padding: '2.5rem 1.5rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <div className="skeleton skeleton-avatar" style={{ width: '140px', height: '140px' }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="skeleton skeleton-text" style={{ width: '40%', height: '2.5rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '20%', height: '1rem' }} />
            <div className="skeleton" style={{ width: '150px', height: '45px', borderRadius: '50px' }} />
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
            {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="skeleton skeleton-text" style={{ width: '40px', height: '1.5rem' }} />
                    <div className="skeleton skeleton-text" style={{ width: '60px', height: '0.7rem' }} />
                </div>
            ))}
        </div>
    </div>
);

export const PostSkeleton = () => (
    <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="skeleton skeleton-avatar" style={{ width: '48px', height: '48px' }} />
            <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: '30%', height: '1.1rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '15%', height: '0.8rem' }} />
            </div>
        </div>
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '1.2rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '1.2rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '60%', height: '1.2rem', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%', borderRadius: '16px' }} />
    </div>
);

export const SearchUserSkeleton = () => (
    <div className="user-card glass" style={{ minWidth: '200px', padding: '1.5rem', borderRadius: '20px', textAlign: 'center' }}>
        <div className="skeleton skeleton-avatar" style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '80%', height: '1.2rem', margin: '0 auto' }} />
        <div className="skeleton skeleton-text" style={{ width: '60%', height: '0.9rem', margin: '0.5rem auto 0' }} />
    </div>
);

export const SearchVideoSkeleton = () => (
    <div className="glass" style={{ display: 'flex', gap: '1.5rem', padding: '1rem', borderRadius: '20px' }}>
        <div className="skeleton" style={{ width: '300px', minWidth: '300px', aspectRatio: '16/9', borderRadius: '15px' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="skeleton skeleton-text" style={{ width: '70%', height: '1.5rem', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <div className="skeleton skeleton-avatar" style={{ width: '28px', height: '28px' }} />
                <div className="skeleton skeleton-text" style={{ width: '30%', height: '1rem' }} />
            </div>
            <div className="skeleton skeleton-text" style={{ width: '90%', height: '0.9rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '80%', height: '0.9rem' }} />
        </div>
    </div>
);

const Skeleton = () => {
    return <VideoSkeleton />;
};

export default Skeleton;
