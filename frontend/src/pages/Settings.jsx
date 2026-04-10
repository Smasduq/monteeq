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
    Key,
    Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';
import { API_BASE_URL } from '../api';
import DashboardBannerAd from '../components/ads/DashboardBannerAd';
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
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [recoveryCodeCount, setRecoveryCodeCount] = useState(0);
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
            showNotification('Avatar updated successfully', 'success');
        } catch (err) {
            showNotification('Failed to upload avatar', 'error');
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
            showNotification('All changes saved successfully', 'success');
        } catch (err) {
            showNotification(err.response?.data?.detail || 'Failed to update settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            showNotification('New passwords do not match', 'error');
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
            showNotification('Password updated successfully', 'success');
            setShowPasswordModal(false);
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            showNotification(err.response?.data?.detail || 'Failed to update password', 'error');
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
            showNotification('Failed to initialize 2FA setup', 'error');
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
            showNotification('Shield Active: TOTP 2FA enabled', 'success');
            setShow2FAModal(false);
        } catch (err) {
            showNotification('Invalid verification code', 'error');
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
            showNotification('2FA has been disabled', 'info');
        } catch (err) {
            showNotification('Failed to disable 2FA', 'error');
        } finally {
            setTwoFactorLoading(false);
        }
    };

    const handleGenerateRecoveryCodes = async () => {
        setGeneratingRecovery(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/users/me/2fa/recovery-codes`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecoveryCodes(res.data.codes);
            setRecoveryCodeCount(res.data.codes.length);
            setShowRecoveryModal(true);
            showNotification('Recovery codes generated', 'success');
        } catch (err) {
            showNotification('Failed to generate recovery codes', 'error');
        } finally {
            setGeneratingRecovery(false);
        }
    };

    const downloadRecoveryCodes = () => {
        const content = `MONTEEQ RECOVERY CODES\n\nStore these codes in a safe place. Each code is one-time use.\n\n${recoveryCodes.join('\n')}\n\nGenerated on: ${new Date().toLocaleString()}`;
        const element = document.createElement('a');
        const file = new Blob([content], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `monteeq-recovery-codes-${user.username}.txt`;
        document.body.appendChild(element);
        element.click();
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await axios.delete(`${API_BASE_URL}/users/me/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            showNotification('Session revoked successfully', 'success');
        } catch (err) {
            showNotification('Failed to revoke session', 'error');
        }
    };

    const handleDeactivateAccount = async () => {
        try {
            await axios.post(`${API_BASE_URL}/users/me/deactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Account deactivated. Logging out...', 'info');
            setTimeout(() => window.location.href = '/', 2000);
        } catch (err) {
            showNotification('Deactivation failed', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmDeleteText !== 'DELETE') return;
        try {
            await axios.delete(`${API_BASE_URL}/users/me/delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Account deleted forever. Goodbye.', 'error');
            setTimeout(() => window.location.href = '/', 2000);
        } catch (err) {
            showNotification('Deletion failed', 'error');
        }
    };

    const handleCopyKey = () => {
        if (!qrCodeData?.secret) return;
        navigator.clipboard.writeText(qrCodeData.secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showNotification('Secret key copied to clipboard', 'success');
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <div 
            className={`settings-sidebar-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => {
                setActiveTab(id);
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
            <aside className="settings-sidebar">
                <h2 style={{ padding: '0 1.6rem 1.5rem', fontSize: '1.8rem', fontWeight: 900 }}>Settings</h2>
                <SidebarItem id="profile" icon={User} label="Profile" />
                <SidebarItem id="account" icon={AccountIcon} label="Account" />
                <SidebarItem id="challenges" icon={Award} label="Challenges & Trophies" />
                <SidebarItem id="payments" icon={CreditCard} label="Payments" />
                <SidebarItem id="notifications" icon={Bell} label="Notifications" />
                <SidebarItem id="security" icon={Shield} label="Security" />
            </aside>

            <main className="settings-content">
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
                            <input className="glass" style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white' }} name="full_name" value={formData.full_name} onChange={handleFormChange} placeholder="Display name" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Username</label>
                            <input className="glass" style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white' }} name="username" value={formData.username} onChange={handleFormChange} placeholder="Unique handle" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Public Bio</label>
                            <textarea className="glass" style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white', resize: 'none' }} name="bio" value={formData.bio} onChange={handleFormChange} rows="3" placeholder="Briefly describe your style..." />
                        </div>
                    </section>
                )}

                {activeTab === 'account' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <section className="settings-group-box premium glass">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                        <Award size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                        Winnings & Payouts {user?.is_premium && <span className="user-badge-mini" style={{ marginLeft: '1rem' }}>PREMIUM</span>}
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
                                        <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{user?.home_uploads || 0}</span> / {user?.home_quota_limit} Home Videos</div>
                                        <div style={{ fontSize: '0.85rem' }}><span style={{ color: '#f59e0b', fontWeight: 800 }}>{user?.flash_uploads || 0}</span> / {user?.flash_quota_limit} Flash Clips</div>
                                    </div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal" onClick={() => navigate('/manage')}>View All</button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Shield size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Login & Access
                            </h3>
                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Password</div>
                                    <div className="setting-tile-desc">Maintain your account security</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal" onClick={() => setShowPasswordModal(true)}>Update</button>
                                </div>
                            </div>
                        </section>

                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Shield size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Two-Factor Authentication
                            </h3>
                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Authenticator App (TOTP)</div>
                                    <div className="setting-tile-desc">{user?.two_factor_enabled ? 'Shield Active' : 'Extra layer of security'}</div>
                                </div>
                                <div className="setting-tile-action">
                                    {user?.two_factor_enabled ? (
                                        <button className="tile-btn-minimal" onClick={handleDisable2FA} style={{ color: '#ff4444' }}>Disable</button>
                                    ) : (
                                        <button className="save-btn" onClick={handleSetup2FA} style={{ padding: '0.6rem 1.4rem' }}>Setup</button>
                                    )}
                                </div>
                            </div>

                            {user?.two_factor_enabled && (
                                <div className="setting-tile" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                    <div className="setting-tile-label">
                                        <div className="setting-tile-title">Backup Recovery Codes</div>
                                        <div className="setting-tile-desc">{recoveryCodeCount > 0 ? `${recoveryCodeCount} codes remaining` : 'No backup codes generated'}</div>
                                    </div>
                                    <div className="setting-tile-action">
                                        <button className="tile-btn-minimal" onClick={handleGenerateRecoveryCodes} disabled={generatingRecovery}>
                                            {generatingRecovery ? '...' : (recoveryCodeCount > 0 ? 'Regenerate' : 'Generate')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="settings-group-box glass danger-box" style={{ borderColor: 'rgba(255,68,68,0.2)', background: 'rgba(20,5,5,0.4)' }}>
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#ff4444' }}>
                                <AlertCircle size={20} color="#ff4444" style={{ marginRight: '0.8rem' }} />
                                Danger Zone
                            </h3>
                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Deactivate Account</div>
                                    <div className="setting-tile-desc">Temporarily hide your profile</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal" style={{ color: '#ff8888' }} onClick={() => setShowDeactivateModal(true)}>Deactivate</button>
                                </div>
                            </div>
                            <div className="setting-tile" style={{ border: 'none' }}>
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Delete Account</div>
                                    <div className="setting-tile-desc">Action is irreversible</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal" style={{ color: '#ff4444' }} onClick={() => setShowDeleteModal(true)}>Delete</button>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                <div style={{ marginTop: '3rem' }}>
                    <DashboardBannerAd 
                        title="Secure Your Channel"
                        subtitle="Enable 2FA and hardware keys for maximum legendary protection."
                        cta="UPGRADE SECURITY"
                        image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=60"
                    />
                </div>
            </main>

            {/* Modals */}
            {showPasswordModal && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
                        <h3>Update Password</h3>
                        <form onSubmit={handlePasswordSave} style={{ marginTop: '2rem' }}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Current Password</label>
                                <input type="password" className="glass" value={passwordData.current_password} onChange={e => setPasswordData({...passwordData, current_password: e.target.value})} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>New Password</label>
                                <input type="password" className="glass" value={passwordData.new_password} onChange={e => setPasswordData({...passwordData, new_password: e.target.value})} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label>Confirm New Password</label>
                                <input type="password" className="glass" value={passwordData.confirm_password} onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})} required />
                            </div>
                            <button 
                                type="submit" 
                                className="save-btn" 
                                style={{ width: '100%', padding: '1.4rem', opacity: passwordLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? (
                                    <><Loader2 className="animate-spin" size={20} /> Updating Password...</>
                                ) : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {show2FAModal && (
                <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
                    <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <h3>Setup Authenticator</h3>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '18px', display: 'inline-block', margin: '2rem 0' }}>
                            <img src={qrCodeData?.qr_code} alt="QR" style={{ width: '180px' }} />
                        </div>
                        <div className="glass" style={{ padding: '1rem', marginBottom: '2rem', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--accent-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                            {qrCodeData?.secret}
                            <Copy size={18} cursor="pointer" onClick={handleCopyKey} />
                        </div>
                        <input className="glass" style={{ width: '100%', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', marginBottom: '2rem' }} maxLength={6} placeholder="000000" value={totpCode} onChange={e => setTotpCode(e.target.value)} />
                        <button className="save-btn" style={{ width: '100%' }} onClick={handleVerify2FA} disabled={totpCode.length !== 6}>Enable 2FA</button>
                    </div>
                </div>
            )}

            {showDeactivateModal && (
                <div className="modal-overlay" onClick={() => setShowDeactivateModal(false)}>
                    <div className="modal-content glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <AlertCircle size={48} color="#ff8888" style={{ marginBottom: '1.5rem' }} />
                        <h3>Deactivate Account?</h3>
                        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>This will temporarily hide your profile and videos.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="tile-btn-minimal" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
                            <button className="save-btn" style={{ background: '#ff8888' }} onClick={handleDeactivateAccount}>Deactivate</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <AlertCircle size={48} color="#ff4444" style={{ marginBottom: '1.5rem' }} />
                        <h3>Permanent Deletion</h3>
                        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>Type \"DELETE\" to confirm. Action is irreversible.</p>
                        <input className="glass" style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }} placeholder="DELETE" value={confirmDeleteText} onChange={e => setConfirmDeleteText(e.target.value.toUpperCase())} />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="tile-btn-minimal" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="save-btn" style={{ background: '#ff4444' }} disabled={confirmDeleteText !== 'DELETE'} onClick={handleDeleteAccount}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            {showRecoveryModal && (
                <div className="modal-overlay" onClick={() => setShowRecoveryModal(false)}>
                    <div className="modal-content glass" style={{ maxWidth: '480px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <Key size={40} color="var(--accent-primary)" />
                            <h3 style={{ marginTop: '1rem' }}>Recovery Codes</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keep these in a safe place. One-time use each.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                            {recoveryCodes.map((code, idx) => (
                                <div key={idx} style={{ fontFamily: 'monospace', textAlign: 'center', color: 'white' }}>{code}</div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="tile-btn-minimal" style={{ flex: 1 }} onClick={downloadRecoveryCodes}>Download</button>
                            <button className="save-btn" style={{ flex: 1 }} onClick={() => setShowRecoveryModal(false)}>Done</button>
                        </div>
                    </div>
                </div>
            )}

            {hasChanges && (
                <div className="floating-save-bar glass">
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>Unsaved Changes</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You have pending adjustments.</div>
                    </div>
                    <button className="save-btn" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                </div>
            )}
        </div>
    );
};

export default Settings;
