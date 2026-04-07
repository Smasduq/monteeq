import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, DollarSign, Crown, TrendingUp, Send, CheckCircle, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { sendTip, getCreatorWallet } from '../api';

const MonetizationWidget = ({ video, isOwner }) => {
    const { token } = useAuth();
    const { showNotification } = useNotification();
    const [tipping, setTipping] = useState(false);
    const [tipAmount, setTipAmount] = useState(1000);
    const [tipSuccess, setTipSuccess] = useState(false);
    
    // Auto-calculate progress to next 1,000 views payout
    const views = video?.views || 0;
    const viewsToNextPayout = 1000 - (views % 1000);
    const progressPercentage = ((views % 1000) / 1000) * 100;
    
    // Wallet state for Creator
    const [wallet, setWallet] = useState({ balance: 0.0, currency: 'NGN' });

    useEffect(() => {
        if (isOwner && token) {
            const fetchWallet = async () => {
                try {
                    const data = await getCreatorWallet(token);
                    setWallet(data);
                } catch (err) {
                    console.error("Failed to fetch wallet:", err);
                }
            };
            fetchWallet();
        }
    }, [isOwner, token]);

    const handleTip = async () => {
        if (!token) {
            showNotification('info', "Please login to send tips.");
            return;
        }
        setTipping(true);
        try {
            await sendTip(video.owner_id || video.owner?.id, tipAmount, token);
            setTipping(false);
            setTipSuccess(true);
            showNotification('success', `Sent ₦${tipAmount} to @${video.owner?.username || 'the creator'}!`);
            setTimeout(() => setTipSuccess(false), 3000);
        } catch (err) {
            console.error("Tip failed:", err);
            setTipping(false);
            showNotification('error', "Failed to send tip.");
        }
    };

    return (
        <div className="monetization-widget">
            {isOwner ? (
                /* ---------------- PRIVATE CREATOR DASHBOARD ---------------- */
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="creator-dashboard glass-panel"
                >
                    <div className="dash-header">
                        <TrendingUp className="text-neon" size={24} />
                        <h3>Creator Dashboard</h3>
                    </div>
                    
                    <div className="total-earnings-card">
                        <span className="label">Total Earnings</span>
                        <motion.h2 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="balance"
                        >
                            ₦{Number(wallet.balance).toLocaleString()}
                        </motion.h2>
                        
                        <div className="earnings-split">
                            <div className="split-item">
                                <DollarSign size={16} /> <span>Ads: Coming Soon</span>
                            </div>
                            <div className="split-item">
                                <Sparkles size={16} /> <span>Live: ₦{Number(wallet.balance).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="milestone-tracker">
                        <div className="tracker-header">
                            <span>Next Payout Milestone</span>
                            <span className="views-left">{viewsToNextPayout} views left</span>
                        </div>
                        <div className="progress-bg">
                            <motion.div 
                                className="progress-bar"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>
                        <p className="milestone-desc">Earn ₦99.00 every 1,000 views</p>
                    </div>

                    <div className="mini-chart">
                        <div className="chart-bars">
                            <div className="bar" style={{ height: '30%' }}></div>
                            <div className="bar" style={{ height: '50%' }}></div>
                            <div className="bar" style={{ height: '40%' }}></div>
                            <div className="bar" style={{ height: '80%' }}></div>
                            <div className="bar" style={{ height: '60%', background: 'var(--accent-primary)' }}></div>
                        </div>
                        <span className="chart-label">Recent Activity</span>
                    </div>
                </motion.div>
            ) : (
                /* ---------------- PUBLIC VIEWER WIDGET ---------------- */
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="public-monetization-panel"
                >
                    {/* Tip Container */}
                    <div className="tip-container glass-panel">
                        <h4>Show some love!</h4>
                        <div className="tip-presets">
                            {[500, 1000, 2500].map(amt => (
                                <button 
                                    key={amt}
                                    className={`preset-btn ${tipAmount === amt ? 'active' : ''}`}
                                    onClick={() => setTipAmount(amt)}
                                >
                                    ₦{amt}
                                </button>
                            ))}
                        </div>
                        
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`send-tip-btn ${tipSuccess ? 'success' : ''}`}
                            onClick={handleTip}
                            disabled={tipping}
                        >
                            {tipping ? (
                                <div className="loader"></div>
                            ) : tipSuccess ? (
                                <><CheckCircle size={20} /> Tipped!</>
                            ) : (
                                <><Send size={20} /> Send Tip ₦{tipAmount}</>
                            )}
                        </motion.button>
                        
                        {/* Milestone gamification for viewers */}
                        <div className="public-milestone">
                            <p>Help @{video.owner?.username || 'creator'} reach their next milestone!</p>
                            <div className="progress-bg small">
                                <motion.div 
                                    className="progress-bar neon-pulse"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <style>{`
                .monetization-widget {
                    width: 100%;
                    max-width: 400px;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .glass-panel {
                    background: rgba(20, 20, 20, 0.7);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 215, 0, 0.1);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                .text-neon {
                    color: var(--accent-primary);
                    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
                }
                
                /* Dashboard Styles */
                .dash-header {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    margin-bottom: 1.5rem;
                }
                .dash-header h3 {
                    font-size: 1.3rem;
                    font-weight: 800;
                    margin: 0;
                    color: white;
                }
                .total-earnings-card {
                    background: linear-gradient(145deg, rgba(30,30,30,0.8), rgba(15,15,15,0.9));
                    border-radius: 12px;
                    padding: 1.5rem;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    margin-bottom: 1.5rem;
                }
                .total-earnings-card .label {
                    color: #aaa;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .total-earnings-card .balance {
                    font-size: 2.8rem;
                    font-weight: 900;
                    margin: 0.5rem 0 1rem;
                    color: white;
                    text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                }
                .earnings-split {
                    display: flex;
                    justify-content: space-between;
                    background: rgba(0,0,0,0.3);
                    padding: 0.8rem;
                    border-radius: 8px;
                }
                .split-item {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.8rem;
                    color: #ddd;
                }
                
                /* Milestones */
                .tracker-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.8rem;
                }
                .views-left {
                    color: var(--accent-primary);
                }
                .progress-bg {
                    width: 100%;
                    height: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 99px;
                    overflow: hidden;
                }
                .progress-bg.small { height: 6px; }
                .progress-bar {
                    height: 100%;
                    background: var(--accent-primary);
                    border-radius: 99px;
                    box-shadow: 0 0 10px var(--accent-primary);
                }
                .milestone-desc {
                    font-size: 0.8rem;
                    color: #888;
                    margin-top: 0.5rem;
                }

                /* Charts */
                .mini-chart {
                    margin-top: 1.5rem;
                    height: 80px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                }
                .chart-bars {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 50px;
                    gap: 8px;
                }
                .chart-bars .bar {
                    flex: 1;
                    background: rgba(255,255,255,0.2);
                    border-radius: 4px 4px 0 0;
                    transition: height 0.3s ease;
                }
                .chart-label {
                    font-size: 0.75rem;
                    color: #888;
                    margin-top: 0.5rem;
                    text-align: center;
                }

                /* Public Elements */
                .subscribe-banner {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 0, 0, 0.6));
                }
                .sub-icon {
                    background: rgba(255, 215, 0, 0.2);
                    padding: 0.6rem;
                    border-radius: 50%;
                }
                .sub-info h4 { margin: 0; font-size: 1rem; font-weight: 700; color: white; }
                .sub-info p { margin: 0; font-size: 0.8rem; color: #bbb; }
                .sub-btn {
                    margin-left: auto;
                    background: var(--accent-primary);
                    color: black;
                    border: none;
                    padding: 0.5rem 1.2rem;
                    border-radius: 99px;
                    font-weight: 800;
                }

                .tip-container h4 {
                    margin: 0 0 1rem;
                    font-size: 1.1rem;
                    font-weight: 800;
                    text-align: center;
                }
                .tip-presets {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.2rem;
                }
                .preset-btn {
                    flex: 1;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 0.6rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .preset-btn.active {
                    background: rgba(255, 215, 0, 0.2);
                    border-color: var(--accent-primary);
                    color: var(--accent-primary);
                }
                .send-tip-btn {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    border: none;
                    background: var(--accent-primary);
                    color: black;
                    font-weight: 800;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.8rem;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
                }
                .send-tip-btn.success {
                    background: #4ade80;
                    box-shadow: 0 4px 20px rgba(74, 222, 128, 0.4);
                }
                .loader {
                    border: 3px solid rgba(0,0,0,0.1);
                    border-top: 3px solid black;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    animation: spin 1s linear infinite;
                }
                .public-milestone {
                    margin-top: 1.5rem;
                    text-align: center;
                    font-size: 0.8rem;
                    color: #aaa;
                }
                .public-milestone p { margin-bottom: 0.5rem; }
                .neon-pulse {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 5px var(--accent-primary); }
                    50% { box-shadow: 0 0 15px var(--accent-primary); }
                    100% { box-shadow: 0 0 5px var(--accent-primary); }
                }
            `}</style>
        </div>
    );
};

export default MonetizationWidget;
