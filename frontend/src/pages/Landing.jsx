import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Play, Wallet, Shield, ArrowRight, Github, Twitter, Youtube, Sparkles } from 'lucide-react';
import styles from './Landing.module.css';
import landingBg from '../assets/images/landing-bg.png';

const Landing = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: 'easeOut' }
        }
    };

    const features = [
        {
            iconName: 'Play',
            title: "Cinematic Streaming",
            description: "Proprietary transcoding engine built in Rust for ultra-low latency 4K playback."
        },
        {
            iconName: 'Wallet',
            title: "Fair Monetization",
            description: "Direct-to-creator earnings via our NGN-integrated wallet and premium subscriptions."
        },
        {
            iconName: 'Shield',
            title: "Advanced Security",
            description: "Tiered 2FA, end-to-end encryption for chat, and secure video storage."
        }
    ];

    const renderIcon = (name) => {
        switch(name) {
            case 'Play': return <Play size={24} />;
            case 'Wallet': return <Wallet size={24} />;
            case 'Shield': return <Shield size={24} />;
            default: return <Sparkles size={24} />;
        }
    };

    return (
        <div className={styles.landing}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <img src={landingBg} alt="Background" className={styles.bgImage} />
                
                <motion.div 
                    className={styles.content}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="logo-section" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                        <Zap size={32} className="accent-text" fill="currentColor" />
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '4px' }}>MONTEEQ</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className={styles.title}>
                        The Future of <span className={styles.accent}>Cinema</span> <br /> is Decentralized
                    </motion.h1>

                    <motion.p variants={itemVariants} className={styles.subtitle}>
                        Monteeq is more than a platform. It's a high-performance ecosystem where creators own their content and fans experience the next dimension of video.
                    </motion.p>

                    <motion.div variants={itemVariants} className={styles.ctaGroup}>
                        <button 
                            className={styles.primaryBtn} 
                            onClick={() => navigate('/signup')}
                        >
                            Start Creating <ArrowRight size={20} />
                        </button>
                        <button 
                            className={styles.secondaryBtn}
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <motion.section 
                className={styles.features}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                {features.map((f, i) => (
                    <div key={i} className={styles.featureCard}>
                        <div className={styles.featureIcon}>{renderIcon(f.iconName)}</div>
                        <h3>{f.title}</h3>
                        <p>{f.description}</p>
                    </div>
                ))}
            </motion.section>

            {/* Footer */}
            <footer style={{ padding: '3rem 2rem', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid var(--border-glass)', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Twitter size={20} opacity={0.6} cursor="pointer" />
                    <Github size={20} opacity={0.6} cursor="pointer" />
                    <Youtube size={20} opacity={0.6} cursor="pointer" />
                </div>
                <p style={{ fontSize: '0.9rem', opacity: 0.4 }}>© 2026 MONTEEQ Labs. Built for the next billion creators.</p>
            </footer>

            <style>{`
                .${styles.bgImage} {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    opacity: 0.3;
                    mix-blend-mode: overlay;
                    z-index: 1;
                }
            `}</style>
        </div>
    );
};

export default Landing;
