import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Crown, Star, ShieldCheck, Flame, ChevronRight, Play, Maximize2 } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { verifyProSubscription } from '../api';
import './JoinProV2.css';

// Asset paths
const IMG_SD = "/home/smasduq/.gemini/antigravity/brain/026c1d2e-ab8f-45be-8ead-ed0b52711070/standard_quality_sample_1775836916315.png";
const IMG_HD = "/home/smasduq/.gemini/antigravity/brain/026c1d2e-ab8f-45be-8ead-ed0b52711070/hd_quality_sample_1775836966285.png";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';

const JoinProV2 = () => {
    const navigate = useNavigate();
    const [isYearly, setIsYearly] = useState(false);
    const { user, token, refreshUser } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const amount = isYearly ? 22800 : 2500;
    const config = {
        reference: (new Date()).getTime().toString(),
        email: user?.email || '',
        amount: amount * 100,
        publicKey: PAYSTACK_PUBLIC_KEY,
    };

    const initializePayment = usePaystackPayment(config);

    const handleSuccess = async (reference) => {
        setLoading(true);
        try {
            const resp = await verifyProSubscription(reference.reference, token);
            if (resp.status === 'success') {
                showNotification('Welcome to Monteeq Pro!', 'success');
                await refreshUser();
            } else {
                showNotification(resp.message || 'Verification failed.', 'error');
            }
        } catch (err) {
            showNotification('Verification failed. Please contact support.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinPro = () => {
        if (!token) {
            showNotification('Please log in to join Monteeq Pro', 'info');
            return;
        }
        initializePayment({ onSuccess: handleSuccess, onClose: () => showNotification('Cancelled.', 'info') });
    };

    return (
        <div className="v2Container">
            <div className="glowTop" />
            
            <div className="contentWrapper">
                {/* Hero */}
                <header className="hero">
                    <div className="heroTag">Premium Access</div>
                    <h1 className="heroTitle">Go Pro on <br/>Monteeq</h1>
                    <p className="heroSubtitle">
                        Earn more, stand out, and unlock premium features designed for the next generation of editors.
                    </p>
                    {!user?.is_premium ? (
                        <button className="ctaBtn proCta" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} style={{ maxWidth: '280px', margin: '0 auto' }}>
                           UPGRADE TO PRO <ChevronRight size={18} />
                        </button>
                    ) : (
                        <div className="proBadge">
                            <Crown size={16} /> YOU ARE A PRO MEMBER
                        </div>
                    )}
                </header>

                {/* HD Comparison Section */}
                <section className="comparisonSection">
                    <h2>Experience Cinematic Clarity</h2>
                    <div className="comparisonGrid">
                        <div className="comparisonItem">
                            <img src={IMG_SD} alt="Standard Quality" />
                            <div className="comparisonLabel">FREE: Standard Quality</div>
                        </div>
                        <div className="comparisonItem" style={{ border: '2px solid rgba(255, 60, 60, 0.4)' }}>
                            <img src={IMG_HD} alt="HD Quality" />
                            <div className="comparisonLabel proLabel">PRO: 4K Cinematic HD</div>
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255, 60, 60, 0.9)', padding: '0.4rem', borderRadius: '50%' }}>
                                <Maximize2 size={16} color="white" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <div id="pricing" className="plansGrid">
                    {/* Free Plan */}
                    <div className="planCard">
                        <div className="planName">Free Plan</div>
                        <div className="planPrice">₦0<span>/mo</span></div>
                        <ul className="featureList">
                            <li className="featureItem"><Check size={20} className="checkIcon" /> Standard video quality</li>
                            <li className="featureItem"><Check size={20} className="checkIcon" /> Content ads enabled</li>
                            <li className="featureItem"><Check size={20} className="checkIcon" /> Basic challenges</li>
                            <li className="featureItem" style={{ opacity: 0.5 }}><Check size={20} className="checkIcon" /> Platform commission applies</li>
                        </ul>
                        <button className="ctaBtn freeCta" disabled>CURRENT PLAN</button>
                    </div>

                    {/* Pro Plan */}
                    <div className="planCard proCard">
                        <div className="planName">Pro Plan</div>
                        <div className="planPrice">₦2,500<span>/mo</span></div>
                        <ul className="featureList">
                            <li className="featureItem"><Flame size={20} className="checkIcon" /> <strong>4K Cinematic Quality</strong></li>
                            <li className="featureItem"><Flame size={20} className="checkIcon" /> <strong>Exclusive Gold Challenges</strong></li>
                            <li className="featureItem"><Flame size={20} className="checkIcon" /> <strong>Pro Editor Badge</strong></li>
                            <li className="featureItem"><Flame size={20} className="checkIcon" /> <strong>0% Commission on Earnings</strong></li>
                            <li className="featureItem"><Flame size={20} className="checkIcon" /> <strong>Higher Reach & Visibility</strong></li>
                            <li className="featureItem"><Flame size={20} className="checkIcon" /> <strong>Ad-Free Experience</strong></li>
                        </ul>
                        <button 
                            className="ctaBtn proCta" 
                            onClick={handleJoinPro} 
                            disabled={loading || user?.is_premium}
                        >
                            {loading ? 'Processing...' : user?.is_premium ? 'PRO ACTIVE' : 'UPGRADE TO PRO'}
                        </button>
                    </div>
                </div>

                {/* Core Benefits */}
                <section className="benefitsGrid">
                    <div className="benefitItem">
                        <div className="benefitIcon"><Zap size={24} /></div>
                        <h3 className="benefitTitle">Earn More</h3>
                        <p className="benefitDesc">We take 0% commission from your tips and ad revenue. Every kobo you earn is yours to keep.</p>
                    </div>
                    <div className="benefitItem">
                        <div className="benefitIcon"><Star size={24} /></div>
                        <h3 className="benefitTitle">Gold Challenges</h3>
                        <p className="benefitDesc">Gain exclusive entry to high-stakes tournaments with significantly larger prize pools.</p>
                    </div>
                    <div className="benefitItem">
                        <div className="benefitIcon"><ShieldCheck size={24} /></div>
                        <h3 className="benefitTitle">Get Recognized</h3>
                        <p className="benefitDesc">Your profile and comments will feature the exclusive Monteeq Pro badge for instant credibility.</p>
                    </div>
                    <div className="benefitItem">
                        <div className="benefitIcon"><Play size={24} /></div>
                        <h3 className="benefitTitle">HD Playback</h3>
                        <p className="benefitDesc">Upload and watch in ultra-crisp HD. Your vision deserves the best resolution.</p>
                    </div>
                </section>

                <footer style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                    <p>Cancel or pause anytime. Securely processed by Paystack.</p>
                    <p>© 2026 Monteeq Platform</p>
                </footer>
            </div>
        </div>
    );
};

export default JoinProV2;
