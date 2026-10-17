import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDashboard } from '../lib/api';
import './Home.css';

const STATUS_CFG = {
  completed: { bg: 'status-completed', text: 'status-completed', dot: 'status-completed', label: 'Completed' },
  running:   { bg: 'status-running', text: 'status-running', dot: 'status-running animate-pulse', label: 'Running' },
  failed:    { bg: 'status-failed', text: 'status-failed', dot: 'status-failed', label: 'Failed' },
  queued:    { bg: 'status-queued', text: 'status-queued', dot: 'status-queued', label: 'Queued' },
};

function ActivityIcon({ type, color }) {
  const icons = {
    exp: <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M5 1.5v4.5L2.5 11h8L8 6V1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 1.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    ds: <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><ellipse cx="6.5" cy="4" rx="4" ry="1.6" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 4v3c0 .88 1.79 1.6 4 1.6s4-.72 4-1.6V4" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 7v2.5c0 .88 1.79 1.6 4 1.6s4-.72 4-1.6V7" stroke="currentColor" strokeWidth="1.3"/></svg>,
    lin: <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><circle cx="2.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 6.5h1M7.5 3.2l1.5 2.4" stroke="currentColor" strokeWidth="1.2"/></svg>,
    team: <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 11c0-1.93 1.57-3.5 3.5-3.5S8.5 9.07 8.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="9.5" cy="4.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M11.5 10.5c0-1.38-1.12-2.5-2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    res: <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M2 9.5L5 6.5l2.5 2L10 4l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    proj: <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M1.5 4.5C1.5 3.67 2.17 3 3 3H5l1.5 1.5H10c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5H3C2.17 11.5 1.5 10.83 1.5 10V4.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  };
  return (
    <div className="home-activity-icon-wrap" style={{ backgroundColor: `${color}18`, color }}>
      {icons[type] ?? icons.proj}
    </div>
  );
}

function MiniSparkline({ values, color }) {
  const min = Math.min(...values), max = Math.max(...values);
  const W = 52, H = 22, PAD = 2;
  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / (max - min + 0.001)) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(' ');
  const area = `M${PAD},${H - PAD} L${values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / (max - min + 0.001)) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(' L')} L${W - PAD},${H - PAD} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <path d={area} fill={color} fillOpacity="0.12" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={parseFloat(pts.split(' ').at(-1).split(',')[0])} cy={parseFloat(pts.split(' ').at(-1).split(',')[1])} r="2.5" fill={color} />
    </svg>
  );
}

/* ── Research Lifecycle Illustration ── */
function ResearchIllustration() {
  return (
    <svg viewBox="0 0 420 210" fill="none" style={{ width: '100%', height: '100%', maxWidth: 420 }}>
      {/* Background dot grid */}
      {Array.from({ length: 10 }).map((_, col) =>
        Array.from({ length: 6 }).map((_, row) => (
          <circle key={`${col}-${row}`} cx={col * 44 + 10} cy={row * 38 + 12} r="1.2"
            fill="white" fillOpacity="0.06" />
        ))
      )}

      {/* ── Flow path ── */}
      {/* Main bezier spine */}
      <path d="M55,105 C80,105 85,68 125,68 C165,68 155,140 200,140 C230,140 235,72 280,72 C305,72 310,118 355,100"
        stroke="url(#flowGrad)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4"/>

      {/* ── Stage 1: Dataset ── */}
      {/* Stacked cards */}
      <rect x="8" y="72" width="80" height="52" rx="7" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.1" strokeWidth="1"/>
      <rect x="12" y="76" width="80" height="52" rx="7" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
      <rect x="16" y="80" width="80" height="52" rx="7" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.18" strokeWidth="1"/>
      {/* DB icon inside */}
      <ellipse cx="46" cy="95" rx="12" ry="4.5" stroke="#14B8A6" strokeWidth="1.3" strokeOpacity="0.9"/>
      <path d="M34,95 v8 c0,2.5 5.4,4.5 12,4.5 s12,-2 12,-4.5 v-8" stroke="#14B8A6" strokeWidth="1.3" strokeOpacity="0.9"/>
      <path d="M34,99 c0,2.5 5.4,4.5 12,4.5 s12,-2 12,-4.5" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.5"/>
      {/* Version dots */}
      {[0,1,2,3].map(i => (
        <circle key={i} cx={68 + i * 7} cy="97" r="2.5"
          fill={i === 3 ? '#14B8A6' : 'white'} fillOpacity={i === 3 ? 0.9 : 0.2}/>
      ))}
      <text x="56" y="120" fontSize="8" fill="white" fillOpacity="0.4" textAnchor="middle" fontFamily="Inter,sans-serif">Datasets · V4</text>
      {/* Stage label */}
      <rect x="22" y="136" width="48" height="14" rx="4" fill="white" fillOpacity="0.06"/>
      <text x="46" y="146" fontSize="7.5" fill="#14B8A6" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="600">Dataset</text>

      {/* ── Stage 2: Preprocessing ── */}
      <rect x="102" y="46" width="76" height="48" rx="7" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
      {/* Transform lines */}
      {[0,1,2].map(i => (
        <line key={i} x1={112} y1={57 + i * 9} x2={168} y2={57 + i * 9}
          stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
      ))}
      <path d="M120,57 L126,57 M120,66 L132,66 M120,75 L128,75"
        stroke="#22D3EE" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round"/>
      {/* checkmark */}
      <circle cx="158" cy="57" r="5" fill="#14B8A6" fillOpacity="0.2" stroke="#14B8A6" strokeOpacity="0.6" strokeWidth="1"/>
      <path d="M155,57 L157.5,59.5 L162,54" stroke="#14B8A6" strokeOpacity="0.9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="158" cy="66" r="5" fill="#14B8A6" fillOpacity="0.2" stroke="#14B8A6" strokeOpacity="0.6" strokeWidth="1"/>
      <path d="M155,66 L157.5,68.5 L162,63" stroke="#14B8A6" strokeOpacity="0.9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="114" y="80" width="58" height="11" rx="3" fill="white" fillOpacity="0.06"/>
      <text x="143" y="88.5" fontSize="7.5" fill="#22D3EE" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="600">Preprocessing</text>

      {/* ── Stage 3: Experiment ── */}
      <rect x="170" y="115" width="76" height="60" rx="7" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
      {/* Flask shape */}
      <path d="M198,126 v12 l-10,18 h24 l-10,-18 v-12" stroke="#22D3EE" strokeWidth="1.4" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M198,126 h8" stroke="#22D3EE" strokeWidth="1.4" strokeOpacity="0.8" strokeLinecap="round"/>
      {/* Bubbles in flask */}
      <circle cx="204" cy="152" r="2" fill="#22D3EE" fillOpacity="0.5"/>
      <circle cx="198" cy="157" r="1.5" fill="#14B8A6" fillOpacity="0.5"/>
      {/* Mini accuracy sparkline */}
      <polyline points="222,162 228,155 234,150 240,143" stroke="#14B8A6" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="240" cy="143" r="2.5" fill="#14B8A6" fillOpacity="0.9"/>
      <rect x="176" y="177" width="64" height="11" rx="3" fill="white" fillOpacity="0.06"/>
      <text x="208" y="185.5" fontSize="7.5" fill="#22D3EE" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="600">Experiments</text>

      {/* ── Stage 4: Model ── */}
      <rect x="256" y="44" width="76" height="58" rx="7" fill="white" fillOpacity="0.06" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
      {/* Neural net nodes */}
      {/* Input layer */}
      {[0,1,2].map(i => <circle key={i} cx="272" cy={55 + i * 14} r="4.5" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>)}
      {/* Hidden layer */}
      {[0,1].map(i => <circle key={i} cx="294" cy={62 + i * 14} r="5.5" fill="#14B8A6" fillOpacity="0.15" stroke="#14B8A6" strokeOpacity="0.5" strokeWidth="1"/>)}
      {/* Output */}
      <circle cx="316" cy="69" r="6" fill="#14B8A6" fillOpacity="0.25" stroke="#14B8A6" strokeOpacity="0.7" strokeWidth="1.2"/>
      {/* Connections input→hidden */}
      {[0,1,2].map(i => [0,1].map(j => (
        <line key={`${i}-${j}`} x1="276.5" y1={55 + i * 14} x2="288.5" y2={62 + j * 14}
          stroke="white" strokeOpacity="0.08" strokeWidth="0.8"/>
      )))}
      {/* Connections hidden→output */}
      {[0,1].map(i => (
        <line key={i} x1="299.5" y1={62 + i * 14} x2="310" y2="69"
          stroke="#14B8A6" strokeOpacity="0.3" strokeWidth="0.8"/>
      ))}
      {/* 94.2% label */}
      <rect x="302" y="56" width="26" height="11" rx="3" fill="#14B8A6" fillOpacity="0.2"/>
      <text x="315" y="64" fontSize="7" fill="#14B8A6" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700">94.2%</text>
      <rect x="262" y="96" width="64" height="11" rx="3" fill="white" fillOpacity="0.06"/>
      <text x="294" y="104.5" fontSize="7.5" fill="#14B8A6" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="600">Model Training</text>

      {/* ── Stage 5: Results ── */}
      <rect x="348" y="72" width="68" height="72" rx="7" fill="white" fillOpacity="0.06" stroke="url(#resultBorder)" strokeWidth="1.2"/>
      {/* Bar chart */}
      {[
        { x: 358, h: 22, opacity: 0.4 },
        { x: 370, h: 32, opacity: 0.55 },
        { x: 382, h: 26, opacity: 0.45 },
        { x: 394, h: 44, opacity: 1.0 },
      ].map((b, i) => (
        <rect key={i} x={b.x} y={130 - b.h} width="9" height={b.h} rx="2.5"
          fill="#14B8A6" fillOpacity={b.opacity}/>
      ))}
      <line x1="356" y1="130" x2="406" y2="130" stroke="white" strokeOpacity="0.12" strokeWidth="0.8"/>
      {/* Trophy / star */}
      <circle cx="395" cy="85" r="8" fill="url(#starGlow)" />
      <path d="M395,80 l1.5,3 3.5,.5 -2.5,2.5 .6,3.5 -3.1,-1.6 -3.1,1.6 .6,-3.5 -2.5,-2.5 3.5,-.5 z"
        fill="#22D3EE" fillOpacity="0.9"/>
      <rect x="352" y="144" width="60" height="11" rx="3" fill="white" fillOpacity="0.06"/>
      <text x="382" y="152.5" fontSize="7.5" fill="#22D3EE" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="600">Results</text>

      {/* ── Connection arrows ── */}
      {/* Dataset → Preprocessing */}
      <path d="M98,95 C108,95 102,72 102,70" stroke="white" strokeOpacity="0.18" strokeWidth="1.2" strokeDasharray="3 2"/>
      <polygon points="102,67 99,73 105,73" fill="white" fillOpacity="0.2"/>
      {/* Preprocessing → Experiment */}
      <path d="M140,95 C155,95 160,125 170,135" stroke="white" strokeOpacity="0.18" strokeWidth="1.2" strokeDasharray="3 2"/>
      <polygon points="170,138 167,132 173,132" fill="white" fillOpacity="0.2"/>
      {/* Experiment → Model */}
      <path d="M246,145 C255,145 250,90 256,78" stroke="white" strokeOpacity="0.18" strokeWidth="1.2" strokeDasharray="3 2"/>
      <polygon points="256,75 253,81 259,81" fill="white" fillOpacity="0.2"/>
      {/* Model → Results */}
      <path d="M332,80 C340,80 342,95 348,105" stroke="#14B8A6" strokeOpacity="0.35" strokeWidth="1.3" strokeDasharray="3 2"/>
      <polygon points="348,108 345,102 351,102" fill="#14B8A6" fillOpacity="0.5"/>

      {/* ── Floating particles ── */}
      <circle cx="100" cy="75" r="2.5" fill="#22D3EE" fillOpacity="0.5"/>
      <circle cx="160" cy="112" r="2" fill="#14B8A6" fillOpacity="0.6"/>
      <circle cx="250" cy="120" r="2.5" fill="#22D3EE" fillOpacity="0.5"/>
      <circle cx="338" cy="88" r="2" fill="#14B8A6" fillOpacity="0.7"/>
      <circle cx="180" cy="90" r="1.5" fill="white" fillOpacity="0.25"/>
      <circle cx="320" cy="130" r="1.5" fill="white" fillOpacity="0.2"/>

      {/* ── Stage step labels (timeline) ── */}
      {[
        { x: 46, label: '01' },
        { x: 140, label: '02' },
        { x: 208, label: '03' },
        { x: 294, label: '04' },
        { x: 382, label: '05' },
      ].map(s => (
        <text key={s.x} x={s.x} y="200" fontSize="7" fill="white" fillOpacity="0.2" textAnchor="middle" fontFamily="Inter,sans-serif">{s.label}</text>
      ))}
      <line x1="16" y1="196" x2="404" y2="196" stroke="white" strokeOpacity="0.08" strokeWidth="0.8"/>

      {/* Gradients */}
      <defs>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.1"/>
          <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id="resultBorder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.3"/>
        </linearGradient>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function Home({ onNavigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recent');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDashboard().then(data => {
      if (mounted) {
        setDashboardData(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Derive display name from Supabase user metadata or email
  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Researcher';

  // First name only for greeting
  const firstName = displayName.split(' ')[0];

  // Time-of-day greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const exps = dashboardData?.recent_experiments || [];
  const datasets = dashboardData?.recent_datasets || [];
  const activities = dashboardData?.activities || [];
  const stats = dashboardData?.stats || {
    total_datasets: 0,
    total_experiments: 0,
    active_experiments: 0,
    best_accuracy: '—',
    total_projects: 0,
  };

  const displayedExps = activeTab === 'recent'
    ? exps
    : [...exps].filter(e => e.accuracy != null && e.accuracy !== '—').sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));

  return (
    <div className="home-container">

      {/* ══════════════════════════════════════════════════════════════════
          HERO — dark navy left → teal right gradient
      ══════════════════════════════════════════════════════════════════ */}
      <div className="home-hero">
        {/* Ambient light layers */}
        <div className="home-hero-ambient">
          <div className="home-hero-glow-right" />
          <div className="home-hero-glow-left" />
        </div>
        {/* Subtle horizontal scanlines */}
        <div className="home-hero-scanlines" />

        <div className="home-hero-body">

          {/* LEFT — text content */}
          <div className="home-hero-text-col">
            {/* Brand label — same concave-triangle mark, white on dark */}
            <div className="home-hero-brand">
              <div className="home-hero-brand-mark">
                <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                  <path
                    d="M 6,2.6 Q 4.93,5.55 2.71,8.3 Q 6,7.37 9.29,8.3 Q 7.07,5.55 6,2.6 Z"
                    stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" fill="rgba(34,211,238,0.12)"
                  />
                  <circle cx="2.71" cy="8.3"  r="1.3" fill="rgba(255,255,255,0.65)" />
                  <circle cx="9.29" cy="8.3"  r="1.1" fill="rgba(20,184,166,0.9)"  />
                  <circle cx="6"    cy="2.6"  r="0.9" fill="rgba(34,211,238,0.95)" />
                  <circle cx="6"    cy="6.05" r="0.7" fill="rgba(255,255,255,0.5)" />
                </svg>
              </div>
              <span className="home-hero-brand-title">
                ResearchOS
              </span>
            </div>

            {/* Heading */}
            <h1 className="home-hero-heading">
              {timeGreeting}, <span className="home-hero-heading-gradient">{firstName}.</span><br />
              <span style={{ fontSize: '0.65em', fontWeight: 700, opacity: 0.85 }}>Your research workspace awaits.</span>
            </h1>

            {/* Supporting text */}
            <p className="home-hero-subtext">
              Manage datasets, experiments, lineage and research collaboration in one workspace.
            </p>

            {/* CTAs */}
            <div className="home-hero-actions">
              <button
                onClick={() => onNavigate('datasets')}
                className="home-hero-primary-btn"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><circle cx="6.5" cy="6.5" r="5" stroke="#071A2B" strokeWidth="1.4"/><path d="M4 6.5h5M6.5 4v5" stroke="#071A2B" strokeWidth="1.4" strokeLinecap="round"/></svg>
                Explore Research
              </button>
              <button
                onClick={() => onNavigate('lineage')}
                className="home-hero-secondary-btn"
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><circle cx="2.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="2.5" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 6.5h0.5M8 3.2l1.5 2" stroke="currentColor" strokeWidth="1.2"/></svg>
                View Lineage
              </button>
            </div>
          </div>

          {/* RIGHT — illustration */}
          <div className="home-hero-illustration-col">
            <ResearchIllustration />
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="home-hero-statusbar">
          {[
            { label: 'Best Accuracy', value: stats.best_accuracy || '—', spark: [89.4, 90.1, 92.7, 94.2], color: '#14B8A6' },
            { label: 'Experiments', value: String(stats.total_experiments ?? 0), spark: [60, 65, 70, 76, 80, 86], color: '#22D3EE' },
            { label: 'Datasets', value: String(stats.total_datasets ?? 0), spark: [18, 19, 20, 22, 24], color: '#A78BFA' },
          ].map((m, i) => (
            <div key={i} className="home-hero-metric-item">
              <div>
                <div className="home-hero-metric-label">{m.label}</div>
                <div className="home-hero-metric-value">{m.value}</div>
              </div>
              <MiniSparkline values={m.spark} color={m.color} />
              {i < 2 && <div className="home-hero-metric-divider" />}
            </div>
          ))}
          <div className="home-hero-running-badge">
            <span className={`home-hero-running-dot ${stats.active_experiments > 0 ? 'animate-pulse' : ''}`} />
            <span>{stats.active_experiments} {stats.active_experiments === 1 ? 'experiment running' : 'experiments running'}</span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div className="home-quick-actions-section">
        <h2 className="home-section-title">Quick actions</h2>
        <div className="home-quick-actions-grid">
          {[
            {
              nav: 'datasets',
              label: 'Upload Dataset',
              desc: 'Add a new data source or version',
              color: '#0F9D8A',
              bg: '#E6F7F5',
              icon: (
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <ellipse cx="8" cy="5.5" rx="4.5" ry="1.8" stroke="currentColor" strokeWidth="1.35"/>
                  <path d="M3.5 5.5v4c0 1 2.01 1.8 4.5 1.8s4.5-.8 4.5-1.8V5.5" stroke="currentColor" strokeWidth="1.35"/>
                  <path d="M8 12v2.5M10 13.5H6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              nav: 'experiments',
              label: 'New Experiment',
              desc: 'Configure and launch a training run',
              color: '#8B5CF6',
              bg: '#EDE9FE',
              icon: (
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M6.5 2v5.5L3.5 13h9L9.5 7.5V2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2h3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
                  <circle cx="5.5" cy="11" r="0.8" fill="currentColor"/>
                  <circle cx="8.5" cy="9.5" r="0.6" fill="currentColor"/>
                </svg>
              ),
            },
            {
              nav: 'results',
              label: 'View Results',
              desc: 'Compare models and best accuracy',
              color: '#F59E0B',
              bg: '#FEF3C7',
              icon: (
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M2 11.5L5.5 8l3 2.5L12 5l2 2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 14h12" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
                </svg>
              ),
            },
            {
              nav: 'copilot',
              label: 'Ask Copilot',
              desc: 'AI-powered research assistant',
              color: '#3B82F6',
              bg: '#DBEAFE',
              icon: (
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path d="M8 2a5.5 5.5 0 0 1 5.5 5.5c0 2.5-1.6 4.6-3.9 5.3L8 14l-1.6-1.2A5.5 5.5 0 0 1 2.5 7.5 5.5 5.5 0 0 1 8 2z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
                  <path d="M5.5 7.5h.5l.8-1.8.7 3.6.6-1.8H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
            },
          ].map(a => (
            <button key={a.label} onClick={() => onNavigate(a.nav)}
              className="home-quick-action-card">
              <div className="home-quick-action-icon-box"
                style={{ backgroundColor: a.bg, color: a.color }}>
                {a.icon}
              </div>
              <div className="home-quick-action-content">
                <p className="home-quick-action-label">{a.label}</p>
                <p className="home-quick-action-desc">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Research at a glance ──────────────────────────────────────── */}
      <div className="home-glance-section">
        <div className="home-glance-header">
          <div>
            <h2 className="home-glance-title">Research at a glance</h2>
            <p className="home-glance-subtitle">Snapshot of your active research pipeline</p>
          </div>
          <div className="home-glance-live-badge">
            <span className="home-glance-live-dot animate-pulse" />
            Live
          </div>
        </div>
        <div className="home-glance-grid">
          {[
            {
              icon: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><ellipse cx="9" cy="5.5" rx="5.5" ry="2.2" stroke="#14B8A6" strokeWidth="1.35"/><path d="M3.5 5.5v4.5c0 1.2 2.46 2.2 5.5 2.2s5.5-1 5.5-2.2V5.5" stroke="#14B8A6" strokeWidth="1.35"/><path d="M3.5 10v3c0 1.2 2.46 2.2 5.5 2.2s5.5-1 5.5-2.2v-3" stroke="#14B8A6" strokeWidth="1.35"/></svg>,
              label: 'Dataset Evolution', value: '4 versions', sub: 'PubMed-2024 · latest V4', accent: '#14B8A6', accentBg: '#E6F7F5', bar: [0.4, 0.6, 0.75, 1.0],
            },
            {
              icon: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M7 2.5v6L4 15h10l-3-6.5V2.5" stroke="#22D3EE" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 2.5h4" stroke="#22D3EE" strokeWidth="1.35" strokeLinecap="round"/></svg>,
              label: 'Experiment Performance', value: '94.2%', sub: 'Peak accuracy this cycle', accent: '#22D3EE', accentBg: '#ECFEFF', bar: [0.6, 0.7, 0.82, 0.94],
            },
            {
              icon: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="4" cy="9" r="2.5" stroke="#3B82F6" strokeWidth="1.35"/><circle cx="9" cy="4" r="2.5" stroke="#3B82F6" strokeWidth="1.35"/><circle cx="14" cy="9" r="2.5" stroke="#3B82F6" strokeWidth="1.35"/><path d="M6.5 9h1M11 4.8L12.5 7.8" stroke="#3B82F6" strokeWidth="1.2"/></svg>,
              label: 'Lineage Status', value: '142 nodes', sub: '+8 nodes since last sync', accent: '#3B82F6', accentBg: '#DBEAFE', bar: [0.5, 0.65, 0.8, 0.92],
            },
            {
              icon: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="7" cy="6" r="3" stroke="#22D3EE" strokeWidth="1.35"/><path d="M2 15.5c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#22D3EE" strokeWidth="1.35" strokeLinecap="round"/><circle cx="13.5" cy="6.5" r="2" stroke="#22D3EE" strokeWidth="1.2"/><path d="M15.5 14c0-1.93-1.34-3.5-3-3.5" stroke="#22D3EE" strokeWidth="1.2" strokeLinecap="round"/></svg>,
              label: 'Research Activity', value: '4 active', sub: 'Sara, Rifa, Aman, Alex', accent: '#22D3EE', accentBg: '#ECFEFF', bar: [0.3, 0.55, 0.7, 0.85],
            },
          ].map((item, i) => (
            <div key={i} className="home-glance-card" style={{ backgroundColor: item.accentBg + '66' }}>
              <div className="home-glance-card-top">
                <div className="home-glance-card-icon-wrap">
                  {item.icon}
                </div>
                <span className="home-glance-card-label">{item.label}</span>
              </div>
              <div className="home-glance-card-value">{item.value}</div>
              <div className="home-glance-card-sub">{item.sub}</div>
              <div className="home-glance-bars-container">
                {item.bar.map((h, j) => (
                  <div key={j} className="home-glance-bar" style={{ height: `${h * 20}px`, background: `${item.accent}${j === item.bar.length - 1 ? 'cc' : '44'}` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <div className="home-main-grid">

        {/* Recent Experiments */}
        <div className="home-span-2 home-card-box">
          <div className="home-card-header">
            <div>
              <h2 className="home-card-title">Recent Experiments</h2>
              <p className="home-card-subtitle">Last 7 days across all projects</p>
            </div>
            <div className="home-tabs-pill">
              {['recent', 'top'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`home-tab-btn ${activeTab === tab ? 'home-tab-active' : ''}`}>
                  {tab === 'recent' ? 'Recent' : 'Top Runs'}
                </button>
              ))}
            </div>
          </div>
          <div className="home-experiments-table-head">
            <span>#</span><span>Experiment</span><span>Status</span><span style={{ textAlign: 'right' }}>Accuracy</span><span style={{ textAlign: 'right' }}>F1</span><span style={{ textAlign: 'right' }}>Time</span>
          </div>
          <div>
            {displayedExps.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748B' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>No experiments run yet</p>
                <p style={{ margin: '4px 0 16px', fontSize: '13px' }}>Configure and launch your first ML training run.</p>
                <button onClick={() => onNavigate('experiments')} className="home-hero-primary-btn" style={{ margin: '0 auto', fontSize: '13px', padding: '6px 16px' }}>
                  + New Experiment
                </button>
              </div>
            ) : (
              displayedExps.map((exp, i) => {
                const s = STATUS_CFG[exp.status] || STATUS_CFG.queued;
                return (
                  <div key={exp.id || i} className="home-experiments-table-row">
                    <span className="home-exp-num">{String(i + 1).padStart(2, '0')}</span>
                    <div className="home-exp-info">
                      <p className="home-exp-name">{exp.name}</p>
                      <p className="home-exp-meta">{exp.dataset_name || exp.dataset || 'Dataset'} · {exp.model}</p>
                    </div>
                    <span className={`home-status-badge ${s.bg}`}>
                      <span className={`home-status-dot ${s.dot}`} />
                      {s.label}
                    </span>
                    <span className="home-exp-accuracy">{exp.accuracy ? `${exp.accuracy}%` : '—'}</span>
                    <span className="home-exp-f1">{exp.f1 ? `${exp.f1}%` : '—'}</span>
                    <span className="home-exp-time">{exp.execution_time || exp.time || '—'}</span>
                  </div>
                );
              })
            )}
          </div>
          <div className="home-card-footer">
            <button onClick={() => onNavigate('experiments')} className="home-view-all-btn">
              View all experiments
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="home-card-box home-activity-card">
          <div className="home-card-header">
            <div>
              <h2 className="home-card-title">Activity Feed</h2>
              <p className="home-card-subtitle">Workspace timeline</p>
            </div>
          </div>
          <div className="home-activity-body">
            <div className="home-activity-line" />
            <div>
              {activities.length === 0 ? (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748B' }}>
                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 500, color: '#0F172A' }}>No activity yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12.5px' }}>Actions on datasets & experiments will show here.</p>
                </div>
              ) : (
                activities.map((act, i) => (
                  <div key={act.id || i} className="home-activity-item">
                    <ActivityIcon type={act.icon || act.activity_type || 'exp'} color={act.color || '#0D9488'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="home-activity-text">{act.text}</p>
                      <p className="home-activity-time">{act.time || (act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="home-card-footer" style={{ marginTop: 'auto' }}>
            <button onClick={() => onNavigate('projects')} className="home-view-all-btn">
              Full activity log
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom grid ───────────────────────────────────────────────── */}
      <div className="home-main-grid">

        {/* Dataset Evolution */}
        <div className="home-span-2 home-card-box">
          <div className="home-card-header">
            <div>
              <h2 className="home-card-title">Dataset Evolution</h2>
              <p className="home-card-subtitle">Active datasets and version history</p>
            </div>
            <button onClick={() => onNavigate('datasets')} className="home-view-all-btn" style={{ fontSize: '12px' }}>
              Browse all
              <svg width="11" height="11" fill="none" viewBox="0 0 11 11"><path d="M4 2.5L7 5.5L4 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div>
            {datasets.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748B' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>No datasets uploaded yet</p>
                <p style={{ margin: '4px 0 16px', fontSize: '13px' }}>Upload your first research dataset to track versioning and quality.</p>
                <button onClick={() => onNavigate('datasets')} className="home-hero-primary-btn" style={{ margin: '0 auto', fontSize: '13px', padding: '6px 16px' }}>
                  + Upload Dataset
                </button>
              </div>
            ) : (
              datasets.map((ds, i) => (
                <div key={ds.id || i} className="home-dataset-row">
                  <div className="home-dataset-icon-wrap">
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><ellipse cx="8" cy="4.5" rx="5" ry="2" stroke="#0F9D8A" strokeWidth="1.4"/><path d="M3 4.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="#0F9D8A" strokeWidth="1.4"/><path d="M3 7.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="#0F9D8A" strokeWidth="1.4"/></svg>
                  </div>
                  <div className="home-dataset-info">
                    <p className="home-dataset-name">{ds.name}</p>
                    <div className="home-dataset-submeta">
                      <span className="home-dataset-meta-item">{ds.rows_count ?? ds.rows ?? 0} rows</span>
                      <span className="home-dataset-meta-dot">·</span>
                      <span className="home-dataset-meta-item">{ds.size_str || ds.size || '0 MB'}</span>
                    </div>
                  </div>
                  <div className="home-dataset-right">
                    <span className={`home-type-badge type-${ds.type || 'Tabular'}`}>{ds.type || 'Tabular'}</span>
                    <span className="home-dataset-updated">{ds.current_version || ds.currentVersion || 'V1'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column — Copilot */}
        <div>

          {/* Copilot quick-launch card — dark gradient */}
          <div className="home-copilot-card">
            {/* Subtle glow */}
            <div className="home-copilot-glow" />
            <div className="home-copilot-content">
              <div className="home-copilot-top">
                <div className="home-copilot-icon-wrap">
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <circle cx="7" cy="4.5" r="1.8" stroke="#14B8A6" strokeWidth="1.2"/>
                    <circle cx="3" cy="9.5" r="1.5" stroke="#14B8A6" strokeWidth="1.1"/>
                    <circle cx="11" cy="9.5" r="1.5" stroke="#14B8A6" strokeWidth="1.1"/>
                    <path d="M5.2 6.2L3.8 8.2M8.8 6.2L10.2 8.2" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.6"/>
                    <path d="M5.5 4.5h.5l.5-1.2.6 2.4.4-1.2H8.5" stroke="#22D3EE" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="home-copilot-title">Research Copilot</p>
                  <div className="home-copilot-status">
                    <span className="home-copilot-dot animate-pulse" />
                    <span className="home-copilot-status-text">Context loaded</span>
                  </div>
                </div>
              </div>
              <p className="home-copilot-desc">
                Ask anything about datasets, experiments, and lineage.
              </p>
              <button onClick={() => onNavigate('copilot')}
                className="home-copilot-trigger-btn">
                <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M9 9L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Open full Copilot...
                <span className="home-copilot-trigger-kbd">⌘K</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
