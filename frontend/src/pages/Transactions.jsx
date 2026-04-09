import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, ChevronRight, Download, Calendar, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCreatorWallet } from '../api';
import './Monetization.css';

const TX_DOT   = { view_milestone: 'tx-dot-view', tip: 'tx-dot-tip', deposit: 'tx-dot-deposit', tip_sent: 'tx-dot-view', tip_received: 'tx-dot-tip' };
const TX_LABEL = { view_milestone: 'Ad Revenue', tip: 'Direct Tip', deposit: 'Wallet Top-up', tip_sent: 'Tip Sent', tip_received: 'Tip Received' };

const Transactions = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      if (!token) return;
      try {
        const walletData = await getCreatorWallet(token);
        if (walletData && walletData.transactions) {
          setTransactions(walletData.transactions);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [token]);

  return (
    <div className="monetization-container" style={{ paddingBottom: '40px' }}>
      <div className="mon-header-area">
        <button className="mon-back-btn" onClick={() => navigate('/monetization')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="mon-title-wrap">
          <h1 className="mon-title">Transaction History</h1>
          <p className="mon-subtitle">A complete record of your earnings, tips, and top-ups.</p>
        </div>
      </div>

      <div className="mon-panel">
        <div className="mon-panel-heading" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="icon-badge"><CreditCard size={18} /></div>
            All Transactions
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="mon-view-all" style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}><Filter size={14} /> Filter</button>
            <button className="mon-view-all" style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}><Download size={14} /> Export</button>
          </div>
        </div>
        
        {loading ? (
          <div className="mon-empty">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="mon-empty">No transactions yet.</div>
        ) : (
          <div className="mon-tx-list" style={{ marginTop: '1rem' }}>
            {transactions.map((tx, idx) => (
              <div className="mon-tx-row" key={idx} style={{ padding: '1.25rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div className="mon-tx-left">
                  <div className={`mon-tx-dot ${TX_DOT[tx.transaction_type] ?? 'tx-dot-view'}`} />
                  <div className="mon-tx-info">
                    <div className="mon-tx-type" style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{TX_LABEL[tx.transaction_type] ?? tx.transaction_type}</div>
                    <div className="mon-tx-date" style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6 }}>
                      <Calendar size={12} />
                      {new Date(tx.created_at).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="mon-tx-amount" style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  {tx.transaction_type === 'tip_sent' ? '-' : '+'}₦{Number(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
