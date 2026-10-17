import { useState, useEffect } from 'react';
import './Landing.css';

// 1. FEATURES DATA (KEPT AS IS AS REQUESTED BY USER)
const features = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#0F9D8A" opacity="0.85" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#14B8A6" opacity="0.5" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#14B8A6" opacity="0.5" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#0F9D8A" opacity="0.85" />
            </svg>
        ),
        title: 'Dataset Versioning',
        desc: 'Track every mutation with full lineage. Compare versions side-by-side and roll back instantly.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 12 L6 7 L10 13 L14 8 L18 10" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="7" r="1.5" fill="#0F9D8A" />
                <circle cx="10" cy="13" r="1.5" fill="#0F9D8A" />
                <circle cx="14" cy="8" r="1.5" fill="#0F9D8A" />
            </svg>
        ),
        title: 'Experiment Tracking',
        desc: 'Log hyperparameters, metrics, and artifacts automatically. Compare runs with interactive charts.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="3.5" cy="10" r="2.5" fill="#14B8A6" opacity="0.7" />
                <circle cx="10" cy="4" r="2.5" fill="#0F9D8A" />
                <circle cx="16.5" cy="10" r="2.5" fill="#14B8A6" opacity="0.7" />
                <circle cx="10" cy="16" r="2.5" fill="#0F9D8A" opacity="0.7" />
                <line x1="6" y1="10" x2="7.5" y2="10" stroke="#14B8A6" strokeWidth="1.5" />
                <line x1="12.5" y1="10" x2="14" y2="10" stroke="#14B8A6" strokeWidth="1.5" />
                <line x1="10" y1="6.5" x2="10" y2="8" stroke="#0F9D8A" strokeWidth="1.5" />
                <line x1="10" y1="12" x2="10" y2="13.5" stroke="#0F9D8A" strokeWidth="1.5" />
            </svg>
        ),
        title: 'Provenance Lineage',
        desc: 'Visualize your full pipeline from raw data to model output. Reproduce any result with one click.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 5 Q10 2 16 5 L16 11 Q10 16 4 11 Z" fill="#14B8A6" opacity="0.12" />
                <path d="M4 5 Q10 2 16 5 L16 11 Q10 16 4 11 Z" stroke="#0F9D8A" strokeWidth="1.6" fill="none" />
                <circle cx="10" cy="8.5" r="2" fill="#0F9D8A" opacity="0.8" />
            </svg>
        ),
        title: 'Research Copilot',
        desc: 'Ask questions about your data, summarize findings, and draft experiment proposals with AI.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="6" cy="6" r="2.5" stroke="#0F9D8A" strokeWidth="1.6" />
                <circle cx="14" cy="6" r="2.5" stroke="#14B8A6" strokeWidth="1.6" opacity="0.7" />
                <circle cx="10" cy="14" r="2.5" stroke="#0F9D8A" strokeWidth="1.6" />
                <line x1="8.5" y1="6" x2="11.5" y2="6" stroke="#14B8A6" strokeWidth="1.2" />
                <line x1="7.5" y1="8.5" x2="9" y2="11.5" stroke="#0F9D8A" strokeWidth="1.2" />
                <line x1="12.5" y1="8.5" x2="11" y2="11.5" stroke="#0F9D8A" strokeWidth="1.2" />
            </svg>
        ),
        title: 'Team Collaboration',
        desc: 'Shared workspaces, role-based access, and async activity feeds keep your lab in sync.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="13" width="3" height="5" rx="1" fill="#14B8A6" opacity="0.6" />
                <rect x="7" y="9" width="3" height="9" rx="1" fill="#0F9D8A" opacity="0.75" />
                <rect x="12" y="5" width="3" height="13" rx="1" fill="#14B8A6" opacity="0.85" />
                <rect x="17" y="2" width="3" height="16" rx="1" fill="#0F9D8A" />
            </svg>
        ),
        title: 'Model Analytics',
        desc: 'Benchmark models on accuracy, latency, and reproducibility. Export publication-ready figures.',
    },
];

