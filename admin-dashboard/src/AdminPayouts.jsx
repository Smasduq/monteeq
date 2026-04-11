import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock, Zap, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

const STATUS_COLOR = {
  pending:    { bg: 'rgba(251,191,36,0.1)',  text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  processing: { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  completed:  { bg: 'rgba(16,185,129,0.1)',  text: '#10b981', border: 'rgba(16,185,129,0.25)' },
  rejected:   { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
};

const AdminPayouts = ({ token, theme }) => {
  const navigate  = useNavigate();
  const [payouts, setPayouts]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [filter,  setFilter]   = useState('all');
  const [action,  setAction]   = useState({}); // { [id]: { status, note, loading } }
  const [toast,   setToast]    = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await axios.get(`${API_URL}/monetization/admin/payouts${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayouts(data);
    } catch (err) {
      showToast('error', 'Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayouts(); }, [filter]);

  const handleUpdate = async (id, newStatus) => {
    const note = action[id]?.note || '';
    setAction(a => ({ ...a, [id]: { ...a[id], loading: true } }));
    try {
      await axios.put(
        `${API_URL}/monetization/admin/payouts/${id}?status=${newStatus}${note ? `&admin_note=${encodeURIComponent(note)}` : ''}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('success', `Payout marked as ${newStatus}`);
      fetchPayouts();
    } catch (err) {
      showToast('error', err?.response?.data?.detail || 'Failed to update payout');
    } finally {
      setAction(a => ({ ...a, [id]: { ...a[id], loading: false } }));
    }
  };

  const pending    = payouts.filter(p => p.status === 'pending').length;
  const processing = payouts.filter(p => p.status === 'processing').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.85rem 1.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{
        height: '72px', background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', padding: '0 2rem',
        gap: '1rem', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ padding: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <CreditCard size={22} color="var(--accent)" />
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Payout Requests</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {pending} pending · {processing} processing
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchPayouts} className="btn btn-ghost" style={{ padding: '8px' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        {/* Summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {['all','pending','processing','completed'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '1rem',
                borderRadius: '14px',
                border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: filter === s ? 'rgba(var(--accent-rgb, 255,59,48),0.08)' : 'var(--bg-surface)',
                color: filter === s ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {s === 'all' ? `All (${payouts.length})` : `${s} (${payouts.filter(p=>p.status===s).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
          ) : payouts.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No payout requests {filter !== 'all' ? `with status "${filter}"` : ''}.
            </div>
          ) : (
            <table className="modern-table" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '16%' }}>Creator</th>
                  <th style={{ width: '12%' }}>Amount</th>
                  <th style={{ width: '22%' }}>Bank Details</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ width: '14%' }}>Requested</th>
                  <th style={{ width: '26%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => {
                  let bank = {};
                  try { bank = JSON.parse(p.bank_details || '{}'); } catch {}
                  const cs = STATUS_COLOR[p.status] || STATUS_COLOR.pending;
                  const act = action[p.id] || {};

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{p.user?.username || `User #${p.user_id}`}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {p.user_id}</div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.05rem' }}>₦{Number(p.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{bank.bank || '—'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{bank.account_number || ''}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{bank.account_name || ''}</div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 700,
                          background: cs.bg, color: cs.text, border: `1px solid ${cs.border}`
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(p.requested_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td>
                        {p.status !== 'completed' && p.status !== 'rejected' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <input
                              placeholder="Admin note (optional)"
                              value={act.note || ''}
                              onChange={e => setAction(a => ({ ...a, [p.id]: { ...a[p.id], note: e.target.value } }))}
                              className="input-field"
                              style={{ fontSize: '0.78rem', padding: '4px 8px', height: '30px' }}
                            />
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              {p.status === 'pending' && (
                                <button
                                  className="btn btn-primary"
                                  style={{ height: '28px', fontSize: '0.72rem', flex: 1 }}
                                  disabled={act.loading}
                                  onClick={() => handleUpdate(p.id, 'processing')}
                                >
                                  <Zap size={12} /> Process
                                </button>
                              )}
                              <button
                                className="btn btn-primary"
                                style={{ height: '28px', fontSize: '0.72rem', flex: 1, background: '#10b981' }}
                                disabled={act.loading}
                                onClick={() => handleUpdate(p.id, 'completed')}
                              >
                                <CheckCircle size={12} /> Complete
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ height: '28px', fontSize: '0.72rem', borderColor: '#ef4444', color: '#ef4444' }}
                                disabled={act.loading}
                                onClick={() => handleUpdate(p.id, 'rejected')}
                              >
                                <XCircle size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                        {(p.status === 'completed' || p.status === 'rejected') && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {p.admin_note || `Marked ${p.status}`}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPayouts;
