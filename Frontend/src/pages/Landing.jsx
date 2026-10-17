import { useState, useEffect } from 'react';
import ResearchOSLogo from '../components/ResearchOSLogo';
import './Landing.css';

// REAL VECTOR SVG ICONS

function SparkleIcon({ size = 15, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path
                d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z"
                fill={color}
            />
        </svg>
    );
}

function DatabaseIcon({ size = 20, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}

function FlaskIcon({ size = 20, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31L4.1 19.33A2 2 0 0 0 5.8 22h12.4a2 2 0 0 0 1.7-2.67L14 9.31V2" />
            <path d="M8.5 2h7" />
            <path d="M7 16h10" />
        </svg>
    );
}

function LineageGraphIcon({ size = 20, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="6" r="3" />
            <circle cx="19" cy="6" r="3" />
            <circle cx="12" cy="18" r="3" />
            <line x1="7.5" y1="7.5" x2="10.5" y2="15.5" />
            <line x1="16.5" y1="7.5" x2="13.5" y2="15.5" />
        </svg>
    );
}

function LightningIcon({ size = 20, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}

function ShieldCheckIcon({ size = 20, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function DocumentCheckIcon({ size = 20, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 15l2 2 4-4" />
        </svg>
    );
}

function ChevronDownIcon({ size = 16, className = '' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="6 9 12 15 18 9" />
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

// 1. PRODUCT PILLARS (CORE CAPABILITIES)
const capabilities = [
    {
        icon: <DatabaseIcon size={22} color="#0D9488" />,
        title: 'Dataset Versioning & Lineage',
        desc: 'Snapshot datasets with cryptographic hashes. Compare version splits, inspect file mutations, and roll back anytime with zero storage duplication.',
    },
    {
        icon: <FlaskIcon size={22} color="#0D9488" />,
        title: 'Experiment Tracking',
        desc: 'Log hyperparameters, training telemetry, and output checkpoints. Compare model runs side-by-side with interactive visual metrics.',
    },
    {
        icon: <LineageGraphIcon size={22} color="#0D9488" />,
        title: 'End-to-End Provenance DAGs',
        desc: 'Visualize the exact sequence from raw input data through transformations to model weights. Guarantee 100% deterministic reproducibility.',
    },
    {
        icon: <DocumentCheckIcon size={22} color="#0D9488" />,
        title: 'Publication-Ready Bundles',
        desc: 'Export reproducible Docker packages, BibTeX citation records, and camera-ready figures directly for peer-reviewed publication.',
    },
];

// 2. THE PROBLEM VS THE SOLUTION
const comparisonPoints = [
    {
        problem: 'Ad-hoc folders like dataset_v2_final_final.csv with untracked edits',
        solution: 'Immutable Git-style dataset snapshots with SHA-256 integrity verification',
    },
    {
        problem: 'Lost hyperparameters and training metrics scattered across notebooks',
        solution: '2-line Python SDK telemetry logging saved directly to your workspace',
    },
    {
        problem: 'Unreproducible experiments when reviewers test published code',
        solution: 'Automated provenance DAGs tracking the exact data, code, and weights',
    },
];

// 3. WORKFLOW STEPS
const workflowSteps = [
    {
        step: '01',
        title: 'Register Your Dataset',
        desc: 'Connect raw CSV, Parquet, or image folders. ResearchOS records cryptographic hashes and generates an immutable initial snapshot.',
        code: `import researchos as ros\ndataset = ros.Dataset.register("./data/training_v1")`,
    },
    {
        step: '02',
        title: 'Track Your Experiment Run',
        desc: 'Hook your PyTorch, JAX, or standard script with 2 lines of code. Stream loss curves, parameters, and checkpoints directly.',
        code: `run = ros.init(project="llm-finetuning")\nrun.log({"epoch": 4, "val_loss": 0.142})`,
    },
    {
        step: '03',
        title: 'Audit Provenance & Export',
        desc: 'Review the interactive lineage graph connecting your data to trained weights. Export 1-click reproducible packages for your team.',
        code: `run.export_bundle(output="./reproducible_bundle.zip")`,
    },
];

// 4. FAQ
const faqs = [
    {
        q: 'Which machine learning frameworks does ResearchOS support?',
        a: 'ResearchOS is framework-agnostic. It integrates natively with PyTorch, TensorFlow, JAX, Hugging Face, Scikit-Learn, and standard Python scripts.',
    },
    {
        q: 'How does dataset versioning work without consuming double storage?',
        a: 'We use cryptographic chunking and content-addressable delta trees (similar to Git, but optimized for large tables and tensors), saving only mutated files.',
    },
    {
        q: 'Is ResearchOS suitable for individual researchers as well as teams?',
        a: 'Yes. You can use it as a standalone researcher to keep your work organized and reproducible, or collaborate with lab colleagues in shared workspaces.',
    },
    {
        q: 'Can I run my scripts locally or on our own GPU cluster?',
        a: 'Yes. ResearchOS runs alongside your local environment, SLURM cluster, or cloud GPU instances with minimal setup.',
    },
];

const navLinks = [
    { label: 'Overview', targetId: 'overview-section' },
    { label: 'Capabilities', targetId: 'capabilities-section' },
    { label: 'Workflow', targetId: 'workflow-section' },
    { label: 'FAQ', targetId: 'faq-section' },
];

export default function Landing({ onGetStarted, onLogin }) {
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);
    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('datasets');

    useEffect(() => {
        const el = document.getElementById('landing-root');
        if (!el) return;
        const handler = () => setScrolled(el.scrollTop > 30);
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
        <div id="landing-root" className="landing-light-container">
            {/* Top Navigation */}
            <nav className={`landing-light-nav ${scrolled ? 'nav-scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-brand" onClick={() => scrollToSection('hero')}>
                        <ResearchOSLogo size={32} showWordmark={true} textColor="#0F172A" />
                        <span className="brand-version-pill">Workspace v1.0</span>
                    </div>

                    <div className="nav-links">
                        {navLinks.map((l) => (
                            <button
                                key={l.label}
                                className="nav-link-btn"
                                onClick={() => scrollToSection(l.targetId)}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>

                    <div className="nav-actions">
                        <button onClick={onLogin} className="nav-login-btn">
                            Sign in
                        </button>
                        <button onClick={onGetStarted} className="nav-primary-btn">
                            <span>Get started free</span>
                            <ArrowRightIcon size={14} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section id="hero" className="hero-section">
                <div className="hero-content">
                    {/* Badge */}
                    <div className="hero-pill-badge">
                        <SparkleIcon size={14} color="#0D9488" />
                        <span>Open & Reproducible Scientific Research OS</span>
                    </div>

                    {/* Headline */}
                    <h1 className="hero-title">
                        One unified workspace for your<br />
                        <span className="hero-highlight">datasets, experiments & lineage</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle">
                        Stop losing track of data mutations, training configurations, and experiment metrics. ResearchOS connects your entire ML workflow into a verifiable, reproducible pipeline.
                    </p>

                    {/* CTAs */}
                    <div className="hero-buttons">
                        <button onClick={onGetStarted} className="hero-cta-btn">
                            <span>Create Free Workspace</span>
                            <ArrowRightIcon size={16} />
                        </button>
                        <button onClick={onLogin} className="hero-ghost-btn">
                            <span>Sign in to existing account</span>
                        </button>
                    </div>

                    {/* MEANINGFUL INTERACTIVE PRODUCT WORKSPACE SHOWCASE */}
                    <div className="workspace-preview-card">
                        {/* Card Window Top Bar */}
                        <div className="workspace-window-header">
                            <div className="window-dots">
                                <span className="w-dot dot-1" />
                                <span className="w-dot dot-2" />
                                <span className="w-dot dot-3" />
                            </div>

                            <div className="workspace-tab-nav">
                                <button
                                    className={`ws-tab-btn ${activeWorkspaceTab === 'datasets' ? 'active' : ''}`}
                                    onClick={() => setActiveWorkspaceTab('datasets')}
                                >
                                    <DatabaseIcon size={16} color={activeWorkspaceTab === 'datasets' ? '#0D9488' : '#64748B'} />
                                    <span>Datasets & Versions</span>
                                </button>
                                <button
                                    className={`ws-tab-btn ${activeWorkspaceTab === 'experiments' ? 'active' : ''}`}
                                    onClick={() => setActiveWorkspaceTab('experiments')}
                                >
                                    <FlaskIcon size={16} color={activeWorkspaceTab === 'experiments' ? '#0D9488' : '#64748B'} />
                                    <span>Experiment Runs</span>
                                </button>
                                <button
                                    className={`ws-tab-btn ${activeWorkspaceTab === 'lineage' ? 'active' : ''}`}
                                    onClick={() => setActiveWorkspaceTab('lineage')}
                                >
                                    <LineageGraphIcon size={16} color={activeWorkspaceTab === 'lineage' ? '#0D9488' : '#64748B'} />
                                    <span>Provenance Lineage</span>
                                </button>
                            </div>

                            <div className="window-meta-badge">
                                <span className="meta-indicator" />
                                <span>Project: protein-sequence-v2</span>
                            </div>
                        </div>

                        {/* Card Window Body */}
                        <div className="workspace-window-body">
                            {/* TAB 1: DATASETS PREVIEW */}
                            {activeWorkspaceTab === 'datasets' && (
                                <div className="preview-tab-content">
                                    <div className="preview-content-header">
                                        <div>
                                            <h4 className="preview-title">Dataset Version History: biological_sequences_v3</h4>
                                            <p className="preview-subtitle">Tracked mutations with SHA-256 cryptographic tree hashes</p>
                                        </div>
                                        <span className="preview-status-tag">3 Snapshots Recorded</span>
                                    </div>

                                    <div className="preview-table-container">
                                        <table className="preview-table">
                                            <thead>
                                                <tr>
                                                    <th>Version</th>
                                                    <th>Cryptographic Hash</th>
                                                    <th>Changes / Mutation</th>
                                                    <th>Records</th>
                                                    <th>Created</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <span className="version-pill pill-latest">v3.0 (Latest)</span>
                                                    </td>
                                                    <td className="font-mono text-teal">sha256:7f9a2c...</td>
                                                    <td>Added 4,200 deduplicated sequences & normalized embeddings</td>
                                                    <td>184,200</td>
                                                    <td>Today, 14:22</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span className="version-pill">v2.1</span>
                                                    </td>
                                                    <td className="font-mono">sha256:3d81be...</td>
                                                    <td>Filtered out NaN values & invalid sequence lengths (&lt;10bp)</td>
                                                    <td>180,000</td>
                                                    <td>Yesterday</td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span className="version-pill pill-initial">v1.0 (Raw)</span>
                                                    </td>
                                                    <td className="font-mono">sha256:1a4f09...</td>
                                                    <td>Initial ingestion from raw fasta repository</td>
                                                    <td>192,450</td>
                                                    <td>3 days ago</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: EXPERIMENT RUNS PREVIEW */}
                            {activeWorkspaceTab === 'experiments' && (
                                <div className="preview-tab-content">
                                    <div className="preview-content-header">
                                        <div>
                                            <h4 className="preview-title">Experiment Runs Comparison</h4>
                                            <p className="preview-subtitle">Comparing parameter sweeps and validation loss across runs</p>
                                        </div>
                                        <span className="preview-status-tag">Telemetry Synced</span>
                                    </div>

                                    <div className="preview-table-container">
                                        <table className="preview-table">
                                            <thead>
                                                <tr>
                                                    <th>Run ID</th>
                                                    <th>Model Architecture</th>
                                                    <th>Learning Rate</th>
                                                    <th>Batch Size</th>
                                                    <th>Val Loss</th>
                                                    <th>Top-1 Accuracy</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="font-mono text-teal font-bold">#exp-084</td>
                                                    <td>Transformer (12 layers, 768d)</td>
                                                    <td>2e-4 (Cosine)</td>
                                                    <td>64</td>
                                                    <td className="text-green font-bold">0.142 ↓</td>
                                                    <td className="font-bold">94.8%</td>
                                                    <td><span className="status-badge badge-completed">Completed</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono">#exp-083</td>
                                                    <td>Transformer (8 layers, 512d)</td>
                                                    <td>5e-4 (Linear)</td>
                                                    <td>32</td>
                                                    <td>0.198</td>
                                                    <td>91.2%</td>
                                                    <td><span className="status-badge badge-completed">Completed</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="font-mono">#exp-082</td>
                                                    <td>Baseline LSTM (Bi-directional)</td>
                                                    <td>1e-3 (Step)</td>
                                                    <td>32</td>
                                                    <td>0.312</td>
                                                    <td>84.5%</td>
                                                    <td><span className="status-badge badge-archived">Archived</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: PROVENANCE LINEAGE PREVIEW */}
                            {activeWorkspaceTab === 'lineage' && (
                                <div className="preview-tab-content">
                                    <div className="preview-content-header">
                                        <div>
                                            <h4 className="preview-title">Provenance DAG: Full Reproducibility Chain</h4>
                                            <p className="preview-subtitle">Connected graph linking raw data source to trained checkpoint</p>
                                        </div>
                                        <span className="preview-status-tag tag-verified">Verified Deterministic</span>
                                    </div>

                                    <div className="preview-lineage-flow">
                                        <div className="lineage-step-card">
                                            <div className="step-tag">1. INPUT DATA</div>
                                            <div className="step-title">raw_sequences.fasta</div>
                                            <div className="step-hash">sha256:1a4f09...</div>
                                        </div>

                                        <div className="lineage-arrow-box">
                                            <span className="lineage-line" />
                                            <ArrowRightIcon size={14} />
                                        </div>

                                        <div className="lineage-step-card">
                                            <div className="step-tag">2. TRANSFORM</div>
                                            <div className="step-title">clean_tokenize.py</div>
                                            <div className="step-hash">commit: #4e81a9</div>
                                        </div>

                                        <div className="lineage-arrow-box">
                                            <span className="lineage-line" />
                                            <ArrowRightIcon size={14} />
                                        </div>

                                        <div className="lineage-step-card step-active">
                                            <div className="step-tag tag-active">3. MODEL RUN</div>
                                            <div className="step-title">run_exp_084</div>
                                            <div className="step-hash">val_loss: 0.142</div>
                                        </div>

                                        <div className="lineage-arrow-box">
                                            <span className="lineage-line" />
                                            <ArrowRightIcon size={14} />
                                        </div>

                                        <div className="lineage-step-card step-final">
                                            <div className="step-tag tag-final">4. CHECKPOINT</div>
                                            <div className="step-title">model_weights.pt</div>
                                            <div className="step-hash">Docker Lockfile Ready</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: PROBLEM VS SOLUTION (AUTHENTIC VALUE) */}
            <section id="overview-section" className="section-padded bg-light-alt">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-micro-badge">WHY WE BUILT RESEARCHOS</span>
                        <h2 className="section-heading">Built to solve real research friction</h2>
                        <p className="section-subheading">
                            Modern machine learning research is messy. ResearchOS brings structure and clarity to your workspace.
                        </p>
                    </div>

                    <div className="comparison-cards-grid">
                        {comparisonPoints.map((item, idx) => (
                            <div key={idx} className="comparison-card">
                                <div className="card-problem-side">
                                    <div className="side-label label-problem">Without ResearchOS</div>
                                    <p className="side-text">{item.problem}</p>
                                </div>
                                <div className="card-divider-icon">
                                    <ArrowRightIcon size={16} />
                                </div>
                                <div className="card-solution-side">
                                    <div className="side-label label-solution">With ResearchOS</div>
                                    <p className="side-text text-solution">{item.solution}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: CORE CAPABILITIES */}
            <section id="capabilities-section" className="section-padded">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-micro-badge">CORE CAPABILITIES</span>
                        <h2 className="section-heading">Everything needed to organize your lab</h2>
                        <p className="section-subheading">
                            Designed specifically for researchers, engineers, and teams building machine learning systems.
                        </p>
                    </div>

                    <div className="capabilities-grid">
                        {capabilities.map((cap) => (
                            <div key={cap.title} className="capability-card">
                                <div className="capability-icon-wrap">
                                    {cap.icon}
                                </div>
                                <h3 className="capability-title">{cap.title}</h3>
                                <p className="capability-desc">{cap.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: WORKFLOW */}
            <section id="workflow-section" className="section-padded bg-light-alt">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-micro-badge">HOW IT WORKS</span>
                        <h2 className="section-heading">Integrates seamlessly in 3 simple steps</h2>
                        <p className="section-subheading">
                            Use the web interface or hook directly into your Python scripts.
                        </p>
                    </div>

                    <div className="workflow-steps-row">
                        {workflowSteps.map((w) => (
                            <div key={w.step} className="workflow-step-box">
                                <div className="step-num-badge">{w.step}</div>
                                <h3 className="step-box-title">{w.title}</h3>
                                <p className="step-box-desc">{w.desc}</p>
                                <div className="step-code-preview">
                                    <code>{w.code}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: FAQ */}
            <section id="faq-section" className="section-padded">
                <div className="section-container max-w-narrow">
                    <div className="section-header">
                        <span className="section-micro-badge">QUESTIONS & ANSWERS</span>
                        <h2 className="section-heading">Frequently Asked Questions</h2>
                        <p className="section-subheading">
                            Common questions about formats, environments, and usage.
                        </p>
                    </div>

                    <div className="faq-list">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div
                                    key={faq.q}
                                    className={`faq-card ${isOpen ? 'active' : ''}`}
                                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                                >
                                    <div className="faq-question-bar">
                                        <h4 className="faq-question-text">{faq.q}</h4>
                                        <div className={`faq-chevron-icon ${isOpen ? 'rotated' : ''}`}>
                                            <ChevronDownIcon size={18} />
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="faq-answer-box">
                                            <p>{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* SECTION 6: CTA */}
            <section className="cta-banner-section">
                <div className="cta-banner-inner">
                    <h2 className="cta-banner-title">Start organizing your research today</h2>
                    <p className="cta-banner-desc">
                        Create your workspace and start versioning datasets and experiment telemetry in minutes.
                    </p>
                    <div className="cta-banner-actions">
                        <button onClick={onGetStarted} className="hero-cta-btn">
                            <span>Get started free</span>
                            <ArrowRightIcon size={16} />
                        </button>
                        <button onClick={onLogin} className="hero-ghost-btn-dark">
                            <span>Sign in</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-light-footer">
                <div className="footer-container">
                    <div className="footer-top-row">
                        <div className="footer-brand-info">
                            <ResearchOSLogo size={28} showWordmark={true} textColor="#0F172A" />
                            <p className="footer-brand-text">
                                The open operating system for machine learning research, dataset versioning, and deterministic provenance.
                            </p>
                        </div>

                        <div className="footer-nav-col">
                            <h5 className="footer-col-header">Platform</h5>
                            <button className="footer-nav-link" onClick={() => scrollToSection('overview-section')}>Overview</button>
                            <button className="footer-nav-link" onClick={() => scrollToSection('capabilities-section')}>Capabilities</button>
                            <button className="footer-nav-link" onClick={() => scrollToSection('workflow-section')}>Workflow</button>
                            <button className="footer-nav-link" onClick={() => scrollToSection('faq-section')}>FAQ</button>
                        </div>

                        <div className="footer-nav-col">
                            <h5 className="footer-col-header">Account</h5>
                            <button className="footer-nav-link" onClick={onLogin}>Sign in</button>
                            <button className="footer-nav-link" onClick={onGetStarted}>Create workspace</button>
                        </div>
                    </div>

                    <div className="footer-bottom-row">
                        <span className="copyright-text">© 2026 ResearchOS. All rights reserved.</span>
                        <div className="footer-system-pill">
                            <span className="pill-dot" />
                            <span>System active</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
