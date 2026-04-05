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
    ExternalLink
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
        payout_method: 'stripe'
    });

    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                full_name: user.full_name || '',
                bio: user.bio || '',
                show_wins: user.show_wins ?? true,
                show_trophies: user.show_trophies ?? true,
                payout_method: user.payout_method || 'stripe'
            });
            setAvatarPreview(user.profile_pic);
        }
    }, [user]);

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
            const res = await axios.put(`${API_BASE_URL}/users/me`, {
                username: formData.username,
                full_name: formData.full_name,
                bio: formData.bio,
                // These would be extra fields in a real app
                show_wins: formData.show_wins,
                show_trophies: formData.show_trophies
            }, {
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

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Public Bio</label>
                            <textarea 
                                className="glass"
                                style={{ width: '100%', border: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '14px', color: 'white', resize: 'none' }} 
                                name="bio"
                                value={formData.bio}
                                onChange={handleFormChange}
                                rows="4"
                                placeholder="Briefly describe your style..."
                            />
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
                                        Winnings & Payouts
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage your challenge earnings and payout methods</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Current Balance</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>$420.50 <span style={{ fontSize: '1rem', opacity: 0.5 }}>USD</span></div>
                                </div>
                            </div>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Linked Payout Method</div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        {/* Minimalist Branded Icons */}
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '20px', height: '20px', background: '#635BFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>S</div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Stripe</span>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
                                            <div style={{ width: '20px', height: '20px', background: '#003087', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>P</div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>PayPal</span>
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
                            <ToggleSwitch name="notif_new_follower" label="New Follower" checked={true} onChange={() => {}} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="notif_challenge_win" label="Challenge Win Announcement" checked={true} onChange={() => {}} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="notif_comments" label="Comments on my Videos" checked={true} onChange={() => {}} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="notif_likes" label="Likes & Reactions" checked={false} onChange={() => {}} />
                        </section>

                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Globe size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Email Digests
                            </h3>
                            <ToggleSwitch name="email_weekly" label="Weekly Creator Report" checked={true} onChange={() => {}} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="email_challenges" label="New Challenge Alerts" checked={true} onChange={() => {}} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="email_payouts" label="Payout Confirmations" checked={true} onChange={() => {}} />
                            <div style={{ padding: '0.5rem 0', opacity: 0.08, borderBottom: '1px solid white' }} />
                            <ToggleSwitch name="email_marketing" label="Product Updates & Tips" checked={false} onChange={() => {}} />
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
                                    <button className="tile-btn-minimal" onClick={() => showNotification('info', 'Password change coming soon')}>Update</button>
                                </div>
                            </div>

                            <div className="setting-tile" style={{ border: 'none' }}>
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Active Sessions</div>
                                    <div className="setting-tile-desc">Manage devices signed into your account</div>
                                </div>
                                <div className="setting-tile-action">
                                    <button className="tile-btn-minimal" onClick={() => showNotification('info', 'Session management coming soon')}>View</button>
                                </div>
                            </div>
                        </section>

                        <section className="settings-group-box glass">
                            <h3 className="settings-card-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                                <Shield size={20} color="var(--accent-primary)" style={{ marginRight: '0.8rem' }} />
                                Two-Factor Authentication
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Protect your account by requiring a second verification step when signing in.</p>

                            <div className="setting-tile">
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">Authenticator App (TOTP)</div>
                                    <div className="setting-tile-desc">Google Authenticator, Authy, etc.</div>
                                </div>
                                <div className="setting-tile-action">
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="setting-tile" style={{ border: 'none' }}>
                                <div className="setting-tile-label">
                                    <div className="setting-tile-title">SMS Verification</div>
                                    <div className="setting-tile-desc">Backup codes via text message</div>
                                </div>
                                <div className="setting-tile-action">
                                    <label className="toggle-switch">
                                        <input type="checkbox" />
                                        <span className="toggle-slider"></span>
                                    </label>
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
                                        onClick={() => showNotification('info', 'Account deactivation coming soon')}
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
                                        onClick={() => showNotification('error', 'Please contact support to delete your account')}
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
        </div>
    );
};

export default Settings;
