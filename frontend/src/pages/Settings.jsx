import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    User, 
    Settings as AccountIcon, 
    Award, 
    CreditCard, 
    Bell, 
    Shield, 
    Save, 
    Check, 
    AlertCircle, 
    Camera,
    ChevronRight,
    Globe,
    ExternalLink,
    Copy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { useLocation } from 'react-router-dom';

const Settings = () => {
    const { user, token, updateAuthToken, setUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();

    // Deep link support via query params (e.g., ?tab=payments)
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'profile';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        bio: '',
        show_wins: true,
        show_trophies: true,
        payout_method: 'stripe',
        notif_new_follower: true,
        notif_challenge_win: true,
        notif_comments: true,
        notif_likes: false,
        email_weekly: true,
        email_challenges: true,
        email_payouts: true,
        email_marketing: false,
        two_factor_enabled: false,
        interests: '',
        goals: '',
        referral_source: ''
    });

    const [insights, setInsights] = useState(null);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [totpCode, setTotpCode] = useState('');
    const [twoFactorLoading, setTwoFactorLoading] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmDeleteText, setConfirmDeleteText] = useState('');
    const [copied, setCopied] = useState(false);
    const [recoveryCodeCount, setRecoveryCodeCount] = useState(0);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [generatingRecovery, setGeneratingRecovery] = useState(false);

    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                full_name: user.full_name || '',
                bio: user.bio || '',
                show_wins: user.show_wins ?? true,
                show_trophies: user.show_trophies ?? true,
                payout_method: user.payout_method || 'stripe',
                notif_new_follower: user.notif_new_follower ?? true,
                notif_challenge_win: user.notif_challenge_win ?? true,
                notif_comments: user.notif_comments ?? true,
                notif_likes: user.notif_likes ?? false,
                email_weekly: user.email_weekly ?? true,
                email_challenges: user.email_challenges ?? true,
                email_payouts: user.email_payouts ?? true,
                email_marketing: user.email_marketing ?? false,
                two_factor_enabled: user.two_factor_enabled ?? false,
                interests: user.interests || '',
                goals: user.goals || '',
                referral_source: user.referral_source || ''
            });
            setAvatarPreview(user.profile_pic);
        }
    }, [user]);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/users/me/insights`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInsights(res.data);
            } catch (err) {
                console.error("Failed to fetch insights", err);
            }
        };
        if (token) fetchInsights();
    }, [token]);

    useEffect(() => {
        const fetchSessions = async () => {
            setSessionsLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/users/me/sessions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSessions(res.data);
            } catch (err) {
                console.error("Failed to fetch sessions", err);
            } finally {
                setSessionsLoading(false);
            }
        };
        if (token && activeTab === 'security') fetchSessions();
    }, [token, activeTab]);

    useEffect(() => {
        const fetchRecoveryStatus = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/users/me/2fa/recovery-codes-status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRecoveryCodeCount(res.data.count);
            } catch (err) {
                console.error("Failed to fetch recovery status", err);
            }
        };
        if (token && activeTab === 'security') fetchRecoveryStatus();
    }, [token, activeTab]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setHasChanges(true);
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarPreview(URL.createObjectURL(file));
        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploadingAvatar(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/users/upload-avatar`, uploadData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setUser(prev => ({ ...prev, profile_pic: res.data.profile_pic }));
            showNotification('success', 'Avatar updated successfully');
        } catch (err) {
            showNotification('error', 'Failed to upload avatar');
            setAvatarPreview(user.profile_pic);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await axios.put(`${API_BASE_URL}/users/me`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { user: updatedUser, access_token } = res.data;
            if (access_token) updateAuthToken(access_token);
            setUser(updatedUser);
            setHasChanges(false);
            showNotification('success', 'All changes saved successfully');
        } catch (err) {
            showNotification('error', err.response?.data?.detail || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            showNotification('error', 'New passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/users/me/password`, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('success', 'Password updated successfully');
            setShowPasswordModal(false);
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            showNotification('error', err.response?.data?.detail || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleSetup2FA = async () => {
        setTwoFactorLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/users/me/2fa/setup`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrCodeData(res.data);
            setShow2FAModal(true);
        } catch (err) {
            showNotification('error', 'Failed to initialize 2FA setup');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (totpCode.length !== 6) return;
        setTwoFactorLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/users/me/2fa/verify`, { code: totpCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(prev => ({ ...prev, two_factor_enabled: true }));
            setFormData(prev => ({ ...prev, two_factor_enabled: true }));
            showNotification('success', 'Shield Active: TOTP 2FA enabled');
            setShow2FAModal(false);
        } catch (err) {
            showNotification('error', 'Invalid verification code');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setTwoFactorLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/users/me/2fa/disable`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(prev => ({ ...prev, two_factor_enabled: false }));
            setFormData(prev => ({ ...prev, two_factor_enabled: false }));
            showNotification('info', '2FA has been disabled');
        } catch (err) {
            showNotification('error', 'Failed to disable 2FA');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await axios.delete(`${API_BASE_URL}/users/me/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            showNotification('success', 'Session revoked successfully');
        } catch (err) {
            showNotification('error', 'Failed to revoke session');
        }
    };

    const handleDeactivateAccount = async () => {
        try {
            await axios.post(`${API_BASE_URL}/users/me/deactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('info', 'Account deactivated. Logging out...');
            setTimeout(() => window.location.href = '/', 2000);
        } catch (err) {
            showNotification('error', 'Deactivation failed');
        }
    };

    const handleCopyKey = () => {
        if (!qrCodeData?.secret) return;
        navigator.clipboard.writeText(qrCodeData.secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showNotification('success', 'Secret key copied to clipboard');
    };

    const handleDeleteAccount = async () => {
        if (confirmDeleteText !== 'DELETE') return;
        try {
            await axios.delete(`${API_BASE_URL}/users/me/delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('error', 'Account deleted forever. Goodbye.');
            setTimeout(() => window.location.href = '/', 2000);
        } catch (err) {
            showNotification('error', 'Deletion failed');
        }
    };

    const handleGenerateRecoveryCodes = async () => {
        setGeneratingRecovery(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/users/me/2fa/recovery-codes`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecoveryCodes(res.data);
            setRecoveryCodeCount(10);
            setShowRecoveryModal(true);
            showNotification('success', 'New recovery codes generated');
        } catch (err) {
            showNotification('error', 'Failed to generate recovery codes');
        } finally {
            setGeneratingRecovery(false);
        }
    };

    const downloadRecoveryCodes = () => {
        const content = `MONTAGE RECOVERY CODES\n\nStore these codes in a safe place. Each code is one-time use.\n\n${recoveryCodes.join('\n')}\n\nGenerated on: ${new Date().toLocaleString()}`;
        const element = document.createElement('a');
        const file = new Blob([content], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = 'montage-recovery-codes.txt';
        document.body.appendChild(element);
        element.click();
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <div 
            className={`settings-sidebar-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => {
                setActiveTab(id);
                // Update URL for bookmarkability
                const newUrl = `${window.location.pathname}?tab=${id}`;
                window.history.replaceState({ ...window.history.state, path: newUrl }, '', newUrl);
            }}
        >
            <Icon size={20} />
            <span>{label}</span>
        </div>
    );

    const ToggleSwitch = ({ name, label, checked, onChange }) => (
        <div className="toggle-wrapper">
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
            <label className="toggle-switch">
                <input 
                    type="checkbox" 
                    name={name} 
                    checked={checked} 
                    onChange={onChange} 
                />
                <span className="toggle-slider"></span>
            </label>
        </div>
    );

    return (
        <div className="settings-wrapper">
            {/* Sidebar Navigation */}
            <aside className="settings-sidebar">
                <h2 style={{ padding: '0 1.6rem 1.5rem', fontSize: '1.8rem', fontWeight: 900 }}>Settings</h2>
                <SidebarItem id="profile" icon={User} label="Profile" />
                <SidebarItem id="account" icon={AccountIcon} label="Account" />
                <SidebarItem id="challenges" icon={Award} label="Challenges & Trophies" />
                <SidebarItem id="payments" icon={CreditCard} label="Payments" />
                <SidebarItem id="notifications" icon={Bell} label="Notifications" />
                <SidebarItem id="security" icon={Shield} label="Security" />
            </aside>

            {/* Content Area */}
            <main className="settings-content">
                
                {/* Profile Section */}
                {activeTab === 'profile' && (
                    <section className="settings-card glass">
                        <div className="settings-card-title">
                            <User size={24} color="var(--accent-primary)" />
                            Profile Details
                        </div>
                        
                        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', marginBottom: '3rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ 
                                    width: '120px', height: '120px', borderRadius: '50%', 
                                    border: '3px solid var(--accent-primary)', padding: '4px',
                                    background: 'var(--bg-deep)'
                                }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#222' }}>
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800 }}>
                                                {formData.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <label htmlFor="avatar-sub" style={{ 
                                    position: 'absolute', bottom: '0', right: '0', 
                                    background: 'var(--accent-primary)', padding: '8px', borderRadius: '50%',
                                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Camera size={16} color="white" />
                                    <input type="file" id="avatar-sub" hidden onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.4rem' }}>{formData.full_name || 'Your Name'}</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Update your profile picture and public bio</p>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</label>
                            <input 
                                className="glass"
                                style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white' }} 
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleFormChange}
                                placeholder="Display name"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Username</label>
                            <input 
                                className="glass"
                                style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white' }} 
                                name="username"
                                value={formData.username}
                                onChange={handleFormChange}
                                placeholder="Unique handle"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Public Bio</label>
                            <textarea 
                                className="glass"
                                style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white', resize: 'none' }} 
                                name="bio"
                                value={formData.bio}
                                onChange={handleFormChange}
                                rows="3"
                                placeholder="Briefly describe your style..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Interests (Comma separated)</label>
                                <input 
                                    className="glass"
                                    style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white' }} 
                                    name="interests"
                                    value={formData.interests}
                                    onChange={handleFormChange}
                                    placeholder="e.g. AMV, Velocity, VFX"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Primary Goal</label>
                                <select 
                                    className="glass"
                                    style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white', appearance: 'none' }} 
                                    name="goals"
                                    value={formData.goals}
                                    onChange={handleFormChange}
                                >
                                    <option value="">Select a goal</option>
                                    <option value="Find inspiration for my next edit">Find inspiration</option>
                                    <option value="Share my creations with the world">Share creations</option>
                                    <option value="Learn new VFX & Editing techniques">Learn techniques</option>
                                    <option value="Discover the best editors">Discover editors</option>
                                    <option value="Build a cinematic portfolio">Build portfolio</option>
                                </select>
                            </div>
                        </div>
                    </section>
                )}

                {/* Challenges & Trophies Section */}
                {activeTab === 'challenges' && (
                    <section className="settings-card glass">
                        <div className="settings-card-title">
                            <Award size={24} color="var(--accent-primary)" />
                            Challenges & Trophies
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage how your achievements are displayed on your public profile.</p>
                        
                        <ToggleSwitch 
                            name="show_wins" 
                            label="Show Challenge Wins" 
                            checked={formData.show_wins} 
                            onChange={handleFormChange} 
                        />
                        <div style={{ padding: '0.5rem 0', opacity: 0.1, borderBottom: '1px solid white', marginBottom: '0.5rem' }}></div>
                        <ToggleSwitch 
                            name="show_trophies" 
                            label="Display Trophy Room Tab" 
                            checked={formData.show_trophies} 
                            onChange={handleFormChange} 
                        />
                    </section>
                )}

                {/* Payments Section */}
                {activeTab === 'payments' && (
                    <section className="settings-card glass">
                        <div className="settings-card-title">
                            <CreditCard size={24} color="var(--accent-primary)" />
                            Payment & Payouts
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Connect your accounts to receive your challenge prizes in **₦ (Naira)**.</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#635BFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>S</div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>Stripe Account</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Connected via montage_editor_payouts</div>
                                    </div>
                                </div>
                                <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>Manage</button>
                            </div>

                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#003087', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>P</div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>PayPal</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not connected</div>
                                    </div>
                                </div>
                                <button style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Link</button>
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Globe size={18} color="var(--accent-primary)" />
                                Preferred Currency
                            </h4>
                            <select 
                                className="glass"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', padding: '1.2rem', borderRadius: '14px', color: 'white', appearance: 'none' }}
                                disabled
                            >
                                <option>NGN - Nigerian Naira (₦)</option>
                            </select>
                        </div>
                    </section>
                )}

                {/* Account Section - Premium Triple Box Architecture */}
                {activeTab === 'account' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Winnings & Payouts - THE PREMIUM BOX */}
                        <section className="settings-group-box premium glass">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                        <Award size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                        Winnings & Payouts {user?.is_premium && <span className="user-badge-mini" style={{ marginLeft: '1rem', verticalAlign: 'middle' }}>PREMIUM</span>}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your challenge earnings and payout methods</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Current Balance</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>
                                        ${insights ? insights.total_earnings.toFixed(2) : '0.00'} <span style={{ fontSize: '1rem', opacity: 0.5 }}>USD</span>
                                    </div>
                                </div>
                            </div>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Upload Quotas & Usage</div>
                                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{user?.home_uploads || 0}</span> / {user?.home_quota_limit} Home Videos
                                        </div>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <span style={{ color: '#f59e0b', fontWeight: 800 }}>{user?.flash_uploads || 0}</span> / {user?.flash_quota_limit} Flash Clips
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal" onClick={() => navigate('/manage')}>View All</button>
                                </div>
                            </div>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Linked Payout Method</div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        {/* Minimalist Branded Icons */}
                                        <div 
                                            onClick={() => { setFormData({...formData, payout_method: 'stripe'}); setHasChanges(true); }}
                                            style={{ 
                                                background: formData.payout_method === 'stripe' ? 'rgba(99, 91, 255, 0.15)' : 'rgba(255,255,255,0.05)', 
                                                padding: '0.4rem 0.8rem', borderRadius: '8px', 
                                                border: formData.payout_method === 'stripe' ? '1px solid #635BFF' : '1px solid var(--border-subtle)', 
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{ width: '20px', height: '20px', background: '#635BFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>S</div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: formData.payout_method === 'stripe' ? 'white' : 'var(--text-muted)' }}>Stripe</span>
                                        </div>
                                        <div 
                                            onClick={() => { setFormData({...formData, payout_method: 'paypal'}); setHasChanges(true); }}
                                            style={{ 
                                                background: formData.payout_method === 'paypal' ? 'rgba(0, 48, 135, 0.15)' : 'rgba(255,255,255,0.03)', 
                                                padding: '0.4rem 0.8rem', borderRadius: '8px', 
                                                border: formData.payout_method === 'paypal' ? '1px solid #003087' : '1px solid var(--border-subtle)', 
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <div style={{ width: '20px', height: '20px', background: '#003087', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>P</div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: formData.payout_method === 'paypal' ? 'white' : 'var(--text-muted)' }}>PayPal</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal">Manage</button>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <button 
                                    className="save-btn" 
                                    style={{ width: '100%', padding: '1.4rem', fontSize: '1.1rem', background: 'var(--accent-primary)', boxShadow: '0 10px 30px rgba(255, 59, 48, 0.2)' }}
                                    onClick={() => showNotification('success', 'Withdrawal initiated successfully')}
                                >
                                    Withdraw Funds
                                </button>
                            </div>
                        </section>

                        {/* Data Management Box */}
                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Globe size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Data Management
                            </h3>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Language Preferences</div>
                                    <div className="setting-tile-desc">English (US) - Global Standard</div>
                                </div>
                                <div className="setting-tile-action">
                                    <ChevronRight size={20} color="var(--text-muted)" />
                                </div>
                            </div>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Download My Data</div>
                                    <div className="setting-tile-desc">Get a copy of your personal archives</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal">Request</button>
                                </div>
                            </div>

                        </section>

                    </div>
                )}

                {/* Notifications Section */}
                {activeTab === 'notifications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Bell size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Push Notifications
                            </h3>
                            <ToggleSwitch name="notif_new_follower" label="New Follower" checked={formData.notif_new_follower} onChange={handleFormChange} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="notif_challenge_win" label="Challenge Win Announcement" checked={formData.notif_challenge_win} onChange={handleFormChange} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="notif_comments" label="Comments on my Videos" checked={formData.notif_comments} onChange={handleFormChange} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="notif_likes" label="Likes & Reactions" checked={formData.notif_likes} onChange={handleFormChange} />
                        </section>

                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Globe size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Email Digests
                            </h3>
                            <ToggleSwitch name="email_weekly" label="Weekly Creator Report" checked={formData.email_weekly} onChange={handleFormChange} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="email_challenges" label="New Challenge Alerts" checked={formData.email_challenges} onChange={handleFormChange} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="email_payouts" label="Payout Confirmations" checked={formData.email_payouts} onChange={handleFormChange} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="email_marketing" label="Product Updates & Tips" checked={formData.email_marketing} onChange={handleFormChange} />
                        </section>
                    </div>
                )}

                {/* Security Section */}
                {activeTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Shield size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Login & Access
                            </h3>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Google Account</div>
                                    <div className="setting-tile-desc">{user?.google_id ? 'Connected' : 'Not linked'}</div>
                                </div>
                                <div className="setting-tile-action">
                                    {user?.google_id ? (
                                        <span style={{ fontSize: '0.85rem', color: '#00C853', fontWeight: 600 }}>Linked</span>
                                    ) : (
                                        <button className="tile-btn-minimal" onClick={() => showNotification('info', 'Google link coming soon')}>Connect</button>
                                    )}
                                </div>
                            </div>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Email Address</div>
                                    <div className="setting-tile-desc">{user?.email || 'Not set'}</div>
                                </div>
                                <div className="setting-tile-action">
                                    <span style={{ fontSize: '0.85rem', color: '#00C853', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Check size={14} /> Verified
                                    </span>
                                </div>
                            </div>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Password</div>
                                    <div className="setting-tile-desc">Last changed 30+ days ago</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal" onClick={() => setShowPasswordModal(true)}>Update</button>
                                </div>
                            </div>

                            <div className="setting-tile" style={{ border: 'none' }}>
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Active Sessions</div>
                                    <div className="setting-tile-desc">You have {sessions.length} active login sessions</div>
                                </div>
                            </div>

                            {sessions.length > 0 && (
                                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                                    {sessions.map(s => (
                                        <div key={s.id} className="glass" style={{ 
                                            padding: '1.2rem', borderRadius: '12px', marginBottom: '1rem', 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            border: '1px solid var(--border-glass)',
                                            background: 'rgba(255,255,255,0.02)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.device_info}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {s.ip_address} • Last active {new Date(s.last_active).toLocaleString()}
                                                </div>
                                            </div>
                                            <button 
                                                className="tile-btn-minimal" 
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                                onClick={() => handleRevokeSession(s.id)}
                                            >Revoke</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Shield size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Two-Factor Authentication
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Protect your account by requiring a second verification step when signing in.</p>

                            <div className="setting-tile" style={{ border: 'none' }}>
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Authenticator App (TOTP)</div>
                                    <div className="setting-tile-desc">{user?.two_factor_enabled ? 'Shield Active' : 'Extra layer of security'}</div>
                                </div>
                                <div className="setting-tile-action">
                                    {user?.two_factor_enabled ? (
                                        <button className="tile-btn-minimal" onClick={handleDisable2FA} disabled={twoFactorLoading}>Disable</button>
                                    ) : (
                                        <button 
                                            className="save-btn" 
                                            style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} 
                                            onClick={handleSetup2FA}
                                            disabled={twoFactorLoading}
                                        >
                                            {twoFactorLoading ? '...' : 'Enable 2FA'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="setting-tile" style={{ border: 'top 1px solid var(--border-glass)', marginTop: '0.5rem', paddingTop: '1rem' }}>
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Backup Recovery Codes</div>
                                    <div className="setting-tile-desc">{recoveryCodeCount > 0 ? `${recoveryCodeCount} codes remaining` : 'No backup codes generated'}</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button 
                                        className="tile-btn-minimal" 
                                        onClick={handleGenerateRecoveryCodes} 
                                        disabled={generatingRecovery}
                                    >
                                        {recoveryCodeCount > 0 ? 'Regenerate' : 'Generate'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="settings-group-box glass" style={{ borderColor: 'rgba(255,68,68,0.2)', background: 'rgba(20,5,5,0.4)' }}>
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#ff4444' }}>
                                <AlertCircle size={20} color="#ff4444" style={{ marginRight: '0.8rem' }} />
                                Danger Zone
                            </h3>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Deactivate Account</div>
                                    <div className="setting-tile-desc">Temporarily hide your profile and videos</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button
                                        className="tile-btn-minimal"
                                        style={{ borderColor: 'rgba(255,68,68,0.4)', color: '#ff8888' }}
                                        onClick={() => setShowDeactivateModal(true)}
                                    >Deactivate</button>
                                </div>
                            </div>

                            <div className="setting-tile" style={{ border: 'none' }}>
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Delete Account Permanently</div>
                                    <div className="setting-tile-desc">This action cannot be undone</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button
                                        className="tile-btn-minimal"
                                        style={{ borderColor: 'rgba(255,68,68,0.6)', color: '#ff4444', background: 'rgba(255,68,68,0.08)' }}
                                        onClick={() => setShowDeleteModal(true)}
                                    >Delete</button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* Floating Save Action Bar */}
            {hasChanges && (
                <div className="floating-save-bar glass">
                    <div>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <AlertCircle size={18} color="var(--accent-primary)" />
                            Unsaved Changes
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You have pending changes in your {activeTab} settings.</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => { setHasChanges(false); window.location.reload(); }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Discard
                        </button>
                        <button className="save-btn" onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Update Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        
                        <form onSubmit={handlePasswordSave}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)' }}>Current Password</label>
                                <input 
                                    type="password"
                                    className="glass"
                                    style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white' }} 
                                    name="current_password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)' }}>New Password</label>
                                <input 
                                    type="password"
                                    className="glass"
                                    style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white' }} 
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)' }}>Confirm New Password</label>
                                <input 
                                    type="password"
                                    className="glass"
                                    style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white' }} 
                                    name="confirm_password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="save-btn" 
                                style={{ width: '100%', padding: '1.4rem' }}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* 2FA Setup Modal */}
            {show2FAModal && (
                <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 900 }}>Setup Authenticator</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                            Scan this QR code with Google Authenticator or Authy to enable 2-Factor Authentication.
                        </p>
                        
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '18px', display: 'inline-block', marginBottom: '2rem' }}>
                            <img src={qrCodeData?.qr_code} alt="2FA QR Code" style={{ width: '180px', height: '180px' }} />
                        </div>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>Can't scan? Enter this code manually:</p>
                            <div className="glass" style={{ 
                                padding: '0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', 
                                border: '1px solid var(--border-glass)', fontSize: '1.2rem', fontWeight: 800, 
                                letterSpacing: '2px', color: 'var(--accent-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'
                            }}>
                                {qrCodeData?.secret}
                                <button 
                                    onClick={handleCopyKey}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.05)', border: 'none', padding: '6px', 
                                        borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' 
                                    }}
                                >
                                    {copied ? <Check size={16} color="#00C853" /> : <Copy size={16} color="white" />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter 6-digit Code</label>
                            <input 
                                className="glass"
                                style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white', letterSpacing: '4px', fontSize: '1.4rem', textAlign: 'center' }} 
                                maxLength={6}
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                placeholder="000 000"
                            />
                        </div>

                        <button 
                            className="save-btn" 
                            style={{ width: '100%', padding: '1.4rem' }}
                            onClick={handleVerify2FA}
                            disabled={twoFactorLoading || totpCode.length !== 6}
                        >
                            {twoFactorLoading ? 'Verifying...' : 'Enable 2FA'}
                        </button>
                    </div>
                </div>
            )}

            {/* Deactivation Modal */}
            {showDeactivateModal && (
                <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <AlertCircle size={48} color="#ff8888" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 900 }}>Deactivate Account?</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                            This will temporarily hide your profile and videos. You can reactivate at any time by logging back in.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                className="tile-btn-minimal" 
                                style={{ flex: 1, padding: '1.2rem' }}
                                onClick={() => setShowDeactivateModal(false)}
                            >Cancel</button>
                            <button 
                                className="save-btn" 
                                style={{ flex: 1, padding: '1.2rem', background: '#ff8888' }}
                                onClick={handleDeactivateAccount}
                            >Deactivate</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deletion Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <AlertCircle size={48} color="#ff4444" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 900 }}>Permanent Deletion</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                            This action is irreversible. All your videos, followers, and earnings will be purged.
                        </p>
                        
                        <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ff4444', fontSize: '0.8rem', fontWeight: 700 }}>TYPE "DELETE" TO CONFIRM</label>
                            <input 
                                className="glass"
                                style={{ width: '100%', border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.05)', padding: '1.2rem', borderRadius: '14px', color: 'white', textAlign: 'center' }} 
                                value={confirmDeleteText}
                                onChange={(e) => setConfirmDeleteText(e.target.value.toUpperCase())}
                                placeholder="DELETE"
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                className="tile-btn-minimal" 
                                style={{ flex: 1, padding: '1.2rem' }}
                                onClick={() => setShowDeleteModal(false)}
                            >Cancel</button>
                            <button 
                                className="save-btn" 
                                style={{ flex: 1, padding: '1.2rem', background: '#ff4444' }}
                                onClick={handleDeleteAccount}
                                disabled={confirmDeleteText !== 'DELETE'}
                            >Delete Forever</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recovery Codes Modal */}
            {showRecoveryModal && (
                <div className="modal-overlay" onClick={() => setShowRecoveryModal(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Shield size={30} color="white" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Your Recovery Codes</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                These codes can be used to access your account if you lose your 2FA device. Store them securely.
                            </p>
                        </div>
                        
                        <div style={{ 
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', 
                            background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '18px',
                            border: '1px solid var(--border-glass)', marginBottom: '2rem'
                        }}>
                            {recoveryCodes.map((code, idx) => (
                                <div key={idx} style={{ 
                                    fontFamily: 'monospace', fontSize: '1.1rem', color: 'white', 
                                    letterSpacing: '1px', fontWeight: 600, textAlign: 'center' 
                                }}>
                                    {code}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                                className="tile-btn-minimal" 
                                style={{ flex: 1, padding: '1.2rem' }}
                                onClick={downloadRecoveryCodes}
                            >
                                <Save size={18} style={{ marginRight: '0.6rem' }} /> Download .txt
                            </button>
                            <button 
                                className="save-btn" 
                                style={{ flex: 1, padding: '1.2rem' }}
                                onClick={() => setShowRecoveryModal(false)}
                            >
                                I've saved them
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Settings;
