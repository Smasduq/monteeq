import React, { useEffect, useState } from 'react';
import { getAdminChallenges, createChallenge, updateChallenge, deleteChallenge } from './api';
import { Trophy, ShieldCheck, LogOut, Search, Plus, Edit2, Trash2, Calendar, Award, Building, Play, Moon, Sun, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './context/NotificationContext';

const AdminChallenges = ({ token, setToken, theme, toggleTheme }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        brand: '',
        prize: '',
        is_open: true,
        start_date: '',
        end_date: ''
    });
    const [isDeleting, setIsDeleting] = useState(null);

    const navigate = useNavigate();
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchChallenges();
    }, [token]);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const data = await getAdminChallenges(token);
            setChallenges(data);
        } catch (err) {
            console.error("Failed to fetch challenges", err);
            showNotification('error', "Failed to load challenges");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('adminToken');
        navigate('/');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            brand: '',
            prize: '',
            is_open: true,
            start_date: '',
            end_date: ''
        });
        setEditingChallenge(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (challenge) => {
        setEditingChallenge(challenge);
        setFormData({
            title: challenge.title,
            description: challenge.description,
            brand: challenge.brand || '',
            prize: challenge.prize,
            is_open: challenge.is_open,
            start_date: challenge.start_date ? challenge.start_date.split('T')[0] : '',
            end_date: challenge.end_date ? challenge.end_date.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingChallenge) {
                await updateChallenge(editingChallenge.id, formData, token);
                showNotification('success', "Challenge updated successfully");
            } else {
                await createChallenge(formData, token);
                showNotification('success', "Challenge created successfully");
            }
            setShowModal(false);
            fetchChallenges();
        } catch (err) {
            console.error("Failed to save challenge", err);
            showNotification('error', "Failed to save challenge");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this challenge? This will remove all entries as well.")) return;
        try {
            await deleteChallenge(id, token);
            setChallenges(challenges.filter(c => c.id !== id));
            showNotification('success', "Challenge deleted successfully");
        } catch (err) {
            console.error("Failed to delete challenge", err);
            showNotification('error', "Failed to delete challenge");
        }
    };

    const filteredChallenges = challenges.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && challenges.length === 0) return (
      <div style={{ background: 'var(--bg-app)', height: '100vh', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={48} className="animate-pulse" color="var(--accent)" />
      </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)', transition: 'background-color 0.3s ease' }}>
            {/* Header */}
            <header style={{ 
                height: '72px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        <div style={{ background: 'var(--accent-soft)', padding: '8px', borderRadius: '12px' }}>
                            <ShieldCheck size={24} color="var(--accent)" />
                        </div>
                        <span className="jakarta" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                            Monteeq Admin
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '8px' }}>
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <nav style={{ display: 'flex', gap: '8px' }}>
                             <button onClick={() => navigate('/dashboard')} className="btn btn-ghost">
                                Dashboard
                            </button>
                             <button onClick={() => navigate('/approvals')} className="btn btn-ghost">
                                Review Queue
                            </button>
                             <button className="btn btn-primary" onClick={openCreateModal}>
                                <Plus size={18} /> New Challenge
                            </button>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px' }}>
                                <LogOut size={18} />
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="container" style={{ padding: '48px 0' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Challenges Hub</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage themed competitions and monitor participant engagement.</p>
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Filter challenges by title or brand..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '40px', width: '400px' }}
                            />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                         <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Challenge Info</th>
                                    <th>Brand</th>
                                    <th>Timeline</th>
                                    <th>Participation</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredChallenges.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ maxWidth: '300px' }}>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{c.title}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Award size={12} /> {c.prize}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                                <Building size={16} />
                                                <span style={{ fontWeight: 600 }}>{c.brand || 'Monteeq Original'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                                                    <Calendar size={14} /> 
                                                    <span>{new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{c.entry_count}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Submissions</span>
                                            </div>
                                        </td>
                                        <td>
                                             <span style={{ 
                                                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                                padding: '4px 10px', borderRadius: '6px',
                                                background: c.is_open ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                                color: c.is_open ? '#10b981' : '#6b7280'
                                            }}>
                                                {c.is_open ? 'Active' : 'Closed'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button className="btn btn-ghost" onClick={() => openEditModal(c)} style={{ padding: '8px' }}>
                                                    <Edit2 size={18} />
                                                </button>
                                                <button className="btn btn-ghost" onClick={() => handleDelete(c.id)} style={{ padding: '8px', color: '#ef4444' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal for Create/Edit */}
            {showModal && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '24px'
                }}>
                    <div style={{ 
                        background: 'var(--bg-surface)', width: '100%', maxWidth: '600px',
                        borderRadius: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-subtle)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingChallenge ? 'Edit Challenge' : 'Launch New Challenge'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Challenge Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="input-field" required placeholder="e.g. Cinematic Autumn" />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Short Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="input-field" style={{ minHeight: '80px', resize: 'vertical' }} required placeholder="What are the requirements?" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Partner Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="input-field" placeholder="Owner of the prize" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Prize Pool</label>
                                    <input type="text" name="prize" value={formData.prize} onChange={handleInputChange} className="input-field" required placeholder="e.g. $5,000 Cash" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Start Date</label>
                                    <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="input-field" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>End Date</label>
                                    <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="input-field" required />
                                </div>
                                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                    <input type="checkbox" id="is_open" name="is_open" checked={formData.is_open} onChange={handleInputChange} style={{ width: '18px', height: '18px' }} />
                                    <label htmlFor="is_open" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>This challenge is currently open for entries</label>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingChallenge ? 'Update Challenge' : 'Create Challenge'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminChallenges;
