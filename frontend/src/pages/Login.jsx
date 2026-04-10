import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Zap, ChevronRight, ShieldCheck, Key, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [authStep, setAuthStep] = useState('credentials'); // credentials, methods, totp, recovery
    const [availableMethods, setAvailableMethods] = useState([]);
    const [tempUsername, setTempUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin, verifyLogin2FA } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Pick up state from Signup redirection or previous failed attempt
    useEffect(() => {
        if (location.state?.tempUsername) {
            setTempUsername(location.state.tempUsername);
            setAvailableMethods(location.state.methods || ['totp']);
            setAuthStep(location.state.authStep || 'methods');
            
            // If only one method, skip directly to it
            if (location.state.methods?.length === 1) {
                setAuthStep(location.state.methods[0] === 'totp' ? 'totp' : 'recovery');
            }
        }
    }, [location.state]);

    // Auto-verify TOTP at 6 digits
    useEffect(() => {
        if (totpCode.length === 6 && authStep === 'totp') {
            handle2FAVerify(totpCode);
        }
    }, [totpCode, authStep]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setError('');
        setIsLoading(true);
        try {
            const res = await login({ username, password });
            
            if (res?.two_factor_required) {
                setTempUsername(res.username);
                setAvailableMethods(res.methods || ['totp']);
                
                if (res.methods?.length > 1) {
                    setAuthStep('methods');
                } else {
                    setAuthStep(res.methods?.[0] === 'recovery_code' ? 'recovery' : 'totp');
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
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FAVerify = async (codeOverride) => {
        const codeToVerify = codeOverride || (authStep === 'totp' ? totpCode : recoveryCode);
        if (!codeToVerify || isLoading) return;
        
        setError('');
        setIsLoading(true);
        try {
            const user = await verifyLogin2FA(tempUsername, codeToVerify);
            if (user && !user.is_onboarded) {
                navigate('/onboarding');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="logo-section" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <Zap size={40} className="glow-icon" fill="currentColor" />
                        <span style={{ fontWeight: 800, letterSpacing: '2px' }}>MONTEEQ</span>
                    </div>
                    
                    {authStep === 'credentials' && (
                        <>
                            <h1>Welcome Back</h1>
                            <p className="subtitle-text">Login to your cinematic experience</p>
                        </>
                    )}
                    
                    {(authStep === 'methods' || authStep === 'totp' || authStep === 'recovery') && (
                        <>
                            <h1 className="premium-text flex-center gap-2">
                                <ShieldCheck size={28} className="accent-text" />
                                2FA Verification
                            </h1>
                            <p className="subtitle-text">Protecting your account: {tempUsername}</p>
                        </>
                    )}
                </div>

                {error && (
                    <div style={{ 
                        color: 'var(--accent-primary)', 
                        background: 'rgba(255, 60, 60, 0.1)', 
                        padding: '12px', 
                        borderRadius: '8px', 
                        marginBottom: '1.5rem', 
                        fontSize: '0.9rem',
                        border: '1px solid rgba(255, 60, 60, 0.2)',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* Primary Login Step */}
                {authStep === 'credentials' && (
                    <>
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        style={{ paddingRight: '2.5rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '4px'
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="auth-button"
                                disabled={isLoading}
                                style={{ opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {isLoading ? (
                                    <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Signing In…</>
                                ) : 'Sign In'}
                            </button>
                        </form>

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
                                                    setAuthStep(res.methods?.[0] === 'recovery_code' ? 'recovery' : 'totp');
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
                                onError={() => setError('Google Login Failed')}
                                theme="filled_black"
                                shape="pill"
                            />
                        </div>
                    </>
                )}

                {/* Method Selection Step */}
                {authStep === 'methods' && (
                    <div className="auth-form-animation" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ textAlign: 'center', marginBottom: '0.5rem', opacity: 0.7 }}>Select verification method</p>
                        
                        {availableMethods.includes('totp') && (
                            <button 
                                className="method-card glass" 
                                onClick={() => setAuthStep('totp')}
                                disabled={isLoading}
                            >
                                <div className="method-icon-container totp">
                                    <Mail size={20} />
                                </div>
                                <div className="method-details">
                                    <span className="method-name">Authenticator App</span>
                                    <span className="method-info">Use your mobile security app</span>
                                </div>
                                <ChevronRight size={18} opacity={0.3} />
                            </button>
                        )}

                        {availableMethods.includes('recovery_code') && (
                            <button 
                                className="method-card glass" 
                                onClick={() => setAuthStep('recovery')}
                                disabled={isLoading}
                            >
                                <div className="method-icon-container recovery">
                                    <Key size={20} />
                                </div>
                                <div className="method-details">
                                    <span className="method-name">Recovery Code</span>
                                    <span className="method-info">Use one of your backup codes</span>
                                </div>
                                <ChevronRight size={18} opacity={0.3} />
                            </button>
                        )}

                        <button 
                            className="auth-link" 
                            style={{ background: 'none', border: 'none', padding: '1rem', marginTop: '0.5rem' }}
                            onClick={() => setAuthStep('credentials')}
                            disabled={isLoading}
                        >
                            Back to Credentials
                        </button>
                    </div>
                )}

                {/* TOTP Entry Step */}
                {authStep === 'totp' && (
                    <form className="auth-form-animation" onSubmit={(e) => { e.preventDefault(); handle2FAVerify(); }}>
                        <div className="input-group">
                            <label>6-Digit Security Code</label>
                            <input
                                type="text"
                                placeholder="000 000"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.8rem', fontWeight: 700 }}
                                maxLength={6}
                                required
                                autoFocus
                                disabled={isLoading}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.8rem', textAlign: 'center' }}>
                                Enter the code from your authenticator app
                            </p>
                        </div>
                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                            style={{ opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {isLoading ? (
                                <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying…</>
                            ) : 'Verify & Continue'}
                        </button>
                        <button 
                            type="button" 
                            className="auth-link" 
                            style={{ background: 'none', border: 'none', marginTop: '1rem', width: '100%' }}
                            onClick={() => setAuthStep(availableMethods.length > 1 ? 'methods' : 'credentials')}
                            disabled={isLoading}
                        >
                            {availableMethods.length > 1 ? 'Switch Method' : 'Back to Login'}
                        </button>
                    </form>
                )}

                {/* Recovery Code Entry Step */}
                {authStep === 'recovery' && (
                    <form className="auth-form-animation" onSubmit={(e) => { e.preventDefault(); handle2FAVerify(); }}>
                        <div className="input-group">
                            <label>Backup Recovery Code</label>
                            <input
                                type="text"
                                placeholder="XXXX-XXXX-XXXX"
                                value={recoveryCode}
                                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 }}
                                required
                                autoFocus
                                disabled={isLoading}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.8rem', textAlign: 'center' }}>
                                Enter a one-time use recovery code
                            </p>
                        </div>
                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                            style={{ opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {isLoading ? (
                                <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Signing In…</>
                            ) : 'Sign In with Recovery Code'}
                        </button>
                        <button 
                            type="button" 
                            className="auth-link" 
                            style={{ background: 'none', border: 'none', marginTop: '1rem', width: '100%' }}
                            onClick={() => setAuthStep(availableMethods.length > 1 ? 'methods' : 'credentials')}
                            disabled={isLoading}
                        >
                            {availableMethods.length > 1 ? 'Switch Method' : 'Back to Login'}
                        </button>
                    </form>
                )}

            <div className="auth-footer">
                Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
            </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Login;