// HERO STATS (CLEAN HORIZONTAL TICKER)
const stats = [
    { value: '10×', label: 'Faster Experimentation' },
    { value: '99.9%', label: 'Reproducibility Rate' },
    { value: '500+', label: 'Active Research Labs' },
    { value: '2M+', label: 'Tracked Runs' },
];

const navLinks = [
    { label: 'Features', targetId: 'features-section' },
    { label: 'Benefits', targetId: 'benefits-section' },
    { label: 'How It Works', targetId: 'workflow-section' },
    { label: 'FAQ', targetId: 'faq-section' },
];

// MINIMAL BENEFIT HIGHLIGHTS
const benefits = [
    {
        icon: '⚡',
        title: 'Zero Latency SDK',
        desc: 'Asynchronous streaming protocol logs metrics without blocking compute loops.',
    },
    {
        icon: '🛡️',
        title: 'SHA-256 Provenance',
        desc: 'Cryptographic tree hashing guarantees 100% deterministic reproducibility.',
    },
    {
        icon: '📄',
        title: 'Paper Ready Export',
        desc: 'Generate publication-quality SVG charts and LaTeX figures in one click.',
    },
    {
        icon: '🌐',
        title: 'Multi-Lab Sharing',
        desc: 'Role-based workspace access keeps university collaborators aligned.',
    },
];

// ACTUAL SYSTEM WORKFLOW (3 CARDS ACCURATE TO SYSTEM)
const workflowSteps = [
    {
        step: '01',
        title: 'Version Datasets & Lineage',
        desc: 'Register raw dataset snapshots with cryptographic SHA-256 hashes. Track every mutation and data split automatically.',
        codeSnippet: `import researchos as ros\ndata = ros.Dataset.register("./data/v1")`,
        icon: '📁',
    },
    {
        step: '02',
        title: 'Stream Run Telemetry Live',
        desc: 'Hook your PyTorch, JAX, or TensorFlow script with 2 lines of code. Stream loss curves, GPU load, and hyperparameters live.',
        codeSnippet: `run = ros.init(project="llm-alignment")\nrun.log({"val_loss": 0.142})`,
        icon: '⚡',
    },
    {
        step: '03',
        title: 'Compare & Export Reproducible Lockfiles',
        desc: 'Compare metric sweeps, detect distribution drift with AI Copilot, and export 1-click Docker bundles for publication.',
        codeSnippet: `run.export_paper_bundle(doi="10.1038/s41586")`,
        icon: '🚀',
    },
];

// FAQ ITEMS FOR ACCORDION
const faqs = [
    {
        q: 'Is ResearchOS compatible with PyTorch, JAX, and TensorFlow?',
        a: 'Yes! ResearchOS connects via lightweight Python hooks that wrap standard training loops with zero compute overhead.',
    },
    {
        q: 'How does dataset versioning handle multi-terabyte files?',
        a: 'We use cryptographic chunking and deduplicated delta trees (similar to Git LFS, but optimized for tensor vectors), ensuring instant versioning without duplicating raw storage.',
    },
    {
        q: 'Is ResearchOS free for academic laboratories?',
        a: 'Yes, ResearchOS offers a fully featured free tier for university labs, PhD students, and open-source scientific initiatives.',
    },
    {
        q: 'Can we self-host ResearchOS on our lab’s local GPU cluster?',
        a: 'Absolutely. We provide one-command Helm charts and Docker Compose templates to run ResearchOS entirely on-premise behind your institutional firewall.',
    },
];

