import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [totpCode, setTotpCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [authStep, setAuthStep] = useState('credentials'); // credentials, methods, totp, recovery
    const [availableMethods, setAvailableMethods] = useState([]);
    const [tempUsername, setTempUsername] = useState('');
    const [error, setError] = useState('');
    const { login, googleLogin, verifyLogin2FA } = useAuth();
    const navigate = useNavigate();

    // Auto-verify TOTP at 6 digits
    useEffect(() => {
        if (totpCode.length === 6 && authStep === 'totp') {
            handle2FAVerify(totpCode);
        }
    }, [totpCode, authStep]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await login({ username, password });
            
            if (res?.two_factor_required) {
                setTempUsername(res.username);
                setAvailableMethods(res.methods || ['totp']);
                
                if (res.methods?.length > 1) {
                    setAuthStep('methods');
                } else {
                    setAuthStep('totp');
                }
                return;
            }

            const user = res;
            if (user && !user.is_onboarded) {
                navigate('/onboarding');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to login');
        }
    };

    const handle2FAVerify = async (codeOverride) => {
        const codeToVerify = codeOverride || (authStep === 'totp' ? totpCode : recoveryCode);
        setError('');
        try {
            const user = await verifyLogin2FA(tempUsername, codeToVerify);
            if (user && !user.is_onboarded) {
                navigate('/onboarding');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid verification code');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="logo-section" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <Zap size={40} fill="currentColor" />
                        <span>MONTAGE</span>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Login to your cinematic experience</p>
                </div>

                {error && <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                {authStep === 'credentials' && (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button">Sign In</button>
                    </form>
                )}

                {authStep === 'methods' && (
                    <div className="auth-form" style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>Choose your verification method</p>
                        
                        <button 
                            className="glass" 
                            style={{ 
                                width: '100%', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-glass)', 
                                color: 'white', background: 'rgba(255,255,255,0.03)', textAlign: 'left', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '1rem'
                            }}
                            onClick={() => setAuthStep('totp')}
                        >
                            <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📱</div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Authenticator App</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Use your 6-digit code</div>
                            </div>
                        </button>

                        <button 
                            className="glass" 
                            style={{ 
                                width: '100%', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--border-glass)', 
                                color: 'white', background: 'rgba(255,255,255,0.03)', textAlign: 'left', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '1rem'
                            }}
                            onClick={() => setAuthStep('recovery')}
                        >
                            <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔑</div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Recovery Code</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Use a backup code</div>
                            </div>
                        </button>

                        <button 
                            className="auth-link" 
                            style={{ background: 'none', border: 'none', marginTop: '1rem', width: '100%' }}
                            onClick={() => setAuthStep('credentials')}
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                {authStep === 'totp' && (
                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handle2FAVerify(); }}>
                        <div className="input-group">
                            <label>2FA Authentication Code</label>
                            <input
                                type="text"
                                placeholder="000 000"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem' }}
                                maxLength={6}
                                required
                                autoFocus
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
                                Enter the code from your authenticator app.
                            </p>
                        </div>
                        <button type="submit" className="auth-button">Verify & Login</button>
                        <button 
                            type="button" 
                            className="auth-link" 
                            style={{ background: 'none', border: 'none', marginTop: '1rem', width: '100%' }}
                            onClick={() => setAuthStep(availableMethods.length > 1 ? 'methods' : 'credentials')}
                        >
                            {availableMethods.length > 1 ? 'Back to Methods' : 'Back to Login'}
                        </button>
                    </form>
                )}

                {authStep === 'recovery' && (
                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handle2FAVerify(); }}>
                        <div className="input-group">
                            <label>Recovery Code</label>
                            <input
                                type="text"
                                placeholder="XXXX-XXXX-XXXX"
                                value={recoveryCode}
                                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem' }}
                                required
                                autoFocus
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.8rem' }}>
                                Enter one of your 12-character backup codes.
                            </p>
                        </div>
                        <button type="submit" className="auth-button">Sign In with Recovery Code</button>
                        <button 
                            type="button" 
                            className="auth-link" 
                            style={{ background: 'none', border: 'none', marginTop: '1rem', width: '100%' }}
                            onClick={() => setAuthStep(availableMethods.length > 1 ? 'methods' : 'credentials')}
                        >
                            Back
                        </button>
                    </form>
                )}

                <div className="auth-divider">OR</div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            googleLogin(credentialResponse.credential)
                                .then((res) => {
                                    if (res?.two_factor_required) {
                                        setTempUsername(res.username);
                                        setAvailableMethods(res.methods || ['totp']);
                                        if (res.methods?.length > 1) {
                                            setAuthStep('methods');
                                        } else {
                                            setAuthStep('totp');
                                        }
                                        return;
                                    }

                                    const user = res;
                                    if (user && !user.is_onboarded) {
                                        navigate('/onboarding');
                                    } else {
                                        navigate('/');
                                    }
                                })
                                .catch(err => setError(err.response?.data?.detail || 'Google Login Failed'));
                        }}
                        onError={() => {
                            setError('Google Login Failed');
                        }}
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
