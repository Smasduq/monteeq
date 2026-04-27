import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { Mail, Lock, User, Zap, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAvailable, setIsAvailable] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const { signup, login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const passwordRequirements = [
        { label: '8+ characters', met: password.length >= 8 },
        { label: 'Uppercase', met: /[A-Z]/.test(password) },
        { label: 'Lowercase', met: /[a-z]/.test(password) },
        { label: 'Digit', met: /[0-9]/.test(password) },
        { label: 'Special symbol', met: /[!@#$%^&*()\-_=+[\]{}|;:'",.<>/?`~]/.test(password) },
    ];

    const isPasswordValid = passwordRequirements.every(req => req.met);

    const checkUsernameAvailability = async (val) => {
        if (val.length < 3) {
            setIsAvailable(null);
            return;
        }
        setIsChecking(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/check-username?username=${val}`);
            const data = await response.json();
            setIsAvailable(data.available);
        } catch (err) {
            console.error("Availability check failed", err);
        } finally {
            setIsChecking(false);
        }
    };

    const handleUsernameChange = (e) => {
        const val = e.target.value.toLowerCase().replace(/\s/g, '');
        setUsername(val);
        checkUsernameAvailability(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setError('');

        if (isAvailable === false) {
            setError('Username is already taken');
            return;
        }

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        if (!acceptedTerms) {
            setError('Please accept the Terms of Service and Privacy Policy');
            return;
        }

        setIsLoading(true);
        try {
            await signup({ username, full_name: fullName, email, password });
            await login({ username, password });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to sign up');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Verification failed');

            // Login after verification
            const user = await login({ username, password });
            if (user && !user.is_onboarded) {
                navigate('/onboarding');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (isResending) return;
        setError('');
        setIsResending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to resend code');
            setError(''); // clear any previous error
        } catch (err) {
            setError(err.message || 'Failed to resend code');
        } finally {
            setIsResending(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="auth-container">
                <div className="auth-card glass" style={{ position: 'relative', overflow: 'hidden' }}>
                    {isLoading && (
                        <div className="auth-loading-overlay">
                            <Loader2 size={48} className="spin accent-text" style={{ animation: 'spin 1s linear infinite' }} />
                            <span className="auth-loading-text">VERIFYING...</span>
                        </div>
                    )}
                    <div className="auth-header">
                        <div className="logo-section" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                            <Zap size={40} fill="currentColor" />
                            <span>MONTEEQ</span>
                        </div>
                        <h1>Verify Email</h1>
                        <p>We've sent a 6-digit code to <strong>{email}</strong></p>
                    </div>

                    {error && (
                        <div style={{
                            color: 'var(--accent-primary)',
                            background: 'rgba(255, 60, 60, 0.1)',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 60, 60, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleVerifyCode}>
                        <div className="input-group">
                            <label>Verification Code</label>
                            <input
                                type="text"
                                maxLength="6"
                                placeholder="123456"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 'bold' }}
                                required
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading || verificationCode.length < 6}
                            style={{
                                opacity: (isLoading || verificationCode.length < 6) ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {isLoading ? (
                                <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying…</>
                            ) : 'Verify & Continue'}
                        </button>
                    </form>

                    <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={handleResendCode}
                            className="auth-link"
                            disabled={isResending}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                font: 'inherit',
                                cursor: isResending ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                opacity: isResending ? 0.6 : 1
                            }}
                        >
                            {isResending ? (
                                <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Sending…</>
                            ) : 'Resend Code'}
                        </button>
                        <button
                            onClick={() => setIsVerifying(false)}
                            className="auth-link"
                            disabled={isLoading}
                            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                        >
                            Go Back
                        </button>
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
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass" style={{ position: 'relative', overflow: 'hidden' }}>
                {isLoading && (
                    <div className="auth-loading-overlay">
                        <Loader2 size={48} className="spin accent-text" style={{ animation: 'spin 1s linear infinite' }} />
                        <span className="auth-loading-text">CREATING ACCOUNT...</span>
                    </div>
                )}
                <div className="auth-header">
                    <div className="logo-section" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                        <Zap size={40} fill="currentColor" />
                        <span>MONTEEQ</span>
                    </div>
                    <h1>Create Account</h1>
                    <p>Start your journey with Monteeq</p>
                </div>

                {error && (
                    <div style={{
                        color: 'var(--accent-primary)',
                        background: 'rgba(255, 60, 60, 0.1)',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        border: '1px solid rgba(255, 60, 60, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <label>Username</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="choose_username"
                                value={username}
                                onChange={handleUsernameChange}
                                style={{
                                    paddingRight: '2.5rem',
                                    borderColor: isAvailable === false ? 'var(--accent-primary)' : isAvailable === true ? '#4ade80' : ''
                                }}
                                required
                                disabled={isLoading}
                            />
                            {isAvailable !== null && (
                                <div style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: isAvailable ? '#4ade80' : 'var(--accent-primary)'
                                }}>
                                    {isChecking ? '...' : isAvailable ? '✓' : '✗'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        <div className="password-requirements" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            marginTop: '0.8rem',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {passwordRequirements.map((req, idx) => (
                                <div key={idx} style={{
                                    color: req.met ? '#4ade80' : 'rgba(255,255,255,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: req.met ? '600' : '400',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: req.met ? '#4ade80' : 'rgba(255,255,255,0.2)',
                                        boxShadow: req.met ? '0 0 8px #4ade80' : 'none'
                                    }} />
                                    {req.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="auth-terms-container" onClick={() => setAcceptedTerms(!acceptedTerms)}>
                        <input 
                            type="checkbox" 
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="auth-terms-text">
                            I agree to the <Link to="/terms" onClick={(e) => e.stopPropagation()}>Terms of Service</Link> and <Link to="/privacy" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading || !isPasswordValid || isAvailable === false}
                        style={{
                            marginTop: '1.5rem',
                            opacity: (isLoading || !isPasswordValid || isAvailable === false) ? 0.5 : 1,
                            transform: (!isPasswordValid || isAvailable === false) ? 'none' : 'scale(1)',
                            boxShadow: isPasswordValid && isAvailable !== false ? '0 4px 15px rgba(255, 60, 60, 0.3)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {isLoading ? (
                            <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating Account…</>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div className="auth-divider">OR</div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            setIsLoading(true);
                            googleLogin(credentialResponse.credential)
                                .then((res) => {
                                    if (res?.two_factor_required) {
                                        navigate('/login', { 
                                            state: { 
                                                authStep: 'methods', 
                                                tempUsername: res.username,
                                                methods: res.methods 
                                            } 
                                        });
                                        return;
                                    }
                                    const user = res;
                                    if (user && !user.is_onboarded) {
                                        navigate('/onboarding');
                                    } else {
                                        navigate('/');
                                    }
                                })
                                .catch(err => setError(err.response?.data?.detail || 'Google Login Failed'))
                                .finally(() => setIsLoading(false));
                        }}
                        onError={() => {
                            setError('Google Login Failed');
                            setIsLoading(false);
                        }}
                        theme="filled_black"
                        shape="pill"
                        text="signup_with"
                    />
                </div>

                <div className="auth-footer">
                    Already have an account? <Link to="/login" className="auth-link">Log In</Link>
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

export default Signup;
