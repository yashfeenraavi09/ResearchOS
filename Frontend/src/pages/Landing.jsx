import { useState, useEffect, useRef } from 'react';
import ResearchOSLogo from '../components/ResearchOSLogo';
import './Landing.css';

/* ─────────────────────────────────────────────────────────────────────────────
   CRISP SVG ICONS (100% vector, zero emojis)
───────────────────────────────────────────────────────────────────────────── */
function SparkleIcon({ size = 15, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z" fill={color} />
        </svg>
    );
}

function DatabaseIcon({ size = 20, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    );
}

function FlaskIcon({ size = 20, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31L4.1 19.33A2 2 0 0 0 5.8 22h12.4a2 2 0 0 0 1.7-2.67L14 9.31V2" />
            <path d="M8.5 2h7" />
            <path d="M7 16h10" />
        </svg>
    );
}

function LineageGraphIcon({ size = 20, color = 'currentColor' }) {
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

function DocumentCheckIcon({ size = 20, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 15l2 2 4-4" />
        </svg>
    );
}

function ArrowRightIcon({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

function ChevronDownIcon({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function CheckIcon({ size = 14, color = '#0D9488' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function CpuIcon({ size = 20, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
        </svg>
    );
}

function ShieldCheckIcon({ size = 20, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}

function TerminalIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
    );
}

function CopyIcon({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

function PlayIcon({ size = 14, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}

function LayersIcon({ size = 20, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────────────────────────── */
const navLinks = [
    { label: 'Overview', targetId: 'overview-section' },
    { label: 'Capabilities', targetId: 'capabilities-section' },
    { label: 'How it works', targetId: 'workflow-section' },
    { label: 'FAQ', targetId: 'faq-section' },
];

const liveTickerItems = [
    { type: 'telemetry', text: 'Experiment #exp-084 converged at step 14,200', badge: 'VAL LOSS 0.142 ↓' },
    { type: 'snapshot', text: 'Dataset snapshot recorded: biological_sequences_v3.parquet', badge: 'SHA-256 7f9a2c' },
    { type: 'lineage', text: 'Deterministic Provenance DAG compiled for NeurIPS submission', badge: '100% REPRODUCIBLE' },
    { type: 'cluster', text: 'Cluster Stanford-HPC-04 telemetry synced across 4x A100', badge: '0.8ms LATENCY' },
];

const comparisonPoints = [
    {
        problem: 'Ad-hoc folders like dataset_v2_final_clean.csv with untracked row alterations',
        solution: 'Immutable Git-style dataset snapshots with SHA-256 cryptographic content-addressing',
        badge: 'Zero Storage Duplication',
    },
    {
        problem: 'Lost hyperparameters, unsynced checkpoints, and forgotten random seeds',
        solution: 'Sub-millisecond Python telemetry recording loss curves, checkpoints, and hardware metrics',
        badge: '2-Line SDK Integration',
    },
    {
        problem: 'Unreproducible experiments when peer reviewers or team members test code',
        solution: 'Automated provenance DAG linking the exact dataset commit to trained model weights',
        badge: 'Deterministic Reproducibility',
    },
];

const workflowSteps = [
    {
        num: '01',
        icon: <DatabaseIcon size={20} color="#0D9488" />,
        title: 'Register Your Dataset',
        subtitle: 'Cryptographic snapshot & versioning',
        desc: 'Connect raw CSV, Parquet, or image directories. ResearchOS computes SHA-256 Merkle tree hashes and saves an immutable snapshot with delta-compression.',
        code: `import researchos as ros

# Register raw dataset directory
dataset = ros.Dataset.register(
    path="./data/protein_sequences_v3",
    name="protein-seq-clean",
    version="v3.0"
)
print(f"Snapshot SHA-256: {dataset.hash}")`,
        highlight: [3, 4, 5],
    },
    {
        num: '02',
        icon: <FlaskIcon size={20} color="#6366F1" />,
        title: 'Track Your Experiment Run',
        subtitle: 'Automatic telemetry & model checkpoints',
        desc: 'Hook PyTorch, JAX, or any script with 2 lines of code. Loss curves, hyperparameters, and model checkpoints stream live into your local workspace.',
        code: `run = ros.init(
    project="transformer-fold",
    dataset=dataset.version("v3.0")
)

# Stream training telemetry
for epoch in range(10):
    loss = model.train_step(batch)
    run.log({"epoch": epoch, "val_loss": loss, "lr": 2e-4})

run.save_checkpoint("./checkpoints/best.pt")`,
        highlight: [1, 8],
    },
    {
        num: '03',
        icon: <LineageGraphIcon size={20} color="#0284C7" />,
        title: 'Audit Provenance & Export',
        subtitle: '1-click peer-review reproduction bundle',
        desc: 'Review the visual DAG connecting raw data directly to model checkpoints. Generate self-contained reproduction bundles with Docker, conda envs, and BibTeX citations.',
        code: `lineage = ros.Lineage.build(run)

# Export one-click bundle for paper submission
bundle = lineage.export_bundle(
    output="./artifacts/neurips_bundle.zip",
    include=["docker", "bibtex", "weights", "environment"]
)
print("Reproduction bundle verified: 100% deterministic")`,
        highlight: [3, 4, 5],
    },
];

const faqs = [
    {
        q: 'Which machine learning frameworks does ResearchOS support?',
        a: 'ResearchOS is completely framework-agnostic. It works out-of-the-box with PyTorch, TensorFlow, JAX, Hugging Face Transformers, Scikit-Learn, Ray, and standard Python scripts.',
        category: 'Compatibility',
    },
    {
        q: 'How does dataset versioning work without multiplying storage costs?',
        a: 'We implement content-addressable delta chunking (similar to Git, but optimized for large binary tensors and tabular datasets). When you modify 500 rows in a 10M row table, only the modified byte blocks are stored.',
        category: 'Storage',
    },
    {
        q: 'Can I run my scripts locally or on our university / lab GPU cluster?',
        a: 'Yes. ResearchOS runs seamlessly in local virtual environments, Docker containers, SLURM university clusters, or cloud instances (AWS, GCP, Lambda Labs) with zero network lock-in.',
        category: 'Infrastructure',
    },
    {
        q: 'How does ResearchOS guarantee experiment reproducibility?',
        a: 'Each experiment run links the immutable SHA-256 hash of the input dataset, the exact Git commit of your source code, random seeds, hardware environment specifications, and hyperparameter configs into an auditable DAG.',
        category: 'Lineage',
    },
    {
        q: 'Can I export reproducible artifacts for peer review or journal submissions?',
        a: 'Yes. With one click, ResearchOS generates a standalone reproduction bundle containing the code snapshot, dataset slice, environment lockfile, model weights, and formatted BibTeX citation.',
        category: 'Publishing',
    },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HERO INTERACTIVE GEOMETRIC VECTOR GRID & LINEAGE BADGES
   Sleek Linear/Vercel-style blueprint grid with crosshairs and
   interactive floating research lineage telemetry badges.
───────────────────────────────────────────────────────────────────────────── */
function HeroGeometricGrid() {
    return (
        <div className="hero-grid-pattern-wrap" aria-hidden="true">
            <svg className="hero-svg-grid" width="100%" height="100%">
                <defs>
                    <pattern id="geometric-vector-grid" width="56" height="56" patternUnits="userSpaceOnUse">
                        <path d="M 56 0 L 0 0 0 56" fill="none" stroke="rgba(203, 213, 225, 0.45)" strokeWidth="0.75" />
                        <path d="M 28 24 L 28 32 M 24 28 L 32 28" fill="none" stroke="rgba(148, 163, 184, 0.4)" strokeWidth="0.8" />
                        <circle cx="0" cy="0" r="1.5" fill="rgba(148, 163, 184, 0.35)" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#geometric-vector-grid)" />
            </svg>
            <div className="hero-grid-radial-mask" />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOM SCIENTIFIC PRECISION RETICLE CURSOR
───────────────────────────────────────────────────────────────────────────── */
function CustomCursor() {
    const [pos, setPos] = useState({ x: -100, y: -100 });
    const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let reqId;
        let targetX = -100;
        let targetY = -100;
        let curX = -100;
        let curY = -100;

        const onMouseMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            setPos({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);

            const target = e.target;
            const isClickable = target && target.closest('button, a, input, select, textarea, [role="button"], .showcase-tab-btn, .workflow-tab-btn, .faq-card, .matrix-card, .framework-pill, .nav-brand');
            setIsHovering(Boolean(isClickable));
        };

        const onMouseDown = () => setIsClicking(true);
        const onMouseUp = () => setIsClicking(false);
        const onMouseLeave = () => setIsVisible(false);

        const loop = () => {
            curX += (targetX - curX) * 0.22;
            curY += (targetY - curY) * 0.22;
            setTrailingPos({ x: curX, y: curY });
            reqId = requestAnimationFrame(loop);
        };
        reqId = requestAnimationFrame(loop);

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mouseleave', onMouseLeave);

        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="site-custom-cursor-root" aria-hidden="true">
            <div
                className={`custom-cursor-dot ${isClicking ? 'dot-clicking' : ''}`}
                style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${isClicking ? 0.65 : 1})` }}
            />
            <div
                className={`custom-cursor-ring ${isHovering ? 'ring-hovering' : ''} ${isClicking ? 'ring-clicking' : ''}`}
                style={{ transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0) scale(${isClicking ? 0.85 : 1})` }}
            >
                <span className="reticle-tick tick-top" />
                <span className="reticle-tick tick-bottom" />
                <span className="reticle-tick tick-left" />
                <span className="reticle-tick tick-right" />
            </div>
        </div>
    );
}

function SimulatedAutoCursor({ position, isClicking, label = 'Auto-Demo' }) {
    if (!position || !position.visible) return null;
    return (
        <div
            className={`auto-agent-cursor ${isClicking ? 'agent-clicking' : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`
            }}
            aria-hidden="true"
        >
            <div className="agent-cursor-head">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 3L11 21L14.5 13.5L22 10L4 3Z" fill="#0D9488" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round" />
                </svg>
            </div>
            {isClicking && <div className="agent-click-ripple" />}
            <div className="agent-cursor-tag">
                <span className="agent-tag-dot" />
                <span>{label}</span>
            </div>
        </div>
    );
}

function EnhancedCapabilitiesSection() {
    const [activeFeatureTab, setActiveFeatureTab] = useState(0);
    const [sliderStorage, setSliderStorage] = useState(78);
    const [selectedFramework, setSelectedFramework] = useState('pytorch');
    const [copiedBibtex, setCopiedBibtex] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [agentCursor, setAgentCursor] = useState({ x: 0, y: 0, visible: false, isClicking: false });

    const tabBarRef = useRef(null);
    const tabRefs = useRef([]);

    // Auto-cycle feature tabs with dynamic simulated cursor
    useEffect(() => {
        if (isHovered) {
            setAgentCursor((prev) => ({ ...prev, visible: false }));
            return;
        }

        const interval = setInterval(() => {
            const nextIdx = (activeFeatureTab + 1) % 4;
            const targetBtn = tabRefs.current[nextIdx];
            const bar = tabBarRef.current;

            if (targetBtn && bar) {
                const barRect = bar.getBoundingClientRect();
                const btnRect = targetBtn.getBoundingClientRect();
                const targetX = btnRect.left - barRect.left + btnRect.width / 2;
                const targetY = btnRect.top - barRect.top + btnRect.height / 2;

                setAgentCursor({ x: targetX, y: targetY, visible: true, isClicking: false });

                setTimeout(() => {
                    setAgentCursor({ x: targetX, y: targetY, visible: true, isClicking: true });
                    setActiveFeatureTab(nextIdx);

                    setTimeout(() => {
                        setAgentCursor((prev) => ({ ...prev, isClicking: false }));
                    }, 350);
                }, 650);
            } else {
                setActiveFeatureTab(nextIdx);
            }
        }, 4400);

        return () => clearInterval(interval);
    }, [activeFeatureTab, isHovered]);

    const featureTabs = [
        {
            id: 0,
            icon: <DatabaseIcon size={18} color="#0D9488" />,
            title: 'Immutable Dataset Versioning',
            tag: 'Core Engine',
            desc: 'Git-style content-addressed snapshots with cryptographic SHA-256 tree verification. Track every data mutation without duplicating disk space.',
            bullets: [
                'Zero-overhead delta chunking saves up to 80% storage',
                'Cryptographic Merkle hashes guarantee raw data integrity',
                'One-click instant rollback to any historical version',
                'Works with CSV, Parquet, FASTA, images, and NumPy arrays',
            ],
        },
        {
            id: 1,
            icon: <FlaskIcon size={18} color="#6366F1" />,
            title: 'Real-time Experiment Telemetry',
            tag: 'Sub-millisecond Logging',
            desc: 'Stream loss curves, learning rates, system hardware utilization, and weight checkpoints in real-time from PyTorch, JAX, or Hugging Face.',
            bullets: [
                'Automatic hardware logging (GPU VRAM, temperature, compute %)',
                'Sub-millisecond telemetry overhead via asynchronous workers',
                'Side-by-side run comparison matrix with automatic parameter diffs',
                'Automatic checkpoint preservation on validation loss minima',
            ],
        },
        {
            id: 2,
            icon: <LineageGraphIcon size={18} color="#0284C7" />,
            title: 'Deterministic Provenance DAGs',
            tag: 'Audit-ready Integrity',
            desc: 'Every checkpoint is cryptographically bound to the exact dataset version, code commit, hyperparameters, and environment specifications.',
            bullets: [
                'Interactive visual dependency graph from raw data to model weights',
                '100% audit trail compliance for peer review and clinical trials',
                'Instant detection of data drift or missing upstream dependencies',
                'Exportable as publication figures (SVG, PDF, PNG)',
            ],
        },
        {
            id: 3,
            icon: <DocumentCheckIcon size={18} color="#059669" />,
            title: 'Publication Reproducibility Bundles',
            tag: 'Peer-review Ready',
            desc: 'Export self-contained reproducible packages for journals, reviewers, and teammates. Includes environment lockfiles, BibTeX, and verification seals.',
            bullets: [
                'One-click packaging into Docker containers and Conda lockfiles',
                'Auto-formatted BibTeX citations and permanent artifact hashes',
                'Zero-configuration reproduction script for reviewers',
                'Meets ACM, IEEE, NeurIPS, and ICML artifact evaluation standards',
            ],
        },
    ];

    const frameworkSnippets = {
        pytorch: `# PyTorch Integration
import researchos as ros
run = ros.init(project="protein-folding")
for epoch, (x, y) in enumerate(dataloader):
    loss = criterion(model(x), y)
    run.log({"epoch": epoch, "loss": loss.item()})`,
        jax: `# JAX / Flax Integration
import researchos as ros
run = ros.init(project="jax-diffusion")
state, metrics = train_step(state, batch)
run.log({"step": state.step, "loss": metrics["loss"]})`,
        huggingface: `# Hugging Face Transformers
from researchos.integrations.hf import ROSCallback
trainer = Trainer(
    model=model,
    args=training_args,
    callbacks=[ROSCallback(project="llm-tune")]
)`,
        sklearn: `# Scikit-Learn Integration
import researchos as ros
ros.sklearn.autolog()
model.fit(X_train, y_train) # Automatic hyperparameter & metric capture`,
    };

    const handleCopyBibtex = () => {
        setCopiedBibtex(true);
        navigator.clipboard?.writeText(`@article{researchos2026,
  title={ResearchOS: Deterministic Machine Learning Provenance and Versioning},
  author={ResearchOS Collaborative Team},
  journal={arXiv preprint arXiv:2604.0842},
  year={2026}
}`);
        setTimeout(() => setCopiedBibtex(false), 2000);
    };

    return (
        <div className="capabilities-wrapper" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {/* ── PART A: Interactive Flagship Showcase (Apple / Stripe style) ── */}
            <div className="capability-showcase-container">
                {/* Horizontal Tab Selector */}
                <div className="showcase-tab-bar" ref={tabBarRef}>
                    <SimulatedAutoCursor position={agentCursor} isClicking={agentCursor.isClicking} label="Switching Tab" />
                    {featureTabs.map((tab, idx) => (
                        <button
                            key={tab.id}
                            ref={(el) => (tabRefs.current[idx] = el)}
                            className={`showcase-tab-btn ${activeFeatureTab === idx ? 'stab-active' : ''}`}
                            onClick={() => {
                                setActiveFeatureTab(idx);
                                setAgentCursor((prev) => ({ ...prev, visible: false }));
                            }}
                        >
                            <span className="stab-icon">{tab.icon}</span>
                            <span className="stab-title">{tab.title}</span>
                            <span className="stab-tag">{tab.tag}</span>
                        </button>
                    ))}
                </div>

                {/* Showcase Interactive Canvas (Split panel) */}
                <div className="showcase-body-panel">
                    <div className="showcase-left-info">
                        <div className="showcase-badge">
                            <span className="badge-bullet" />
                            <span>{featureTabs[activeFeatureTab].tag}</span>
                        </div>
                        <h3 className="showcase-heading">{featureTabs[activeFeatureTab].title}</h3>
                        <p className="showcase-description">{featureTabs[activeFeatureTab].desc}</p>
                        <div className="showcase-bullets-list">
                            {featureTabs[activeFeatureTab].bullets.map((b, i) => (
                                <div key={i} className="bullet-row">
                                    <div className="bullet-check"><CheckIcon size={13} color="#0D9488" /></div>
                                    <span className="bullet-text">{b}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="showcase-right-demo">
                        {/* Dynamic Interactive Demo per Tab */}
                        {activeFeatureTab === 0 && (
                            <div className="demo-card demo-versioning">
                                <div className="demo-header">
                                    <div className="demo-header-title">
                                        <DatabaseIcon size={16} color="#0D9488" />
                                        <span>Merkle Snapshot Inspector</span>
                                    </div>
                                    <span className="demo-status-pill">Delta Compressed</span>
                                </div>
                                <div className="demo-version-scrubber">
                                    <div className="scrubber-label">ACTIVE SNAPSHOT TIMELINE:</div>
                                    <div className="scrubber-nodes">
                                        <div className="scrubber-node passed">
                                            <span className="snode-circle">✓</span>
                                            <span className="snode-name">v1.0 (Raw)</span>
                                        </div>
                                        <div className="scrubber-line passed-line" />
                                        <div className="scrubber-node passed">
                                            <span className="snode-circle">✓</span>
                                            <span className="snode-name">v2.1 (Filtered)</span>
                                        </div>
                                        <div className="scrubber-line active-line" />
                                        <div className="scrubber-node current">
                                            <span className="snode-circle pulse">3</span>
                                            <span className="snode-name text-teal">v3.0 (Latest)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="demo-diff-box">
                                    <div className="diff-header font-mono">
                                        <span>Diff vs v2.1: +4,200 rows added · 0 duplicated blocks</span>
                                    </div>
                                    <div className="diff-lines font-mono">
                                        <div className="diff-line plus">+ seq_id: 84920 | len: 512 | hash: 3a2e91 (Normalized)</div>
                                        <div className="diff-line plus">+ seq_id: 84921 | len: 384 | hash: 9d10fb (Normalized)</div>
                                        <div className="diff-line minus">- seq_id: 12042 | len: NaN | [Removed: invalid tail]</div>
                                    </div>
                                </div>

                                <div className="demo-footer-metric">
                                    <span className="metric-highlight font-mono">4.8 GB</span>
                                    <span className="metric-caption">Storage saved on this snapshot alone via content hashing</span>
                                </div>
                            </div>
                        )}

                        {activeFeatureTab === 1 && (
                            <div className="demo-card demo-telemetry">
                                <div className="demo-header">
                                    <div className="demo-header-title">
                                        <FlaskIcon size={16} color="#6366F1" />
                                        <span>Live Telemetry Stream</span>
                                    </div>
                                    <span className="demo-status-pill text-indigo">Sub-1ms Ping</span>
                                </div>

                                <div className="telemetry-demo-gauges">
                                    <div className="gauge-item">
                                        <span className="gauge-label">GPU COMPUTE</span>
                                        <div className="gauge-bar-track">
                                            <div className="gauge-bar-fill" style={{ width: '94%', background: '#6366F1' }} />
                                        </div>
                                        <span className="gauge-num font-mono">94.2%</span>
                                    </div>
                                    <div className="gauge-item">
                                        <span className="gauge-label">VRAM UTILIZATION</span>
                                        <div className="gauge-bar-track">
                                            <div className="gauge-bar-fill" style={{ width: '76%', background: '#0D9488' }} />
                                        </div>
                                        <span className="gauge-num font-mono">18.4 / 24 GB</span>
                                    </div>
                                </div>

                                <div className="demo-run-card">
                                    <div className="run-card-top">
                                        <span className="run-id font-mono">#exp-084: Transformer-12L</span>
                                        <span className="run-tag-pill">Target Accuracy Met</span>
                                    </div>
                                    <div className="run-metrics-grid font-mono">
                                        <div><span className="sub-key">val_loss:</span> <span className="text-teal font-bold">0.142</span></div>
                                        <div><span className="sub-key">lr:</span> 2.0e-4</div>
                                        <div><span className="sub-key">batch:</span> 64</div>
                                        <div><span className="sub-key">step:</span> 14,200</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeFeatureTab === 2 && (
                            <div className="demo-card demo-lineage">
                                <div className="demo-header">
                                    <div className="demo-header-title">
                                        <LineageGraphIcon size={16} color="#0284C7" />
                                        <span>Interactive Provenance Chain</span>
                                    </div>
                                    <span className="demo-status-pill text-blue">DAG Verified</span>
                                </div>
                                <div className="mini-interactive-dag">
                                    <div className="dag-step-pill">
                                        <span className="pill-type">RAW DATA</span>
                                        <span className="pill-val font-mono">sequences_v3</span>
                                    </div>
                                    <div className="dag-flow-arrow">➔</div>
                                    <div className="dag-step-pill">
                                        <span className="pill-type">TOKENIZER</span>
                                        <span className="pill-val font-mono">bpe_vocab_32k</span>
                                    </div>
                                    <div className="dag-flow-arrow">➔</div>
                                    <div className="dag-step-pill pill-selected">
                                        <span className="pill-type">TRAINING</span>
                                        <span className="pill-val font-mono">exp-084</span>
                                    </div>
                                    <div className="dag-flow-arrow">➔</div>
                                    <div className="dag-step-pill pill-final">
                                        <span className="pill-type">WEIGHTS</span>
                                        <span className="pill-val font-mono">checkpoint.pt</span>
                                    </div>
                                </div>
                                <div className="dag-verify-box font-mono">
                                    <span className="verify-icon">🔒</span>
                                    <span>Merkle root: sha256:9f81a742... · Zero upstream drift detected</span>
                                </div>
                            </div>
                        )}

                        {activeFeatureTab === 3 && (
                            <div className="demo-card demo-publish">
                                <div className="demo-header">
                                    <div className="demo-header-title">
                                        <DocumentCheckIcon size={16} color="#059669" />
                                        <span>Reproduction Artifact Package</span>
                                    </div>
                                    <span className="demo-status-pill text-green">Export Ready</span>
                                </div>
                                <div className="package-manifest">
                                    <div className="manifest-item">
                                        <span className="manifest-icon font-mono">📦</span>
                                        <span className="manifest-name font-mono">Dockerfile (CUDA 12.2 + PyTorch 2.4)</span>
                                        <span className="manifest-status font-mono">✓ Sealed</span>
                                    </div>
                                    <div className="manifest-item">
                                        <span className="manifest-icon font-mono">📄</span>
                                        <span className="manifest-name font-mono">requirements.lock.txt (Pinned hashes)</span>
                                        <span className="manifest-status font-mono">✓ Sealed</span>
                                    </div>
                                    <div className="manifest-item">
                                        <span className="manifest-icon font-mono">⚖️</span>
                                        <span className="manifest-name font-mono">random_seeds_spec.json (Deterministic)</span>
                                        <span className="manifest-status font-mono">✓ Sealed</span>
                                    </div>
                                </div>
                                <div className="bibtex-copy-box">
                                    <span className="bibtex-preview font-mono">@article&#123;researchos2026, ...&#125;</span>
                                    <button className="copy-bib-btn" onClick={handleCopyBibtex}>
                                        <CopyIcon size={12} />
                                        <span>{copiedBibtex ? 'Copied BibTeX!' : 'Copy BibTeX'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── PART B: Dynamic Modern Micro-Demo Matrix (Not just boring boxes!) ── */}
            <div className="dynamic-matrix-grid">
                {/* Card 1: Delta Storage Interactive Calculator */}
                <div className="matrix-card">
                    <div className="matrix-card-header">
                        <div className="matrix-icon-box teal-box">
                            <DatabaseIcon size={20} color="#0D9488" />
                        </div>
                        <span className="matrix-tag">STORAGE EFFICIENCY</span>
                    </div>
                    <h4 className="matrix-title">Content-Addressed Delta Chunking</h4>
                    <p className="matrix-desc">
                        Store thousands of dataset versions without exploding cloud storage costs. Adjust the slider to see deduplication savings:
                    </p>
                    <div className="interactive-slider-box">
                        <div className="slider-row">
                            <span className="slider-label">Dataset Mutation Volume:</span>
                            <span className="slider-val font-mono">{sliderStorage}% Delta</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="90"
                            value={sliderStorage}
                            onChange={(e) => setSliderStorage(Number(e.target.value))}
                            className="ros-slider"
                        />
                        <div className="slider-result">
                            <span className="savings-label">Storage Saved:</span>
                            <span className="savings-highlight font-mono font-bold text-teal">
                                {(100 - sliderStorage * 0.25).toFixed(1)}% Disk Saved
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Framework Native Interactive Switcher */}
                <div className="matrix-card">
                    <div className="matrix-card-header">
                        <div className="matrix-icon-box indigo-box">
                            <TerminalIcon size={20} color="#6366F1" />
                        </div>
                        <span className="matrix-tag">INTEGRATIONS</span>
                    </div>
                    <h4 className="matrix-title">Framework Agnostic Python SDK</h4>
                    <p className="matrix-desc">Works seamlessly with your preferred scientific stack. Click to view the 2-line hook:</p>

                    <div className="framework-pills-row">
                        {['pytorch', 'jax', 'huggingface', 'sklearn'].map((fw) => (
                            <button
                                key={fw}
                                className={`framework-pill ${selectedFramework === fw ? 'fw-active' : ''}`}
                                onClick={() => setSelectedFramework(fw)}
                            >
                                {fw.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="framework-code-snippet">
                        <pre className="fw-code font-mono">
                            <code>{frameworkSnippets[selectedFramework]}</code>
                        </pre>
                    </div>
                </div>

                {/* Card 3: Multi-Researcher Collaborative Workspaces */}
                <div className="matrix-card">
                    <div className="matrix-card-header">
                        <div className="matrix-icon-box blue-box">
                            <ShieldCheckIcon size={20} color="#0284C7" />
                        </div>
                        <span className="matrix-tag">COLLABORATION</span>
                    </div>
                    <h4 className="matrix-title">Role-Based Lab Workspaces</h4>
                    <p className="matrix-desc">Share datasets, compare experiment runs across lab members, and enforce immutable reproducibility policies.</p>
                    <div className="collaborator-presence-card">
                        <div className="collab-row">
                            <div className="collab-avatar av-1">EK</div>
                            <div className="collab-info">
                                <span className="collab-name">Dr. Elena K. (Lead PI)</span>
                                <span className="collab-action">Approved Snapshot v3.0</span>
                            </div>
                            <span className="collab-time font-mono">2m ago</span>
                        </div>
                        <div className="collab-row">
                            <div className="collab-avatar av-2">MT</div>
                            <div className="collab-info">
                                <span className="collab-name">Marcus T. (PhD Candidate)</span>
                                <span className="collab-action">Running Exp #84 on HPC</span>
                            </div>
                            <span className="collab-status-dot" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   INTERACTIVE WORKFLOW SECTION
───────────────────────────────────────────────────────────────────────────── */
function WorkflowTimeline() {
    const [active, setActive] = useState(0);
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [agentCursor, setAgentCursor] = useState({ x: 0, y: 0, visible: false, isClicking: false });

    const stepBarRef = useRef(null);
    const stepRefs = useRef([]);

    // Auto-cycle workflow steps with dynamic simulated cursor
    useEffect(() => {
        if (isHovered) {
            setAgentCursor((prev) => ({ ...prev, visible: false }));
            return;
        }

        const interval = setInterval(() => {
            const nextStep = (active + 1) % workflowSteps.length;
            const targetBtn = stepRefs.current[nextStep];
            const bar = stepBarRef.current;

            if (targetBtn && bar) {
                const barRect = bar.getBoundingClientRect();
                const btnRect = targetBtn.getBoundingClientRect();
                const targetX = btnRect.left - barRect.left + btnRect.width / 2;
                const targetY = btnRect.top - barRect.top + btnRect.height / 2;

                setAgentCursor({ x: targetX, y: targetY, visible: true, isClicking: false });

                setTimeout(() => {
                    setAgentCursor({ x: targetX, y: targetY, visible: true, isClicking: true });
                    setActive(nextStep);

                    setTimeout(() => {
                        setAgentCursor((prev) => ({ ...prev, isClicking: false }));
                    }, 350);
                }, 650);
            } else {
                setActive(nextStep);
            }
        }, 4200);

        return () => clearInterval(interval);
    }, [active, isHovered]);

    const handleCopy = () => {
        setCopied(true);
        navigator.clipboard?.writeText(workflowSteps[active].code);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="workflow-timeline-wrapper" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {/* Step selector tabs */}
            <div className="workflow-step-tabs" ref={stepBarRef}>
                <SimulatedAutoCursor position={agentCursor} isClicking={agentCursor.isClicking} label="Next Step" />
                {workflowSteps.map((s, i) => (
                    <button
                        key={s.num}
                        ref={(el) => (stepRefs.current[i] = el)}
                        className={`workflow-tab-btn ${active === i ? 'wtab-active' : ''}`}
                        onClick={() => {
                            setActive(i);
                            setAgentCursor((prev) => ({ ...prev, visible: false }));
                        }}
                    >
                        <span className={`wtab-num ${active === i ? 'wtab-num-active' : ''}`}>{s.num}</span>
                        <div className="wtab-text-wrap">
                            <span className="wtab-title">{s.title}</span>
                            <span className="wtab-sub">{s.subtitle}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Content panel */}
            <div className="workflow-content-panel" key={active}>
                <div className="workflow-panel-left">
                    <div className="workflow-step-icon-wrap">
                        {workflowSteps[active].icon}
                    </div>
                    <span className="workflow-step-tag">STEP {workflowSteps[active].num}</span>
                    <h3 className="workflow-panel-title">{workflowSteps[active].title}</h3>
                    <p className="workflow-panel-desc">{workflowSteps[active].desc}</p>
                    
                    <div className="workflow-interactive-indicator">
                        <span className="indicator-label">Step Status:</span>
                        <span className="indicator-badge">Ready for Execution</span>
                    </div>
                </div>

                {/* Code block */}
                <div className="workflow-code-block">
                    <div className="code-window-header">
                        <div className="window-dots">
                            <span className="w-dot dot-1" />
                            <span className="w-dot dot-2" />
                            <span className="w-dot dot-3" />
                        </div>
                        <span className="code-filename font-mono">pipeline_step_{workflowSteps[active].num}.py</span>
                        <button className="code-copy-btn" onClick={handleCopy}>
                            <CopyIcon size={12} />
                            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                    </div>
                    <pre className="code-body font-mono">
                        <code>
                            {workflowSteps[active].code.split('\n').map((line, li) => (
                                <div
                                    key={li}
                                    className={`code-line ${workflowSteps[active].highlight.includes(li) ? 'code-line-highlight' : ''}`}
                                >
                                    <span className="code-line-num">{li + 1}</span>
                                    <span className="code-line-text">{line}</span>
                                </div>
                            ))}
                        </code>
                    </pre>
                    <div className="code-run-bar font-mono">
                        <span className="run-dot" />
                        <span className="run-text">researchos-cli: Step {workflowSteps[active].num} verified</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LANDING COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function Landing({ onGetStarted, onLogin }) {
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false, px: 0, py: 0 });
    const heroRef = useRef(null);

    const handleHeroMouseMove = (e) => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = (x - rect.width / 2) / (rect.width / 2);
        const py = (y - rect.height / 2) / (rect.height / 2);
        setMousePos({ x, y, active: true, px, py });
    };

    const handleHeroMouseLeave = () => {
        setMousePos((prev) => ({ ...prev, active: false, px: 0, py: 0 }));
    };

    useEffect(() => {
        const el = document.getElementById('landing-root');
        if (!el) return;
        const handler = () => setScrolled(el.scrollTop > 30);
        el.addEventListener('scroll', handler);
        return () => el.removeEventListener('scroll', handler);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div id="landing-root" className="landing-light-container">
            <CustomCursor />

            {/* ── AMBIENT BACKGROUND GLOWS ──────────────────────────────── */}
            <div className="ambient-background-layer" aria-hidden="true">
                <div className="ambient-orb orb-teal" />
                <div className="ambient-orb orb-indigo" />
                <div className="ambient-orb orb-cyan" />
                <div className="blueprint-grid-overlay" />
            </div>

            {/* ── NAV ────────────────────────────────────────────────────── */}
            <nav className={`landing-light-nav ${scrolled ? 'nav-scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-brand" onClick={() => scrollTo('hero')}>
                        <ResearchOSLogo size={32} showWordmark={true} textColor="#0F172A" />
                        <span className="brand-version-pill">v1.4 Beta</span>
                    </div>
                    <div className="nav-links">
                        {navLinks.map((l) => (
                            <button key={l.label} className="nav-link-btn" onClick={() => scrollTo(l.targetId)}>
                                {l.label}
                            </button>
                        ))}
                    </div>
                    <div className="nav-actions">
                        <button onClick={onLogin} className="nav-login-btn">Sign in</button>
                        <button onClick={onGetStarted} className="nav-primary-btn">
                            <span>Get started free</span>
                            <ArrowRightIcon size={14} color="#FFFFFF" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO SECTION WITH INTERACTIVE BACKGROUND ─────────────── */}
            <section
                id="hero"
                ref={heroRef}
                className="hero-section"
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={handleHeroMouseLeave}
            >
                {/* 1. Interactive Cursor Spotlight */}
                <div
                    className="hero-cursor-spotlight"
                    style={{
                        background: mousePos.active
                            ? `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(13, 148, 136, 0.16) 0%, rgba(99, 102, 241, 0.09) 35%, rgba(6, 182, 212, 0.04) 55%, transparent 75%)`
                            : `radial-gradient(800px circle at 50% 40%, rgba(13, 148, 136, 0.12) 0%, rgba(99, 102, 241, 0.06) 40%, transparent 70%)`
                    }}
                />

                {/* 2. Geometric Vector Grid & Crosshairs */}
                <HeroGeometricGrid />

                {/* Hero Foreground Content */}
                <div className="hero-content">
                    <div className="hero-pill-badge">
                        <SparkleIcon size={14} color="#0D9488" />
                        <span>The Open Operating System for Machine Learning Research</span>
                        <span className="badge-sep">·</span>
                        <span className="badge-highlight">Deterministic Lineage</span>
                    </div>

                    <h1 className="hero-title">
                        One unified workspace for your<br />
                        <span className="hero-highlight">datasets, experiments &amp; lineage</span>
                    </h1>

                    <p className="hero-subtitle">
                        Stop losing track of data mutations, training configurations, and experiment metrics.
                        ResearchOS connects your entire ML lifecycle into a cryptographically verifiable, reproducible pipeline.
                    </p>

                    <div className="hero-buttons">
                        <button onClick={onGetStarted} className="hero-cta-btn">
                            <span>Create Free Workspace</span>
                            <ArrowRightIcon size={16} color="#FFFFFF" />
                        </button>
                        <button onClick={onLogin} className="hero-ghost-btn">
                            <span>Sign in to existing account</span>
                        </button>
                    </div>

                    {/* Sleek Trust & Capabilities Ribbon */}
                    <div className="hero-feature-ribbon">
                        <div className="feature-ribbon-item">
                            <span className="ribbon-icon"><SparkleIcon size={14} color="#0D9488" /></span>
                            <span className="ribbon-text">&lt; 1ms Telemetry Overhead</span>
                        </div>
                        <div className="ribbon-sep" />
                        <div className="feature-ribbon-item">
                            <span className="ribbon-icon"><DatabaseIcon size={14} color="#0284C7" /></span>
                            <span className="ribbon-text">Content-Addressed Delta Storage</span>
                        </div>
                        <div className="ribbon-sep" />
                        <div className="feature-ribbon-item">
                            <span className="ribbon-icon"><LineageGraphIcon size={14} color="#6366F1" /></span>
                            <span className="ribbon-text">Deterministic Provenance DAG</span>
                        </div>
                        <div className="ribbon-sep" />
                        <div className="feature-ribbon-item">
                            <span className="ribbon-icon"><DocumentCheckIcon size={14} color="#059669" /></span>
                            <span className="ribbon-text">1-Click Peer-Review Export</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── LIVE RESEARCH ACTIVITY TICKER ──────────────────────────── */}
            <div className="live-ticker-strip">
                <div className="ticker-label">
                    <span className="ticker-pulse-dot" />
                    <span>LIVE RESEARCH ACTIVITY</span>
                </div>
                <div className="ticker-items-carousel">
                    {liveTickerItems.map((item, idx) => (
                        <div key={idx} className="ticker-card">
                            <span className="ticker-badge font-mono">{item.badge}</span>
                            <span className="ticker-text">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PROBLEM vs SOLUTION ─────────────────────────────────────── */}
            <section id="overview-section" className="section-padded bg-light-alt">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-micro-badge">WHY WE BUILT RESEARCHOS</span>
                        <h2 className="section-heading">Built to solve real research friction</h2>
                        <p className="section-subheading">
                            Modern machine learning research is messy. ResearchOS brings deterministic rigor and clarity to your workspace.
                        </p>
                    </div>
                    <div className="comparison-cards-grid">
                        {comparisonPoints.map((item, idx) => (
                            <div key={idx} className="comparison-card">
                                <div className="card-problem-side">
                                    <div className="side-label label-problem">
                                        <span className="side-icon-tag">✕</span>
                                        <span>Without ResearchOS</span>
                                    </div>
                                    <p className="side-text">{item.problem}</p>
                                </div>
                                <div className="card-divider-connector">
                                    <div className="flow-track">
                                        <span className="flow-glow-line" />
                                        <span className="flow-dash-line" />
                                        <span className="flow-energy-particle" />
                                    </div>
                                    <div className="flow-arrow-head">
                                        <ArrowRightIcon size={14} color="#0D9488" />
                                    </div>
                                </div>
                                <div className="card-solution-side">
                                    <div className="side-label label-solution">
                                        <span className="side-icon-tag">✓</span>
                                        <span>With ResearchOS</span>
                                        <span className="solution-pill-tag font-mono">{item.badge}</span>
                                    </div>
                                    <p className="side-text text-solution">{item.solution}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ENHANCED CAPABILITIES / FEATURES SECTION ────────────────── */}
            <section id="capabilities-section" className="section-padded">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-micro-badge">POWERFUL RESEARCH PLATFORM</span>
                        <h2 className="section-heading">Everything needed to organize your lab</h2>
                        <p className="section-subheading">
                            Designed specifically for researchers, ML engineers, and academic institutions building reproducible intelligence.
                        </p>
                    </div>
                    <EnhancedCapabilitiesSection />
                </div>
            </section>

            {/* ── ANIMATED WORKFLOW ────────────────────────────────────────── */}
            <section id="workflow-section" className="section-padded bg-light-alt">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-micro-badge">HOW IT WORKS</span>
                        <h2 className="section-heading">From raw data to published results in 3 steps</h2>
                        <p className="section-subheading">
                            Integrate with your existing Python scripts in minutes — zero infrastructure rewrite required.
                        </p>
                    </div>
                    <WorkflowTimeline />
                </div>
            </section>

            {/* ── FAQ ─────────────────────────────────────────────────────── */}
            <section id="faq-section" className="section-padded">
                <div className="section-container max-w-narrow">
                    <div className="section-header">
                        <span className="section-micro-badge">QUESTIONS &amp; ANSWERS</span>
                        <h2 className="section-heading">Frequently Asked Questions</h2>
                        <p className="section-subheading">Everything you need to know about formats, environments, and data integrity.</p>
                    </div>
                    <div className="faq-list">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div key={faq.q} className={`faq-card ${isOpen ? 'active' : ''}`} onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                                    <div className="faq-question-bar">
                                        <div className="faq-q-left">
                                            <span className="faq-category-tag font-mono">{faq.category}</span>
                                            <h4 className="faq-question-text">{faq.q}</h4>
                                        </div>
                                        <div className={`faq-chevron-icon ${isOpen ? 'rotated' : ''}`}><ChevronDownIcon size={18} /></div>
                                    </div>
                                    {isOpen && <div className="faq-answer-box"><p>{faq.a}</p></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ──────────────────────────────────────────────── */}
            <section className="cta-banner-section">
                <div className="cta-banner-inner">
                    <div className="cta-top-badge font-mono">READY TO ELEVATE YOUR RESEARCH?</div>
                    <h2 className="cta-banner-title">Start organizing your research today</h2>
                    <p className="cta-banner-desc">Create your free workspace and start versioning datasets and experiment telemetry in under 5 minutes.</p>
                    <div className="cta-banner-actions">
                        <button onClick={onGetStarted} className="hero-cta-btn">
                            <span>Create Free Workspace</span>
                            <ArrowRightIcon size={16} color="#FFFFFF" />
                        </button>
                        <button onClick={onLogin} className="hero-ghost-btn-dark">
                            <span>Sign in to existing account</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <footer className="landing-light-footer">
                <div className="footer-container">
                    <div className="footer-top-row">
                        <div className="footer-brand-info">
                            <ResearchOSLogo size={28} showWordmark={true} textColor="#0F172A" />
                            <p className="footer-brand-text">
                                The open operating system for machine learning research, cryptographic dataset versioning, and deterministic provenance.
                            </p>
                        </div>
                        <div className="footer-nav-col">
                            <h5 className="footer-col-header">Platform</h5>
                            <button className="footer-nav-link" onClick={() => scrollTo('overview-section')}>Overview</button>
                            <button className="footer-nav-link" onClick={() => scrollTo('pipeline-section')}>Pipeline Architecture</button>
                            <button className="footer-nav-link" onClick={() => scrollTo('capabilities-section')}>Capabilities</button>
                            <button className="footer-nav-link" onClick={() => scrollTo('workflow-section')}>Workflow</button>
                            <button className="footer-nav-link" onClick={() => scrollTo('faq-section')}>FAQ</button>
                        </div>
                        <div className="footer-nav-col">
                            <h5 className="footer-col-header">Account</h5>
                            <button className="footer-nav-link" onClick={onLogin}>Sign in</button>
                            <button className="footer-nav-link" onClick={onGetStarted}>Create workspace</button>
                        </div>
                    </div>
                    <div className="footer-bottom-row">
                        <span className="copyright-text">© 2026 ResearchOS. All rights reserved. Open scientific infrastructure.</span>
                        <div className="footer-system-pill">
                            <span className="pill-dot" />
                            <span>System active · Telemetry engine live</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
