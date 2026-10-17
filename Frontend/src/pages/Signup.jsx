import { useState } from 'react';
import ResearchOSLogo from '../components/ResearchOSLogo';
import { useAuth } from '../context/AuthContext';
import './Login.css'; /* reuse shared auth styles */

/* ── Icons ────────────────────────────────────────────────────────────────── */

function UserIcon({ size = 18, color = '#94A3B8' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function MailIcon({ size = 18, color = '#94A3B8' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

function BuildingIcon({ size = 18, color = '#94A3B8' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-6h6v6" />
            <rect x="9" y="9" width="2" height="2" />
            <rect x="13" y="9" width="2" height="2" />
        </svg>
    );
}

function LockIcon({ size = 18, color = '#94A3B8' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function EyeIcon({ size = 18, color = '#94A3B8' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon({ size = 18, color = '#94A3B8' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

function ArrowRightIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

function ArrowLeftIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    );
}

function GoogleIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853" />
            <path d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05" />
            <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.9245 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335" />
        </svg>
    );
}

function GitHubIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="#1E293B">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
    );
}

/* ── Left panel features list ─────────────────────────────────────────────── */
const panelFeatures = [
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
            </svg>
        ),
        label: 'Free for individual researchers',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
        ),
        label: 'Unlimited dataset versioning',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2v7.31L4.1 19.33A2 2 0 0 0 5.8 22h12.4a2 2 0 0 0 1.7-2.67L14 9.31V2" /><path d="M8.5 2h7" /><path d="M7 16h10" />
            </svg>
        ),
        label: 'Full experiment tracking & metrics',
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="6" r="3" /><circle cx="19" cy="6" r="3" /><circle cx="12" cy="18" r="3" />
                <line x1="7.5" y1="7.5" x2="10.5" y2="15.5" /><line x1="16.5" y1="7.5" x2="13.5" y2="15.5" />
            </svg>
        ),
        label: 'End-to-end provenance graphs',
    },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function Signup({ onSuccess, onLogin, onBack }) {
    const { signUpWithEmail, signInWithGoogle } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', org: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationSent, setConfirmationSent] = useState(false);

    function getPasswordStrength(pass) {
        if (!pass) return { score: 0, label: '', color: '' };
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
        if (score === 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
        if (score === 3) return { score: 3, label: 'Good', color: '#10B981' };
        return { score: 4, label: 'Strong', color: '#0D9488' };
    }

    const strength = getPasswordStrength(form.password);

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) { setError('Please enter your full name.'); return; }
        if (!form.email.includes('@')) { setError('Please enter a valid email address.'); return; }
        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        setLoading(true);
        setError('');
        const { data, error } = await signUpWithEmail(form.email, form.password, {
            full_name: form.name,
            org: form.org,
        });
        setLoading(false);
        if (error) {
            setError(error.message || 'Sign up failed. Please try again.');
        } else if (data?.user && !data.session) {
            // Email confirmation required — Supabase sent a confirmation email
            setConfirmationSent(true);
        } else {
            // Auto-confirmed (e.g. email confirmation disabled in Supabase dashboard)
            onSuccess();
        }
    }

    async function handleGoogle() {
        setGoogleLoading(true);
        setError('');
        const { error } = await signInWithGoogle();
        setGoogleLoading(false);
        if (error) setError(error.message || 'Google sign in failed.');
        // On success, Supabase redirects to Google then back — AuthContext picks up the session
    }

    return (
        <div className="auth-split-page">
            {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
            <div className="auth-left-panel">
                <div className="auth-panel-inner">
                    <div className="auth-panel-logo">
                        <ResearchOSLogo size={34} showWordmark={true} textColor="#FFFFFF" />
                    </div>

                    <div className="auth-panel-headline">
                        <h2 className="panel-heading">Start building<br />reproducible<br />science today.</h2>
                        <p className="panel-subtext">Join researchers who use ResearchOS to bring structure, clarity, and reproducibility to their ML workflow.</p>
                    </div>

                    <ul className="panel-features-list">
                        {panelFeatures.map((f, i) => (
                            <li key={i} className="panel-feature-item">
                                <span className="panel-feature-icon">{f.icon}</span>
                                <span className="panel-feature-label">{f.label}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="auth-panel-footer">
                        <div className="panel-quote">&ldquo;Good science is reproducible science. ResearchOS makes that effortless.&rdquo;</div>
                    </div>
                </div>

                <div className="panel-blob panel-blob-1" />
                <div className="panel-blob panel-blob-2" />
            </div>

            {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
            <div className="auth-right-panel">
                <button onClick={onBack} className="auth-back-btn">
                    <ArrowLeftIcon size={15} />
                    <span>Back to home</span>
                </button>

                <div className="auth-form-container">
                    {/* Mobile-only logo */}
                    <div className="auth-mobile-logo">
                        <ResearchOSLogo size={30} showWordmark={true} textColor="#0F172A" />
                    </div>

                    <div className="auth-form-header">
                        <h1 className="auth-form-title">Create your workspace</h1>
                        <p className="auth-form-desc">Free for researchers and labs — get started in under a minute</p>
                    </div>

                    {/* OAuth */}
                    <div className="oauth-grid">
                        <button type="button" onClick={handleGoogle} disabled={googleLoading} className="oauth-btn">
                            <GoogleIcon size={18} />
                            <span>{googleLoading ? 'Redirecting…' : 'Google'}</span>
                        </button>
                    </div>

                    {confirmationSent && (
                        <div className="auth-success auth-success--large">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <div>
                                <strong>Check your email!</strong>
                                <p>We sent a confirmation link to <em>{form.email}</em>. Click it to activate your account.</p>
                            </div>
                        </div>
                    )}

                    <div className="auth-divider">
                        <span className="divider-line" />
                        <span className="divider-text">or register with email</span>
                        <span className="divider-line" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="auth-form" noValidate>
                        {/* Name */}
                        <div className="form-field">
                            <label className="field-label">Full Name / Academic Title</label>
                            <div className="field-wrap">
                                <span className="field-prefix-icon"><UserIcon size={17} /></span>
                                <input
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Dr. Elena Vance"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="field-input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-field">
                            <label className="field-label">Work / Academic Email</label>
                            <div className="field-wrap">
                                <span className="field-prefix-icon"><MailIcon size={17} /></span>
                                <input
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="elena.vance@university.edu"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="field-input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Institution */}
                        <div className="form-field">
                            <label className="field-label">
                                Institution / Laboratory <span className="label-optional">(optional)</span>
                            </label>
                            <div className="field-wrap">
                                <span className="field-prefix-icon"><BuildingIcon size={17} /></span>
                                <input
                                    name="org"
                                    type="text"
                                    autoComplete="organization"
                                    placeholder="AI & Vision Laboratory"
                                    value={form.org}
                                    onChange={handleChange}
                                    className="field-input"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-field">
                            <label className="field-label">Password</label>
                            <div className="field-wrap">
                                <span className="field-prefix-icon"><LockIcon size={17} /></span>
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Minimum 8 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="field-input"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="field-eye-btn"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                                </button>
                            </div>

                            {/* Strength meter */}
                            {form.password && (
                                <div className="password-strength-container">
                                    <div className="strength-track">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className="strength-chunk"
                                                style={{ backgroundColor: step <= strength.score ? strength.color : '#E2E8F0' }}
                                            />
                                        ))}
                                    </div>
                                    <span className="strength-caption" style={{ color: strength.color }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && <div className="auth-error">{error}</div>}

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="auth-submit-btn">
                            {loading ? (
                                <span className="btn-loading">
                                    <span className="spinner" />
                                    Creating workspace…
                                </span>
                            ) : (
                                <span className="btn-content">
                                    Create free workspace
                                    <ArrowRightIcon size={15} />
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Switch to login */}
                    <div className="auth-switch">
                        <span className="switch-text">Already have a workspace?</span>
                        <button onClick={onLogin} className="switch-link">Sign in</button>
                    </div>

                    <p className="auth-disclaimer">
                        By creating an account, you agree to ResearchOS&apos;s Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}