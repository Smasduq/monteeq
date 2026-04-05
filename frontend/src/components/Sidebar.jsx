import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, Zap, Layout, UploadCloud, LogIn, LogOut, Clapperboard, Trophy, TrendingUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout, token } = useAuth();
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    return (
        <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
            <nav className="nav-menu">
                <NavLink to="/" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <HomeIcon size={20} />
                    <span>Home</span>
                </NavLink>
                <NavLink to="/flash" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Zap size={20} />
                    <span>Flash Clips</span>
                </NavLink>
                <NavLink to="/posts" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Layout size={20} />
                    <span>Feed</span>
                </NavLink>
                <NavLink to="/challenges" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Trophy size={20} color="var(--accent-primary)" />
                    <span>Challenges</span>
                </NavLink>

                {token && (
                    <NavLink to="/manage" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Clapperboard size={20} />
                        <span>Manage Content</span>
                    </NavLink>
                )}
                {token && (
                    <NavLink to="/achievements" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Trophy size={20} />
                        <span>Achievements</span>
                    </NavLink>
                )}
                {token && (
                    <NavLink to="/insights" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <TrendingUp size={20} color="#f59e0b" />
                        <span>Insights</span>
                    </NavLink>
                )}
                {token && (
                    <NavLink to="/chat" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <MessageSquare size={20} />
                        <span>Messages</span>
                    </NavLink>
                )}
                <NavLink to="/upload" onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{
                    color: 'var(--accent-primary)',
                    fontWeight: 'bold', transition: 'all 0.3s ease'
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <UploadCloud size={20} strokeWidth={2.5} />
                    <span>Upload Content</span>
                </NavLink>
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {token ? (
                    <>
                        <div className="user-info">
                            <div className="user-role">{user?.role || 'User'}</div>
                            <div className="user-name">{user?.username}</div>
                        </div>
                        <button onClick={() => setShowLogoutPopup(true)} className="nav-item" title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" onClick={onClose} className="nav-item" style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), #ff4b4b)',
                        color: 'white', fontWeight: 'bold', border: 'none',
                        boxShadow: '0 4px 15px rgba(255, 62, 62, 0.4)', transition: 'all 0.3s ease'
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                       onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <LogIn size={20} strokeWidth={2.5} />
                        <span>Login</span>
                    </NavLink>
                )}
            </div>

            {showLogoutPopup && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div className="glass" style={{
                        padding: '2rem', borderRadius: '16px', maxWidth: '340px', width: '90%',
                        textAlign: 'center', border: '1px solid rgba(255, 62, 62, 0.3)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                    }}>
                        <LogOut size={50} color="var(--accent-primary)" style={{ marginBottom: '1rem', opacity: 0.9 }} />
                        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Sign Out</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
                            Are you sure you want to sign out of your account?
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowLogoutPopup(false)} title="Cancel Logout" style={{
                                flex: 1, padding: '0.8rem', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', color: 'white',
                                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                                fontWeight: 'bold', transition: 'background 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                               onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                Cancel
                            </button>
                            <button onClick={() => { logout(); onClose(); setShowLogoutPopup(false); }} title="Confirm Logout" style={{
                                flex: 1, padding: '0.8rem', borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--accent-primary), #ff4b4b)', color: 'white',
                                border: 'none', cursor: 'pointer', fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(255, 62, 62, 0.4)', transition: 'transform 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </aside>
    );
};

export default Sidebar;
