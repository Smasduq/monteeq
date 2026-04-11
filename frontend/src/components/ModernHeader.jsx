import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, Menu, Search, Bell, Plus, User, 
    Settings, LogOut, Shield, Crown, X, 
    UploadCloud, History, TrendingUp, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getSearchSuggestions, getTrendingSuggestions } from '../api';
import s from './ModernHeader.module.css';

const ModernHeader = ({ onMenuToggle, isMenuOpen }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [trending, setTrending] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
    
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
    const { token, user, logout } = useAuth();
    const { unreadCount } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const isPremiumOrAdmin = user?.is_premium || user?.role === 'admin';

    useEffect(() => {
        // Load Search History
        const history = JSON.parse(localStorage.getItem('monteeq_search_history') || '[]');
        setSearchHistory(history);

        // Load Trending
        const loadTrending = async () => {
            try {
                const data = await getTrendingSuggestions();
                setTrending(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Trending error:", err);
            }
        };
        loadTrending();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);



    // Search Suggestions Logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    const data = await getSearchSuggestions(searchQuery);
                    setSuggestions(Array.isArray(data) ? data : []);
                    setShowSuggestions(true);
                } catch (err) {
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (q) => {
        const query = (typeof q === 'string' ? q : searchQuery).trim();
        if (query) {
            saveSearch(query);
            if (query.startsWith('@')) {
                navigate(`/profile/${query.replace('@', '')}`);
            } else {
                navigate(`/search?q=${encodeURIComponent(query)}`);
            }
            setShowSuggestions(false);
            setIsMobileSearchActive(false);
        }
    };

    const saveSearch = (query) => {
        if (!query || query.startsWith('@')) return;
        const history = JSON.parse(localStorage.getItem('monteeq_search_history') || '[]');
        const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5);
        localStorage.setItem('monteeq_search_history', JSON.stringify(newHistory));
        setSearchHistory(newHistory);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className={s.header}>
            {/* Left Section: Menu + Logo */}
            <div className={s.sectionLeft}>
                <button className={s.iconBtn} onClick={onMenuToggle}>
                    <Menu size={28} />
                </button>
                <div className={s.logo} onClick={() => navigate('/')}>
                    <Zap size={28} fill="var(--accent-primary)" color="var(--accent-primary)" />
                    <span className={s.wordmark}>MONTEEQ</span>
                </div>
            </div>

            {/* Center Section: YouTube Search Bar */}
            <div className={`${s.sectionCenter} ${isMobileSearchActive ? s.mobileActive : ''}`}>
                {isMobileSearchActive && (
                    <button className={s.backBtn} onClick={() => setIsMobileSearchActive(false)}>
                        <ArrowLeft size={24} />
                    </button>
                )}
                <div className={s.searchContainer} ref={dropdownRef}>
                    <div className={s.searchBox}>
                        <div className={s.searchIconWrapper}>
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Monteeq"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        {searchQuery && (
                            <button className={s.clearBtn} onClick={() => setSearchQuery('')}>
                                <X size={20} />
                            </button>
                        )}
                    </div>
                    <button className={s.searchBtn} onClick={() => handleSearch()}>
                        <Search size={20} />
                    </button>

                    {showSuggestions && (
                        <div className={s.suggestions}>
                            {searchQuery.trim() === '' ? (
                                <>
                                    {searchHistory.length > 0 && <div className={s.suggestionGroupLabel}>Recent Searches</div>}
                                    {searchHistory.map((h, i) => (
                                        <div key={`hist-${i}`} className={s.suggestionItem} onClick={() => handleSearch(h)}>
                                            <History size={18} className={s.suggestionIcon} />
                                            <span>{h}</span>
                                        </div>
                                    ))}
                                    {trending.length > 0 && <div className={s.suggestionGroupLabel}>Trending on Monteeq</div>}
                                    {trending.slice(0, 5).map((t, i) => (
                                        <div key={`trend-${i}`} className={s.suggestionItem} onClick={() => handleSearch(t)}>
                                            <TrendingUp size={18} className={s.suggestionIcon} />
                                            <span>{t}</span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                suggestions.map((sug, i) => (
                                    <div key={`sug-${i}`} className={s.suggestionItem} onClick={() => handleSearch(sug)}>
                                        <Search size={18} className={s.suggestionIcon} />
                                        <span>{sug}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section: Actions + User */}
            <div className={s.sectionRight}>
                <button className={`${s.mobileSearchBtn} mobile-only`} onClick={() => setIsMobileSearchActive(true)}>
                    <Search size={28} />
                </button>
                
                {token && (
                    <button className={s.createBtn} onClick={() => navigate('/upload')}>
                        <Plus size={24} />
                        <span className="desktop-only">Upload</span>
                    </button>
                )}

                <div className={s.iconGroup}>
                    <button className={s.iconBtn} onClick={() => navigate('/notifications')}>
                        <Bell size={28} />
                        {unreadCount > 0 && <span className={s.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>
                </div>

                <div className={s.profileContainer} ref={profileRef}>
                    <button className={`${s.profileBtn} ${s.mobileFullIcon}`} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                        {user?.profile_pic ? (
                            <img src={user.profile_pic} alt="Profile" />
                        ) : (
                            <div className={s.avatarPlaceholder}>
                                {user?.username?.charAt(0).toUpperCase() || <User size={28} />}
                            </div>
                        )}
                    </button>

                    {showProfileMenu && (
                        <div className={s.menuDropdown}>
                            <div className={s.menuHeader}>
                                <div className={s.menuUserMeta}>
                                    <p className={s.displayName}>{user?.full_name || user?.username}</p>
                                    <p className={s.handle}>@{user?.username}</p>
                                    {isPremiumOrAdmin && <span className={s.proBadge}>PRO</span>}
                                </div>
                            </div>
                            <div className={s.menuDivider} />
                            <div className={s.menuBody}>
                                <button className={s.menuItem} onClick={() => { setShowProfileMenu(false); navigate(`/profile/${user?.username}`); }}>
                                    <User size={18} /> Profile
                                </button>
                                <button className={s.menuItem} onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}>
                                    <Settings size={18} /> Settings
                                </button>
                                {user?.role === 'admin' && (
                                    <button className={s.menuItem} onClick={() => window.location.href = 'http://localhost:5174'}>
                                        <Shield size={18} /> Admin Panel
                                    </button>
                                )}
                                {!isPremiumOrAdmin && (
                                    <button className={s.menuItem} onClick={() => { setShowProfileMenu(false); navigate('/pro'); }} style={{ color: '#ffd700' }}>
                                        <Crown size={18} /> Go Pro
                                    </button>
                                )}
                                <div className={s.menuDivider} />
                                <button className={s.menuItem} onClick={handleLogout}>
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ModernHeader;
