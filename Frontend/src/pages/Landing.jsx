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

function ArrowLeftIcon({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
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

function ArrowUpIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
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

function HardDriveIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="12" x2="2" y2="12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            <line x1="6" y1="16" x2="6.01" y2="16" />
            <line x1="10" y1="16" x2="10.01" y2="16" />
        </svg>
    );
}

function ZapIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}

function SearchIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function ClockIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function TrendingDownIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    );
}

function LinkIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    );
}

function BarChartIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

function PackageIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    );
}

function FileTextIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    );
}

function UsersIcon({ size = 18, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function LockIcon({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function SlidersIcon({ size = 16, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
    );
}

function MenuIcon({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

function XIcon({ size = 22, color = 'currentColor' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
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
   MINIMALIST PRECISION DOT CURSOR (Linear / Figma Style)
   Ultra-crisp 6px teal dot with zero glow, 100% surgical & responsive
───────────────────────────────────────────────────────────────────────────── */
function CustomCursor() {
    const [pos, setPos] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const onMouseMove = (e) => {
            setPos({ x: e.clientX, y: e.clientY });
            if (!isVisible) setIsVisible(true);

            const target = e.target;
            const isClickable = target && target.closest('button, a, input, select, textarea, [role="button"], .showcase-tab-btn, .workflow-tab-btn, .faq-card, .matrix-card, .framework-pill, .nav-brand');
            setIsHovering(Boolean(isClickable));
        };

        const onMouseDown = () => setIsClicking(true);
        const onMouseUp = () => setIsClicking(false);
        const onMouseLeave = () => setIsVisible(false);

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mouseleave', onMouseLeave);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div
            className={`precision-cursor-dot ${isHovering ? 'dot-hover' : ''} ${isClicking ? 'dot-click' : ''}`}
            style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${isClicking ? 0.75 : 1})`
            }}
            aria-hidden="true"
        />
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
    const [copiedBibtex, setCopiedBibtex] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(0);

    const featureTabs = [
        {
            id: 0,
            icon: <DatabaseIcon size={18} color="#0D9488" />,
            title: 'Dataset Versioning',
            subtitle: 'Smart backups',
            tag: 'DATASETS',
            heading: 'Save every data version without filling your disk',
            desc: 'Whenever you clean, filter, or update a dataset, ResearchOS saves a lightweight snapshot. Roll back anytime, view exact row differences, and detect drift automatically.',
            highlights: [
                { icon: <HardDriveIcon size={16} color="#0D9488" />, title: '80% Disk Space Saved', desc: 'Stores only what changed' },
                { icon: <ZapIcon size={16} color="#0D9488" />, title: '1-Click Rollback', desc: 'Restore any past version instantly' },
                { icon: <SearchIcon size={16} color="#0D9488" />, title: 'Smart Drift Alerts', desc: 'Know when data shifts' },
            ],
            nextLabel: 'Live Experiments',
        },
        {
            id: 1,
            icon: <FlaskIcon size={18} color="#6366F1" />,
            title: 'Experiment Tracking',
            subtitle: 'Live charts & telemetry',
            tag: 'EXPERIMENTS',
            heading: 'Watch your models train live with zero slowdown',
            desc: 'Stream loss curves, accuracy, and GPU memory in real time as your code runs. Integrates seamlessly with just 2 lines of Python code in PyTorch, JAX, or Hugging Face.',
            highlights: [
                { icon: <ClockIcon size={16} color="#6366F1" />, title: 'Zero Training Lag', desc: 'Sub-millisecond speed' },
                { icon: <TrendingDownIcon size={16} color="#6366F1" />, title: 'Live Loss Curves', desc: 'Plotted step-by-step' },
                { icon: <CpuIcon size={16} color="#6366F1" />, title: 'GPU Health Monitor', desc: 'VRAM & compute metrics' },
            ],
            nextLabel: 'Model Lineage',
        },
        {
            id: 2,
            icon: <LineageGraphIcon size={18} color="#0284C7" />,
            title: 'Lineage & Audit',
            subtitle: 'Data-to-model graph',
            tag: 'LINEAGE',
            heading: 'Trace any model back to the exact data that trained it',
            desc: 'Every checkpoint is linked to its exact dataset version, code commit, and parameters. No more wondering which file or hyperparameters produced your best result.',
            highlights: [
                { icon: <LinkIcon size={16} color="#0284C7" />, title: 'Full Traceability', desc: 'Raw data to final weights' },
                { icon: <ShieldCheckIcon size={16} color="#0284C7" />, title: '100% Audit-Ready', desc: 'Pass peer reviews easily' },
                { icon: <BarChartIcon size={16} color="#0284C7" />, title: 'Visual Pipeline Graph', desc: 'Interactive step tree' },
            ],
            nextLabel: '1-Click Export',
        },
        {
            id: 3,
            icon: <DocumentCheckIcon size={18} color="#059669" />,
            title: 'Export & Publishing',
            subtitle: 'Share paper packages',
            tag: 'REPRODUCIBILITY',
            heading: 'Package and share your research in one click',
            desc: 'Export clean reproducible bundles for reviewers, journals, and lab teammates. Includes sealed dependencies, deterministic random seeds, and instant BibTeX citations.',
            highlights: [
                { icon: <PackageIcon size={16} color="#059669" />, title: 'Docker & Conda Lock', desc: 'Runs anywhere smoothly' },
                { icon: <FileTextIcon size={16} color="#059669" />, title: '1-Click BibTeX', desc: 'Instant paper citation' },
                { icon: <UsersIcon size={16} color="#059669" />, title: 'Reviewer Friendly', desc: 'Verified artifact package' },
            ],
            nextLabel: 'Dataset Versioning',
        },
    ];

    const prevTab = () => {
        setActiveFeatureTab((prev) => (prev === 0 ? featureTabs.length - 1 : prev - 1));
        setProgress(0);
    };

    const nextTab = () => {
        setActiveFeatureTab((prev) => (prev + 1) % featureTabs.length);
        setProgress(0);
    };

    // Auto-advance timer with smooth progress bar
    useEffect(() => {
        if (isHovered) return;

        const intervalMs = 60;
        const totalDurationMs = 5000;
        const step = (intervalMs / totalDurationMs) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    setActiveFeatureTab((curr) => (curr + 1) % featureTabs.length);
                    return 0;
                }
                return prev + step;
            });
        }, intervalMs);

        return () => clearInterval(timer);
    }, [isHovered, featureTabs.length]);

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

    const curr = featureTabs[activeFeatureTab];
    const nextItem = featureTabs[(activeFeatureTab + 1) % featureTabs.length];

    return (
        <div 
            className="capabilities-wrapper simplified" 
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="capability-showcase-container">
                {/* Modern Navigation Header with Tabs & Dynamic Switching Arrows */}
                <div className="showcase-header-row">
                    <div className="showcase-tab-bar">
                        {featureTabs.map((tab, idx) => (
                            <button
                                key={tab.id}
                                className={`showcase-tab-btn ${activeFeatureTab === idx ? 'stab-active' : ''}`}
                                onClick={() => {
                                    setActiveFeatureTab(idx);
                                    setProgress(0);
                                }}
                            >
                                <span className="stab-icon">{tab.icon}</span>
                                <span className="stab-title">{tab.title}</span>
                                <span className="stab-tag">{tab.subtitle}</span>
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Switching Controls (Arrow Buttons) */}
                    <div className="showcase-nav-controls">
                        <span className="showcase-step-counter">
                            <span className="step-current">0{activeFeatureTab + 1}</span>
                            <span className="step-divider">/</span>
                            <span className="step-total">0{featureTabs.length}</span>
                        </span>
                        <div className="showcase-arrow-btn-group">
                            <button 
                                className="showcase-arrow-btn" 
                                onClick={prevTab} 
                                aria-label="Previous feature"
                                title="Previous feature (←)"
                            >
                                <ArrowLeftIcon size={16} />
                            </button>
                            <button 
                                className="showcase-arrow-btn highlight-arrow" 
                                onClick={nextTab} 
                                aria-label="Next feature"
                                title="Next feature (→)"
                            >
                                <ArrowRightIcon size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Animated Progress countdown line */}
                <div className="showcase-progress-track">
                    <div 
                        className="showcase-progress-fill" 
                        style={{ width: isHovered ? '100%' : `${progress}%`, transition: isHovered ? 'width 0.3s ease' : 'none' }}
                    />
                </div>

                {/* Main Showcase Split Panel */}
                <div className="showcase-body-panel">
                    {/* Left: Simple, Catchy English Content */}
                    <div className="showcase-left-info">
                        <div className="showcase-badge">
                            <span className="badge-bullet" />
                            <span>{curr.tag}</span>
                        </div>
                        <h3 className="showcase-heading">{curr.heading}</h3>
                        <p className="showcase-description">{curr.desc}</p>

                        {/* 3 Quick Benefit Chips */}
                        <div className="simple-benefit-chips">
                            {curr.highlights.map((h, i) => (
                                <div key={i} className="simple-benefit-chip">
                                    <span className="benefit-icon">{h.icon}</span>
                                    <div className="benefit-texts">
                                        <span className="benefit-title">{h.title}</span>
                                        <span className="benefit-desc">{h.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Dynamic Interactive Switching Arrow Pill */}
                        <div className="showcase-cta-row">
                            <button className="showcase-next-arrow-btn" onClick={nextTab}>
                                <span>Next: {nextItem.title}</span>
                                <span className="bouncing-arrow">
                                    <ArrowRightIcon size={14} color="#FFFFFF" />
                                </span>
                            </button>
                            <div className="showcase-dots">
                                {featureTabs.map((_, i) => (
                                    <span 
                                        key={i} 
                                        onClick={() => { setActiveFeatureTab(i); setProgress(0); }}
                                        className={`showcase-dot ${activeFeatureTab === i ? 'dot-active' : ''}`} 
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Clean Visual Preview */}
                    <div className="showcase-right-demo">
                        {activeFeatureTab === 0 && (
                            <div className="demo-card demo-versioning">
                                <div className="demo-header">
                                    <div className="demo-header-title">
                                        <DatabaseIcon size={16} color="#0D9488" />
                                        <span>Dataset Version Timeline</span>
                                    </div>
                                    <span className="demo-status-pill">Active Snapshot</span>
                                </div>
                                <div className="demo-version-scrubber">
                                    <div className="scrubber-label">VERSION HISTORY:</div>
                                    <div className="scrubber-nodes">
                                        <div className="scrubber-node passed">
                                            <span className="snode-circle">
                                                <CheckIcon size={11} color="#0D9488" />
                                            </span>
                                            <span className="snode-name">V1 Baseline (200 rows)</span>
                                        </div>
                                        <div className="scrubber-line passed-line" />
                                        <div className="scrubber-node current">
                                            <span className="snode-circle pulse">
                                                <SparkleIcon size={11} color="#FFFFFF" />
                                            </span>
                                            <span className="snode-name text-teal">V2 Current (260 rows)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="demo-diff-box">
                                    <div className="diff-header font-mono">
                                        <span>Changes: +60 rows · +1 column (treatment_cohort)</span>
                                    </div>
                                    <div className="diff-lines font-mono">
                                        <div className="diff-line plus">+ PT-2001 | treatment: Targeted Inhibitor | age: 58</div>
                                        <div className="diff-line plus">+ PT-2002 | treatment: Standard Chemo | age: 62</div>
                                    </div>
                                </div>
                                <div className="demo-footer-metric">
                                    <span className="metric-highlight font-mono">82%</span>
                                    <span className="metric-caption">Storage saved — only newly added rows are stored on disk</span>
                                </div>
                            </div>
                        )}

                        {activeFeatureTab === 1 && (
                            <div className="demo-card demo-telemetry">
                                <div className="demo-header">
                                    <div className="demo-header-title">
                                        <FlaskIcon size={16} color="#6366F1" />
                                        <span>Live Training Stream</span>
                                    </div>
                                    <span className="demo-status-pill text-indigo">● Live · 0.8ms</span>
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
                                        <span className="gauge-label">VRAM MEMORY</span>
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
                                        <div><span className="sub-key">val_loss:</span> <span className="text-teal font-bold">0.142 ↓</span></div>
                                        <div><span className="sub-key">accuracy:</span> <span className="text-teal font-bold">96.8%</span></div>
                                        <div><span className="sub-key">batch:</span> 64</div>
                                        <div><span className="sub-key">epoch:</span> 14 / 20</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeFeatureTab === 2 && (
                            <div className="demo-card demo-lineage">
                                <div className="demo-header">
                                    <div className="demo-header-title">
                                        <LineageGraphIcon size={16} color="#0284C7" />
                                        <span>Complete Lineage Chain</span>
                                    </div>
                                    <span className="demo-status-pill text-blue">Verified</span>
                                </div>
                                <div className="mini-interactive-dag">
                                    <div className="dag-step-pill">
                                        <span className="pill-type">RAW DATA</span>
                                        <span className="pill-val font-mono">biomarkers_v2</span>
                                    </div>
                                    <div className="dag-flow-arrow">
                                        <ArrowRightIcon size={12} color="#94A3B8" />
                                    </div>
                                    <div className="dag-step-pill">
                                        <span className="pill-type">PREP</span>
                                        <span className="pill-val font-mono">standard_scaler</span>
                                    </div>
                                    <div className="dag-flow-arrow">
                                        <ArrowRightIcon size={12} color="#94A3B8" />
                                    </div>
                                    <div className="dag-step-pill pill-selected">
                                        <span className="pill-type">TRAIN</span>
                                        <span className="pill-val font-mono">exp-084</span>
                                    </div>
                                    <div className="dag-flow-arrow">
                                        <ArrowRightIcon size={12} color="#94A3B8" />
                                    </div>
                                    <div className="dag-step-pill pill-final">
                                        <span className="pill-type">MODEL</span>
                                        <span className="pill-val font-mono">model.pt</span>
                                    </div>
                                </div>
                                <div className="dag-verify-box font-mono">
                                    <span className="verify-icon">
                                        <LockIcon size={13} color="#0284C7" />
                                    </span>
                                    <span>Cryptographically sealed · Provenance 100% verified</span>
                                </div>
                            </div>
                        )}

                        {activeFeatureTab === 3 && (
                            <div className="demo-card demo-publish">
                                <div className="demo-header">
                                    <div className="demo-header-title">
                                        <DocumentCheckIcon size={16} color="#059669" />
                                        <span>Paper Reproduction Package</span>
                                    </div>
                                    <span className="demo-status-pill text-green">Export Ready</span>
                                </div>
                                <div className="package-manifest">
                                    <div className="manifest-item">
                                        <span className="manifest-icon">
                                            <PackageIcon size={14} color="#059669" />
                                        </span>
                                        <span className="manifest-name font-mono">Dockerfile (CUDA 12.2 + PyTorch 2.4)</span>
                                        <span className="manifest-status font-mono">
                                            <CheckIcon size={12} color="#059669" /> Sealed
                                        </span>
                                    </div>
                                    <div className="manifest-item">
                                        <span className="manifest-icon">
                                            <FileTextIcon size={14} color="#059669" />
                                        </span>
                                        <span className="manifest-name font-mono">requirements.lock.txt (Pinned hashes)</span>
                                        <span className="manifest-status font-mono">
                                            <CheckIcon size={12} color="#059669" /> Sealed
                                        </span>
                                    </div>
                                    <div className="manifest-item">
                                        <span className="manifest-icon">
                                            <SlidersIcon size={14} color="#059669" />
                                        </span>
                                        <span className="manifest-name font-mono">random_seeds_spec.json (Deterministic)</span>
                                        <span className="manifest-status font-mono">
                                            <CheckIcon size={12} color="#059669" /> Sealed
                                        </span>
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
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false, px: 0, py: 0 });
    const [menuOpen, setMenuOpen] = useState(false);
    const heroRef = useRef(null);

    // Close sidebar on ESC key
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // Lock body scroll when sidebar is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const closeMobileMenu = (id) => {
        setMenuOpen(false);
        if (id) setTimeout(() => scrollTo(id), 50);
    };

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
        const handleScroll = () => {
            const top = el ? el.scrollTop : window.scrollY;
            setScrolled(top > 30);
            setShowScrollTop(top > 320);
        };

        if (el) el.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial check
        handleScroll();

        return () => {
            if (el) el.removeEventListener('scroll', handleScroll);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToTop = () => {
        const el = document.getElementById('landing-root');
        if (el) {
            el.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    {/* Brand */}
                    <div className="nav-brand" onClick={() => scrollTo('hero')}>
                        <ResearchOSLogo size={32} showWordmark={true} textColor="#0F172A" />
                    </div>

                    {/* Desktop links (hidden on mobile) */}
                    <div className="nav-links">
                        {navLinks.map((l) => (
                            <button key={l.label} className="nav-link-btn" onClick={() => scrollTo(l.targetId)}>
                                {l.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop CTA buttons (hidden on mobile) */}
                    <div className="nav-actions nav-actions-desktop">
                        <button onClick={onLogin} className="nav-login-btn">Sign in</button>
                        <button onClick={onGetStarted} className="nav-primary-btn">
                            <span>Get started free</span>
                            <ArrowRightIcon size={14} color="#FFFFFF" />
                        </button>
                    </div>

                    {/* Hamburger button (visible on mobile only) */}
                    <button
                        className={`nav-hamburger-btn ${menuOpen ? 'is-open' : ''}`}
                        onClick={() => setMenuOpen((o) => !o)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <XIcon size={22} color="#0F172A" /> : <MenuIcon size={22} color="#0F172A" />}
                    </button>
                </div>
            </nav>

            {/* ── MOBILE SIDEBAR OVERLAY ──────────────────────────────────── */}
            {/* Backdrop */}
            <div
                className={`mobile-nav-backdrop ${menuOpen ? 'backdrop-visible' : ''}`}
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Sidebar drawer */}
            <aside className={`mobile-nav-sidebar ${menuOpen ? 'sidebar-open' : ''}`} aria-label="Mobile navigation">
                {/* Sidebar header */}
                <div className="sidebar-header">
                    <div className="sidebar-brand" onClick={() => closeMobileMenu('hero')}>
                        <ResearchOSLogo size={28} showWordmark={true} textColor="#0F172A" />
                    </div>
                    <button className="sidebar-close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                        <XIcon size={20} color="#64748B" />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="sidebar-nav-links">
                    {navLinks.map((l, idx) => (
                        <button
                            key={l.label}
                            className="sidebar-nav-link"
                            style={{ animationDelay: `${idx * 0.06}s` }}
                            onClick={() => closeMobileMenu(l.targetId)}
                        >
                            <ArrowRightIcon size={14} color="#0D9488" />
                            {l.label}
                        </button>
                    ))}
                </nav>

                {/* Sidebar divider */}
                <div className="sidebar-divider" />

                {/* Auth buttons */}
                <div className="sidebar-auth-btns">
                    <button
                        onClick={() => { setMenuOpen(false); onLogin(); }}
                        className="sidebar-signin-btn"
                    >
                        Sign in
                    </button>
                    <button
                        onClick={() => { setMenuOpen(false); onGetStarted(); }}
                        className="sidebar-getstarted-btn"
                    >
                        <span>Get started free</span>
                        <ArrowRightIcon size={14} color="#FFFFFF" />
                    </button>
                </div>

                {/* Sidebar footer badge */}
                <div className="sidebar-footer-badge">
                    <span className="sidebar-footer-dot" />
                    <span>System active · Free for researchers</span>
                </div>
            </aside>

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
                        <span>The Open Operating System Research</span>
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

            {/* ── LIVE RESEARCH ACTIVITY TICKER (MARQUEE RIBBON) ───────── */}
            <div className="live-ticker-strip">
                <div className="ticker-label">
                    <span className="ticker-pulse-dot" />
                    <span>LIVE RESEARCH ACTIVITY</span>
                </div>
                <div className="ticker-marquee-wrapper">
                    <div className="ticker-marquee-track">
                        {/* Primary loop */}
                        {liveTickerItems.map((item, idx) => (
                            <div key={`m1-${idx}`} className="ticker-card">
                                <span className="ticker-badge font-mono">{item.badge}</span>
                                <span className="ticker-text">{item.text}</span>
                            </div>
                        ))}
                        {/* Loop clone 1 */}
                        {liveTickerItems.map((item, idx) => (
                            <div key={`m2-${idx}`} className="ticker-card">
                                <span className="ticker-badge font-mono">{item.badge}</span>
                                <span className="ticker-text">{item.text}</span>
                            </div>
                        ))}
                        {/* Loop clone 2 */}
                        {liveTickerItems.map((item, idx) => (
                            <div key={`m3-${idx}`} className="ticker-card">
                                <span className="ticker-badge font-mono">{item.badge}</span>
                                <span className="ticker-text">{item.text}</span>
                            </div>
                        ))}
                    </div>
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
                            Simple tools to version your datasets, monitor training live, and share reproducible results — without the clutter.
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

            {/* ── BACK TO TOP FLOATING BUTTON ─────────────────────────────── */}
            <button
                type="button"
                className={`landing-scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top of homepage"
                title="Back to top"
            >
                <div className="scroll-top-glow" />
                <div className="scroll-top-inner">
                    <ArrowUpIcon size={18} color="#FFFFFF" />
                </div>
                <span className="scroll-top-tooltip">Back to top</span>
            </button>
        </div>
    );
}
