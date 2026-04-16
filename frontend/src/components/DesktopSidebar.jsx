/**
 * DesktopSidebar.jsx
 * Category-focused sidebar with Home navigation and branding.
 */
import React from 'react';
import { Film, Trophy, Gamepad2, Crosshair, Sparkles, Hash, Home, Flame, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DesktopSidebar = ({ activeCategory, onSelectCategory, feedType, setFeedType }) => {
    const navigate = useNavigate();
    
    const categories = [
        { id: 'amv', label: 'AMV', icon: Film },
        { id: 'football', label: 'Football Edit', icon: Trophy },
        { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
        { id: 'tactical', label: 'Tactical', icon: Crosshair },
        { id: 'anime', label: 'Anime', icon: Sparkles },
    ];

    const NavItem = ({ icon: Icon, label, onClick, active, isHome = false }) => (
        <div 
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 20px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                color: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.6)',
                background: active ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                fontWeight: active ? '800' : '600',
                fontSize: '1.05rem',
                border: active ? '1px solid rgba(0, 229, 255, 0.2)' : '1px solid transparent',
                marginBottom: isHome ? '20px' : '0'
            }}
            className="sidebar-item-hover"
        >
            <Icon size={22} />
            <span>{label}</span>
        </div>
    );

    return (
        <aside style={{
            width: '300px',
            height: '100%',
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            background: 'rgba(18, 20, 24, 0.15)',
            backdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.03)',
            zIndex: 100
        }}>
            {/* Logo Section */}
            <div style={{ padding: '0 10px', marginBottom: '10px' }}>
                <h1 style={{ 
                    fontSize: '1.6rem', 
                    fontWeight: '950', 
                    letterSpacing: '-1.5px', 
                    color: '#fff',
                    background: 'linear-gradient(to right, #fff, var(--accent-primary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    cursor: 'pointer'
                }} onClick={() => navigate('/')}>
                    MONTEEQ
                </h1>
                <p style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '2px', marginTop: '4px'}}>
                    FLASH FEED
                </p>
            </div>

            {/* Scrollable Navigation Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="sidebar-scrollable">
                {/* Main Home Button */}
                <nav style={{ display: 'flex', flexDirection: 'column' }}>
                <NavItem 
                    icon={Home} 
                    label="Home" 
                    onClick={() => navigate('/')}
                    active={false}
                    isHome={true}
                />
            </nav>

            {/* Feeds Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>
                <Flame size={12} />
                <span>FEEDS</span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <NavItem icon={Flame} label="For You" onClick={() => setFeedType('foryou')} active={feedType === 'foryou'} />
                <NavItem icon={Star} label="Trending" onClick={() => setFeedType('trending')} active={feedType === 'trending'} />
                <NavItem icon={Users} label="Following" onClick={() => setFeedType('following')} active={feedType === 'following'} />
            </nav>

            {/* Categories Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>
                <Hash size={12} />
                <span>CATEGORIES</span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map(cat => (
                    <NavItem 
                        key={cat.id} 
                        icon={cat.icon} 
                        label={cat.label} 
                        onClick={() => onSelectCategory(cat.id)}
                        active={activeCategory === cat.id} 
                    />
                ))}
            </nav>
            </div>

            {/* Premium Footer Info */}
            <div style={{ marginTop: 'auto', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)', flexShrink: 0 }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '600', lineHeight: 1.5 }}>
                    Join challenges to earn <span style={{color: 'var(--accent-primary)'}}>₦Monteeq</span> rewards.
                </p>
            </div>

            <style>{`
                .sidebar-item-hover:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    transform: scale(1.02);
                }
                .sidebar-scrollable::-webkit-scrollbar {
                    display: none;
                }
                .sidebar-scrollable {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </aside>
    );
};

export default DesktopSidebar;
