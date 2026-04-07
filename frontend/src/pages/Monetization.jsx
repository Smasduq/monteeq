import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet, TrendingUp, DollarSign, Sparkles, Crown,
  CreditCard, ChevronRight, Zap, BarChart2, Info,
  X, CheckCircle, Clock, AlertCircle, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCreatorWallet, requestPayout, getMyPayoutRequests } from '../api';
import { PageSkeleton } from '../components/Skeleton';
import './Monetization.css';

/* ------ Animated counter hook ------ */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef(null);
  const raf = useRef(null);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    startTime.current = null;
    const step = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const p = Math.min((timestamp - startTime.current) / duration, 1);
      setValue(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

const TX_DOT   = { view_milestone: 'tx-dot-view', tip: 'tx-dot-tip', subscription: 'tx-dot-sub' };
const TX_LABEL = { view_milestone: 'View Milestone', tip: 'Direct Tip', subscription: 'Subscription' };

const SPARKLINE = [
  { label: 'M', h: 35 }, { label: 'T', h: 55 }, { label: 'W', h: 45 },
  { label: 'T', h: 70 }, { label: 'F', h: 62 }, { label: 'S', h: 85 },
  { label: 'S', h: 99, current: true },
];

const STATUS_META = {
  pending:    { icon: <Clock size={14} />,        label: 'Pending',    cls: 'status-pending' },
  processing: { icon: <Zap size={14} />,          label: 'Processing', cls: 'status-processing' },
  completed:  { icon: <CheckCircle size={14} />,  label: 'Completed',  cls: 'status-completed' },
  rejected:   { icon: <AlertCircle size={14} />,  label: 'Rejected',   cls: 'status-rejected' },
};

/* ======== Payout Modal ======== */
const PayoutModal = ({ balance, token, onClose, onSuccess }) => {
  const [step, setStep]       = useState('form');   // 'form' | 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg]   = useState('');
  const [form, setForm]       = useState({ amount: '', bank: '', accountNumber: '', accountName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt < 1000) { setErrMsg('Minimum payout is ₦1,000'); return; }
    if (amt > balance)      { setErrMsg(`Cannot exceed your balance of ₦${balance.toLocaleString()}`); return; }
    if (!form.bank || !form.accountNumber || !form.accountName) {
      setErrMsg('Please fill in all bank details'); return;
    }
    setLoading(true);
    setErrMsg('');
    try {
      const res = await requestPayout(amt, {
        bank: form.bank, account_number: form.accountNumber, account_name: form.accountName
      }, token);
      if (res.detail) throw new Error(res.detail);
      setStep('success');
      onSuccess();
    } catch (err) {
      setErrMsg(err.message || 'Failed to submit payout request');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mon-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mon-modal">
        <button className="mon-modal-close" onClick={onClose}><X size={20} /></button>

        {step === 'form' && (
          <>
            <div className="mon-modal-header">
              <div className="mon-modal-icon"><CreditCard size={24} /></div>
              <h2>Request Payout</h2>
              <p>Available balance: <strong>₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong></p>
            </div>
            <form onSubmit={handleSubmit} className="mon-modal-form">
              <div className="mon-field">
                <label>Amount (₦)</label>
                <input
                  type="number"
                  min="1000"
                  max={balance}
                  step="1"
                  placeholder="Min ₦1,000"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="mon-field-group">
                <div className="mon-field">
                  <label>Bank Name</label>
                  <input placeholder="e.g. GTBank" value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} />
                </div>
                <div className="mon-field">
                  <label>Account Number</label>
                  <input placeholder="10-digit NUBAN" maxLength={10} value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
                </div>
              </div>
              <div className="mon-field">
                <label>Account Name</label>
                <input placeholder="Exact name on account" value={form.accountName} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} />
              </div>

              {errMsg && <div className="mon-modal-error"><AlertCircle size={15} /> {errMsg}</div>}

              <button type="submit" className="mon-modal-submit" disabled={loading}>
                {loading ? <span className="mon-spinner" /> : <><CreditCard size={16} /> Submit Request</>}
              </button>
              <p className="mon-modal-note">
                Payouts are typically processed within <strong>48 hours</strong>. You'll be notified once it's completed.
              </p>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="mon-modal-success">
            <div className="mon-success-ring">
              <CheckCircle size={48} />
            </div>
            <h2>Request Submitted!</h2>
            <p>Your payout request has been received. Our team will process it within <strong>48 hours</strong>. Please be patient — we'll notify you once it's done.</p>
            <button className="mon-modal-submit" onClick={onClose}>Got it, thanks!</button>
          </div>
        )}

        {step === 'error' && (
          <div className="mon-modal-success">
            <div className="mon-success-ring error">
              <AlertCircle size={48} />
            </div>
            <h2>Request Failed</h2>
            <p>{errMsg}</p>
            <button className="mon-modal-submit" onClick={() => setStep('form')}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============== Main Page ============== */
const Monetization = () => {
  const { token } = useAuth();
  const [wallet,      setWallet]      = useState(null);
  const [payouts,     setPayouts]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);

  const fetchData = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const [wData, pData] = await Promise.all([getCreatorWallet(token), getMyPayoutRequests(token)]);
      setWallet(wData);
      setPayouts(Array.isArray(pData) ? pData : []);
    } catch (err) {
      console.error('Monetization fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const balance   = wallet ? Number(wallet.balance) : 0;
  const adRevenue = balance * 0.70;
  const tips      = balance * 0.20;
  const subs      = balance * 0.10;
  const txList    = wallet?.transactions ?? [];

  const estimatedViews    = Math.round(balance / 99 * 1000);
  const viewsToNext       = 1000 - (estimatedViews % 1000);
  const milestoneProgress = Math.round(((estimatedViews % 1000) / 1000) * 100);

  const animBalance = useCountUp(balance);
  const animAds     = useCountUp(adRevenue);
  const animTips    = useCountUp(tips);
  const animSubs    = useCountUp(subs);

  const fmt = n => n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (!token)  return <div className="page-error glass">Please log in to view your Monetization Dashboard.</div>;
  if (loading) return <PageSkeleton />;

  return (
    <div className="monetization-page">

      {/* HEADER */}
      <div className="mon-header">
        <div className="mon-header-left">
          <h1 className="mon-title">
            <Wallet size={38} className="mon-title-icon" />
            Monetization
          </h1>
          <p className="mon-subtitle">Your creator earnings — real-time, precise, all in one place.</p>
        </div>
        <button className="mon-payout-btn" onClick={() => setShowModal(true)}>
          <CreditCard size={18} /> Request Payout
        </button>
      </div>

      {/* HERO BALANCE */}
      <div className="mon-hero-card">
        <div className="mon-hero-label"><Zap size={13} /> Total Wallet Balance</div>
        <div className="mon-balance"><span className="currency">₦</span>{fmt(animBalance)}</div>
        <p className="mon-hero-meta">NGN · Updated just now · Min payout: ₦1,000</p>
        <div className="mon-split-row">
          <div className="mon-split-card">
            <div className="mon-split-label"><div className="mon-split-icon icon-ads"><DollarSign size={16} /></div>Ad Revenue</div>
            <div className="mon-split-amount">₦{fmt(animAds)}</div>
          </div>
          <div className="mon-split-card">
            <div className="mon-split-label"><div className="mon-split-icon icon-tips"><Sparkles size={16} /></div>Direct Tips</div>
            <div className="mon-split-amount">₦{fmt(animTips)}</div>
          </div>
          <div className="mon-split-card">
            <div className="mon-split-label"><div className="mon-split-icon icon-subs"><Crown size={16} /></div>Subscriptions</div>
            <div className="mon-split-amount">₦{fmt(animSubs)}</div>
          </div>
        </div>
      </div>

      {/* SECONDARY GRID */}
      <div className="mon-grid">

        {/* Milestone */}
        <div className="mon-panel">
          <div className="mon-panel-heading"><div className="icon-badge"><TrendingUp size={18} /></div>Views Milestone</div>
          <div className="mon-milestone-info">
            <span style={{ color: 'var(--text-secondary)' }}>~{estimatedViews.toLocaleString()} views</span>
            <span className="mon-views-left">{viewsToNext.toLocaleString()} to next ₦99</span>
          </div>
          <div className="mon-track-bg">
            <div className="mon-track-fill" style={{ width: `${milestoneProgress}%` }} />
          </div>
          <p className="mon-milestone-caption">Progress to next payout ({milestoneProgress}%)</p>
          <div className="mon-rate-badge"><Zap size={14} /> ₦99.00 earned every 1,000 views</div>
        </div>

        {/* Sparkline */}
        <div className="mon-panel">
          <div className="mon-panel-heading"><div className="icon-badge"><BarChart2 size={18} /></div>Weekly Activity</div>
          <div className="mon-chart-area">
            {SPARKLINE.map((bar, i) => (
              <div key={i} className="mon-bar-wrap">
                <div className={`mon-bar${bar.current ? ' current' : ''}`} style={{ height: `${bar.h}%`, animationDelay: `${0.4 + i * 0.07}s` }} />
                <span className="mon-bar-label">{bar.label}</span>
              </div>
            ))}
          </div>
          <div className="mon-chart-caption">Relative earnings activity — last 7 days</div>
        </div>

        {/* Transaction History */}
        <div className="mon-panel">
          <div className="mon-panel-heading"><div className="icon-badge"><CreditCard size={18} /></div>Recent Transactions</div>
          {txList.length === 0 ? (
            <div className="mon-empty">No transactions yet. Upload a video to start earning!</div>
          ) : (
            <div className="mon-tx-list">
              {txList.slice(0, 4).map((tx, idx) => (
                <div className="mon-tx-row" key={idx}>
                  <div className="mon-tx-left">
                    <div className={`mon-tx-dot ${TX_DOT[tx.transaction_type] ?? 'tx-dot-view'}`} />
                    <div className="mon-tx-info">
                      <div className="mon-tx-type">{TX_LABEL[tx.transaction_type] ?? tx.transaction_type}</div>
                      <div className="mon-tx-date">{new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  </div>
                  <div className="mon-tx-amount">+₦{Number(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</div>
                </div>
              ))}
            </div>
          )}
          <button className="mon-view-all">View All Transactions <ChevronRight size={16} /></button>
        </div>

        {/* How You Earn */}
        <div className="mon-panel">
          <div className="mon-panel-heading"><div className="icon-badge"><Info size={18} /></div>How You Earn</div>
          <div className="mon-info-row">
            <div className="mon-info-icon"><DollarSign size={18} color="#ff3b30" /></div>
            <div className="mon-info-text">
              <strong>View Milestones</strong>
              <span>Earn ₦99 automatically every 1,000 views. No action needed.</span>
            </div>
          </div>
          <div className="mon-info-row">
            <div className="mon-info-icon"><Sparkles size={18} color="#4ade80" /></div>
            <div className="mon-info-text">
              <strong>Direct Tips</strong>
              <span>Viewers can tip you ₦500, ₦1,000, or ₦5,000 from your video page.</span>
            </div>
          </div>
          <div className="mon-info-row">
            <div className="mon-info-icon"><Crown size={18} color="#a855f7" /></div>
            <div className="mon-info-text">
              <strong>Subscriptions</strong>
              <span>Earn ₦5,000/month per subscriber for exclusive content access.</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAYOUT HISTORY */}
      {payouts.length > 0 && (
        <div className="mon-full-panel">
          <div className="mon-panel-heading">
            <div className="icon-badge"><Building2 size={18} /></div>
            Payout History
          </div>
          <div className="mon-payout-table-wrap">
            <table className="mon-payout-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Status</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => {
                  const meta = STATUS_META[p.status] ?? STATUS_META.pending;
                  let bankInfo = {};
                  try { bankInfo = JSON.parse(p.bank_details || '{}'); } catch {}
                  return (
                    <tr key={p.id}>
                      <td>{new Date(p.requested_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td><strong>₦{Number(p.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong></td>
                      <td>{bankInfo.bank || '—'} · {bankInfo.account_number || ''}</td>
                      <td>
                        <span className={`mon-status-badge ${meta.cls}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {p.status === 'pending' || p.status === 'processing'
                          ? '⏳ Allow up to 48 hours'
                          : (p.admin_note || '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYOUT MODAL */}
      {showModal && (
        <PayoutModal
          balance={balance}
          token={token}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default Monetization;