function LogoIcon({ size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="9" fill="url(#brandGrad)" />
            <line x1="18" y1="7" x2="18" y2="29" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="7" y1="18" x2="29" y2="18" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="10" y1="10" x2="26" y2="26" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="26" y1="10" x2="10" y2="26" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
            <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36">
                    <stop offset="0%" stopColor="#0D9488" />
                    <stop offset="50%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function Landing({ onGetStarted, onLogin }) {
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    useEffect(() => {
        const el = document.getElementById('landing-root');
        if (!el) return;
        const handler = () => setScrolled(el.scrollTop > 32);
        el.addEventListener('scroll', handler);
        return () => el.removeEventListener('scroll', handler);
    }, []);

    const scrollToSection = (id) => {
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div id="landing-root" className="landing-container">
            {/* Background Ambient Animation Layer */}
            <div className="landing-ambient-layer">
                <div className="ambient-orb orb-teal" />
                <div className="ambient-orb orb-cyan" />
                <div className="ambient-grid-pattern" />
            </div>

            {/* Nav */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="landing-nav-inner">
                    <div className="landing-logo" onClick={() => scrollToSection('hero')}>
                        <LogoIcon size={32} />
                        <span className="landing-logo-text">Research<span className="text-teal">OS</span></span>
                        <span className="nav-beta-badge">Public Beta v2.4</span>
                    </div>

                    <div className="landing-nav-links">
                        {navLinks.map(l => (
                            <button
                                key={l.label}
                                className="landing-nav-link"
                                onClick={() => scrollToSection(l.targetId)}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>

                    <div className="landing-nav-actions">
                        <button onClick={onLogin} className="landing-login-btn">
                            Log in
                        </button>
                        <button onClick={onGetStarted} className="landing-signup-btn">
                            Get started free
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* 
              ============================================================
              SECTION 1: CLEAN & HIGH-IMPACT HERO SECTION
              (LARGE WORKSPACE CARD AND STACKED STATS REMOVED AS REQUESTED)
              ============================================================
            */}
            <section id="hero" className="landing-hero">
                <div className="landing-hero-content">
                    {/* Animated Pill Badge */}
                    <div className="landing-badge hero-glow-badge">
                        <span className="landing-badge-pulse" />
                        <span>Now in public beta — free for academic labs & research teams</span>
                        <span className="badge-sparkle">✨</span>
                    </div>

                    {/* Creative Headline */}
                    <h1 className="landing-hero-title">
                        Turn complex AI research into<br />
                        <span className="landing-hero-title-highlight">reproducible results</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="landing-hero-subtitle">
                        The interactive operating system for dataset versioning, training telemetry, and cryptographic DAG lineage — built so your lab can move 10x faster.
                    </p>

                    {/* CTAs */}
                    <div className="landing-hero-buttons">
                        <button onClick={onGetStarted} className="landing-cta-primary hero-pulse-btn">
                            Launch Free Workspace
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button onClick={onLogin} className="landing-cta-secondary">
                            Sign in to workspace
                        </button>
                    </div>

                    {/* Clean Integrated Stats Ticker Bar */}
                    <div className="hero-stats-bar">
                        {stats.map((s) => (
                            <div key={s.label} className="hero-stat-item">
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 
              ============================================================
              SECTION 2: FEATURES SECTION (KEPT EXACTLY AS IS AS REQUESTED)
              ============================================================
            */}
            <section id="features-section" className="landing-features-section">
                <div className="landing-features-container">
                    <div className="landing-features-header">
                        <h2 className="landing-features-title">Everything your lab needs</h2>
                        <p className="landing-features-desc">From raw data ingestion to publication-ready results, ResearchOS handles the full research lifecycle.</p>
                    </div>
                    <div className="landing-features-grid">
                        {features.map((f) => (
                            <div key={f.title} className="landing-feature-card">
                                <div className="landing-feature-icon-box">
                                    {f.icon}
                                </div>
                                <h3 className="landing-feature-card-title">{f.title}</h3>
                                <p className="landing-feature-card-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 
              ============================================================
              SECTION 3: MINIMAL BENEFIT SECTION (STREAMLINED & SLEEK)
              ============================================================
            */}
            <section id="benefits-section" className="landing-benefits-section">
                <div className="landing-benefits-container">
                    <div className="landing-features-header">
                        <span className="section-badge-teal">WHY LABS CHOOSE RESEARCHOS</span>
                        <h2 className="landing-features-title">Built for high-throughput scientific rigor</h2>
                        <p className="landing-features-desc">Stop losing days to untracked code changes, broken Docker images, and manual paper plots.</p>
                    </div>

                    <div className="minimal-benefits-grid">
                        {benefits.map((b) => (
                            <div key={b.title} className="minimal-benefit-item">
                                <span className="m-benefit-icon">{b.icon}</span>
                                <div className="m-benefit-info">
                                    <h3 className="m-benefit-title">{b.title}</h3>
                                    <p className="m-benefit-desc">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 
              ============================================================
              SECTION 4: HOW IT WORKS SECTION (ACCURATE TO SYSTEM WORKFLOW)
              ============================================================
            */}
            <section id="workflow-section" className="landing-workflow-section">
                <div className="landing-workflow-container">
                    <div className="landing-features-header">
                        <span className="section-badge-purple">ACTUAL SYSTEM WORKFLOW</span>
                        <h2 className="landing-features-title">How ResearchOS powers your lab</h2>
                        <p className="landing-features-desc">Get started in less than 2 minutes with zero infrastructure refactoring.</p>
                    </div>

                    {/* 3 Step Cards */}
                    <div className="workflow-steps-grid">
                        {workflowSteps.map((w) => (
                            <div key={w.step} className="workflow-card">
                                <div className="wf-top-row">
                                    <span className="wf-step-number">{w.step}</span>
                                    <span className="wf-icon">{w.icon}</span>
                                </div>
                                <h3 className="wf-card-title">{w.title}</h3>
                                <p className="wf-card-desc">{w.desc}</p>
                                <div className="wf-code-box">
                                    <code>{w.codeSnippet}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 
              ============================================================
              SECTION 5: FAQ SECTION (INTERACTIVE ACCORDION)
              ============================================================
            */}
            <section id="faq-section" className="landing-faq-section">
                <div className="landing-faq-container">
                    <div className="landing-features-header">
                        <span className="section-badge-teal">FREQUENTLY ASKED QUESTIONS</span>
                        <h2 className="landing-features-title">Got questions? We have answers</h2>
                        <p className="landing-features-desc">Everything you need to know about setting up ResearchOS in your laboratory.</p>
                    </div>

                    <div className="faq-accordion-list">
                        {faqs.map((faq, index) => (
                            <div
                                key={faq.q}
                                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                            >
                                <div className="faq-question-row">
                                    <h3 className="faq-question">{faq.q}</h3>
                                    <span className="faq-toggle-icon">{openFaq === index ? '−' : '+'}</span>
                                </div>
                                {openFaq === index && (
                                    <div className="faq-answer-row fade-in">
                                        <p>{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 
              ============================================================
              SECTION 6: CTA SECTION (KEPT EXACTLY AS IS AS REQUESTED)
              ============================================================
            */}
            <section className="landing-cta-section">
                <div className="landing-cta-container">
                    <h2 className="landing-cta-title">Ready to accelerate your research?</h2>
                    <p className="landing-cta-desc">Join 500+ research teams already using ResearchOS. Free for academic labs, no credit card required.</p>
                    <button onClick={onGetStarted} className="landing-cta-btn">
                        Create your free workspace
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* 
              ============================================================
              SECTION 7: FOOTER (KEPT EXACTLY AS IS AS REQUESTED)
              ============================================================
            */}
            <footer className="landing-footer">
                <div className="landing-footer-container">
                    <div className="landing-footer-grid">
                        {/* Brand + tagline */}
                        <div className="landing-footer-brand-col">
                            <div className="landing-footer-brand-row">
                                <LogoIcon size={30} />
                                <span className="landing-footer-brand-title">ResearchOS</span>
                            </div>
                            <p className="landing-footer-brand-desc">
                                Turn your research into reproducible results. A unified workspace for datasets, experiments, and lineage.
                            </p>
                        </div>

                        {/* Product links */}
                        <div>
                            <h4 className="landing-footer-col-title">Product</h4>
                            <ul className="landing-footer-links-list">
                                {['Features', 'How It Works', 'Research', 'About'].map(l => (
                                    <li key={l}>
                                        <button className="landing-footer-link-btn">{l}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources links */}
                        <div>
                            <h4 className="landing-footer-col-title">Resources</h4>
                            <ul className="landing-footer-links-list">
                                {['Documentation', 'GitHub', 'Contact'].map(l => (
                                    <li key={l}>
                                        <button className="landing-footer-link-btn">{l}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="landing-footer-bottom">
                        <p className="landing-footer-copyright">© 2026 ResearchOS. All rights reserved.</p>
                        <div className="landing-footer-status">
                            <span className="landing-footer-status-dot" />
                            System operational
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
