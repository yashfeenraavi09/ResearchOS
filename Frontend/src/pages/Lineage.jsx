import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchLineage } from '../lib/api';
import { NODE_CFG, EDGE_CFG } from '../data/lineage';
import './Lineage.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const NW = 172;  // node width
const NH = 76;   // node height

const ALL_TYPES = ['dataset', 'dataset_version', 'transformation', 'experiment', 'model', 'evaluation', 'result'];

const TYPE_PLAIN = {
  dataset:         'The original raw data source — the starting point for all research.',
  dataset_version: 'A versioned snapshot of the dataset after processing steps.',
  transformation:  'A processing step that cleaned, filtered, or enriched the data.',
  experiment:      'A model training run with a specific configuration and dataset.',
  model:           'A trained AI model produced by an experiment run.',
  evaluation:      'A test measuring how well the model performs on unseen data.',
  result:          'Final performance metrics — accuracy, F1 score, and rankings.',
};

// Stage swim-lane definitions
const SWIM_LANES = [
  { label: 'Data Preparation', sublabel: 'Source → Versions → Transforms', x: 40,   w: 1820, color: '#0F9D8A' },
  { label: 'Model Training',   sublabel: 'Experiments → Trained Models',   x: 1870, w: 470,  color: '#8B5CF6' },
  { label: 'Evaluation & Results', sublabel: 'Testing → Performance Scores', x: 2354, w: 488, color: '#10B981' },
];

// Stage jump shortcuts
const STAGE_JUMPS = [
  { label: 'Source',      nodeId: 'src-pubmed' },
  { label: 'Versions',    nodeId: 'ds-v4' },
  { label: 'Experiments', nodeId: 'exp-roberta' },
  { label: 'Models',      nodeId: 'model-bert-large' },
  { label: 'Results',     nodeId: 'result-3' },
];

const LIVE_TEMPLATES = [
  {
    node: { id: 'live-1', type: 'experiment', label: 'LLaMA-3 Fine-tune', sublabel: 'live-run · queued · V4', x: 1916, y: 400, status: 'running', updatedAt: 'Just now', meta: { ID: 'live-001', Model: 'LLaMA-3-70B', 'Learning Rate': '5e-6', Status: 'Queued', GPU: 'A100 80GB' } },
    edge: { id: 'el-1', source: 'ds-v4', target: 'live-1', label: 'USED_IN' },
  },
  {
    node: { id: 'live-2', type: 'dataset_version', label: 'PubMed-2024 V5', sublabel: 'In progress · +180K rows', x: 1916, y: 520, status: 'running', updatedAt: 'Just now', meta: { Version: 'V5 (draft)', Status: 'Ingesting', Source: 'PubMed FTP', Rows: '+180,000 (live)' } },
    edge: { id: 'el-2', source: 'tr-expand', target: 'live-2', label: 'GENERATED', animated: true },
  },
];

// ─── Details panel ────────────────────────────────────────────────────────────
function DetailsPanel({ node, upstream, downstream, onClose, onNavigate }) {
  const c = NODE_CFG[node.type];

  return (
    <div className="lineage-details-panel">
      {/* Header */}
      <div className="lineage-details-hdr">
        <div className="lineage-details-top-row">
          <span className="lineage-details-type-tag" style={{ backgroundColor: c.accentBg, color: c.accent }}>
            {c.label}
          </span>
          <button onClick={onClose} className="lineage-details-close-btn">
            <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>
        <h3 className="lineage-details-name">{node.label}</h3>
        <p className="lineage-details-sub">{node.sublabel}</p>
        <div className="lineage-details-status-row">
          <span className={`lineage-details-status-pill ${node.status}`}>
            {node.status === 'running' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} className="animate-pulse" />}
            {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
          </span>
          {node.updatedAt && <span className="lineage-details-time">{node.updatedAt}</span>}
        </div>
      </div>

      <div className="lineage-details-body">
        {/* Plain-English explanation */}
        <div className="lineage-details-plain-box">
          <p className="lineage-details-plain-title">What is this?</p>
          <p className="lineage-details-plain-desc">{TYPE_PLAIN[node.type]}</p>
        </div>

        {/* Metadata */}
        {node.meta && Object.keys(node.meta).length > 0 && (
          <div className="lineage-details-sec">
            <p className="lineage-details-sec-title">Details</p>
            <div className="lineage-details-meta-table">
              {Object.entries(node.meta).map(([k, v]) => (
                <div key={k} className="lineage-details-meta-row">
                  <span className="lineage-details-meta-k">{k}</span>
                  <span className="lineage-details-meta-v">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upstream / Downstream connections */}
        {(upstream.length > 0 || downstream.length > 0) && (
          <div className="lineage-details-sec" style={{ marginBottom: '16px' }}>
            <p className="lineage-details-sec-title">Connections</p>
            <div>
              {upstream.map(id => (
                <button key={id} onClick={() => onNavigate(id)} className="lineage-conn-btn">
                  <svg width="10" height="10" fill="none" viewBox="0 0 10 10" style={{ color: '#94A3B8', flexShrink: 0 }}>
                    <path d="M8 5H2M2 5l2.5-2.5M2 5l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="lineage-conn-name">{id}</span>
                  <span className="lineage-conn-tag">upstream</span>
                </button>
              ))}
              {downstream.map(id => (
                <button key={id} onClick={() => onNavigate(id)} className="lineage-conn-btn">
                  <svg width="10" height="10" fill="none" viewBox="0 0 10 10" style={{ color: '#0F9D8A', flexShrink: 0 }}>
                    <path d="M2 5h6M8 5L5.5 2.5M8 5L5.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="lineage-conn-name">{id}</span>
                  <span className="lineage-conn-tag">downstream</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SVG Node ─────────────────────────────────────────────────────────────────
function GraphNode({ node, selected, isNew, dimmed, onClick }) {
  const c = NODE_CFG[node.type];
  const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
  const isBest = node.status === 'best';
  const isRunning = node.status === 'running';
  const isActive = node.status === 'active';

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      onClick={onClick}
      data-node="1"
      style={{ cursor: 'pointer', opacity: dimmed ? 0.25 : 1, transition: 'opacity 0.25s ease' }}
    >
      {/* Selection glow */}
      {selected && (
        <rect
          x="-5" y="-5" width={NW + 10} height={NH + 10} rx="16"
          fill={c.accentBg} stroke={c.accent} strokeWidth="1.5" strokeOpacity="0.4"
        />
      )}
      {/* Best glow */}
      {isBest && !selected && (
        <rect
          x="-4" y="-4" width={NW + 8} height={NH + 8} rx="15"
          fill="rgba(245,158,11,0.10)" stroke="#F59E0B" strokeWidth="1.2" strokeOpacity="0.35"
        />
      )}

      {/* Card body */}
      <rect
        width={NW} height={NH} rx="12" fill="white"
        stroke={selected ? c.accent : isBest ? '#F59E0B' : '#E2E8F0'}
        strokeWidth={selected ? 2 : isBest ? 1.5 : 1.2}
      />

      {/* Colored left stripe */}
      <clipPath id={`clip-${node.id}`}><rect width={NW} height={NH} rx="12" /></clipPath>
      <rect clipPath={`url(#clip-${node.id})`} x="0" y="0" width="4" height={NH} fill={c.accent} />

      {/* Type badge */}
      <rect x="10" y="10" width={c.label.length * 5.5 + 10} height="14" rx="4" fill={c.accentBg} />
      <text
        x="15" y="20.5" fill={c.accent} fontSize="8" fontWeight="700"
        fontFamily="'DM Mono', monospace" letterSpacing="0.05em"
      >
        {c.label.toUpperCase()}
      </text>

      {/* Status indicator */}
      {isActive && <circle cx={NW - 11} cy="13" r="4" fill="#10B981" />}
      {isBest && (
        <g>
          <rect x={NW - 38} y="7" width="30" height="14" rx="4" fill="rgba(245,158,11,0.15)" />
          <text x={NW - 23} y="17" textAnchor="middle" fontSize="8" fill="#D97706" fontWeight="700" fontFamily="'Inter',sans-serif">BEST</text>
        </g>
      )}
      {isRunning && (
        <circle cx={NW - 11} cy="13" r="4" fill="#0F9D8A">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}
      {isNew && (
        <rect x={NW - 36} y="7" width="28" height="13" rx="4" fill={c.accent}>
          <animate attributeName="opacity" values="0.85;0.35;0.85" dur="2s" repeatCount="indefinite" />
        </rect>
      )}
      {isNew && <text x={NW - 22} y="16.5" fontSize="7" fill="white" fontWeight="700" textAnchor="middle" fontFamily="'Inter',sans-serif">LIVE</text>}

      {/* Main label */}
      <text x="11" y="42" fill="#0B1220" fontSize="12.5" fontWeight="600" fontFamily="'Inter', sans-serif">
        {trunc(node.label, 19)}
      </text>

      {/* Sublabel */}
      <text x="11" y="58" fill="#8896A7" fontSize="10" fontFamily="'Inter', sans-serif">
        {trunc(node.sublabel, 24)}
      </text>
    </g>
  );
}

// ─── SVG Edge (horizontal S-curve) ───────────────────────────────────────────
function GraphEdge({ edge, nodes, selected, showLabel, dimmed }) {
  const src = nodes.get(edge.source);
  const tgt = nodes.get(edge.target);
  if (!src || !tgt) return null;

  const cfg = EDGE_CFG[edge.label];

  const x1 = src.x + NW;
  const y1 = src.y + NH / 2;
  const x2 = tgt.x;
  const y2 = tgt.y + NH / 2;
  const gap = x2 - x1;
  const bend = Math.max(Math.abs(gap) * 0.45, 40);
  const path = `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2 - 2;

  const strokeColor = dimmed ? '#E2E8F0' : cfg.color;
  const opacity = dimmed ? 0.15 : selected ? 1 : 0.65;

  return (
    <g style={{ opacity, transition: 'opacity 0.25s' }}>
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={selected ? 2.5 : 1.8}
        strokeDasharray={edge.animated ? '6,4' : (cfg.dash ?? undefined)}
        markerEnd={`url(#arr-${edge.label})`}
      >
        {edge.animated && (
          <animate attributeName="stroke-dashoffset" values="20;0" dur="0.8s" repeatCount="indefinite" />
        )}
      </path>
      {showLabel && !dimmed && (
        <g>
          <rect
            x={midX - 32} y={midY - 9} width="64" height="15" rx="5"
            fill="white" stroke={cfg.color} strokeWidth="1" opacity="0.96"
          />
          <text
            x={midX} y={midY + 3} textAnchor="middle" fontSize="7.5" fill={cfg.color}
            fontWeight="700" fontFamily="'DM Mono', monospace" letterSpacing="0.04em"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}

export default function Lineage() {
  const svgRef = useRef(null);
  const [vp, setVp] = useState({ x: 30, y: 60, scale: 0.48 });
  const panning = useRef(false);
  const panOrigin = useRef({ mx: 0, my: 0, vx: 0, vy: 0 });

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set(ALL_TYPES));
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [liveItems, setLiveItems] = useState([]);
  const [pulseIds, setPulseIds] = useState(new Set());
  const [lineageData, setLineageData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = await fetchLineage();
      if (mounted && data && Array.isArray(data.nodes)) {
        setLineageData(data);
        setLoading(false);
      }
    }

    load();

    // Live polling every 5s to update canvas with new pipeline nodes
    const interval = setInterval(load, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const allNodes = [...(lineageData.nodes || []), ...liveItems.map(l => l.node)];
  const allEdges = [...(lineageData.edges || []), ...liveItems.map(l => l.edge)];
  const nodeMap = new Map(allNodes.map(n => [n.id, n]));

  const searchLower = search.toLowerCase();
  const visibleNodes = allNodes.filter(n =>
    activeFilters.has(n.type) &&
    (searchLower === '' || n.label.toLowerCase().includes(searchLower) || n.sublabel.toLowerCase().includes(searchLower))
  );
  const visibleIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = allEdges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));

  // Connected IDs for dimming
  const connectedIds = selectedId ? new Set([selectedId]) : null;
  if (connectedIds) {
    allEdges.forEach(e => {
      if (e.source === selectedId) connectedIds.add(e.target);
      if (e.target === selectedId) connectedIds.add(e.source);
    });
  }

  // Upstream / downstream for selected node
  const upstream = selectedId ? allEdges.filter(e => e.target === selectedId).map(e => e.source) : [];
  const downstream = selectedId ? allEdges.filter(e => e.source === selectedId).map(e => e.target) : [];

  // Live simulation
  useEffect(() => {
    const iv = setInterval(() => {
      setLiveItems(prev => {
        const template = LIVE_TEMPLATES[prev.length % LIVE_TEMPLATES.length];
        if (prev.find(l => l.node.id === template.node.id)) return prev;
        setPulseIds(p => new Set([...p, template.node.id]));
        setTimeout(() => setPulseIds(p => { const n = new Set(p); n.delete(template.node.id); return n; }), 5000);
        return [...prev, template];
      });
    }, 14000);
    return () => clearInterval(iv);
  }, []);

  const fitToScreen = useCallback(() => {
    if (!svgRef.current || allNodes.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xs = allNodes.map(n => n.x);
    const ys = allNodes.map(n => n.y);
    const minX = Math.min(...xs) - 60;
    const minY = Math.min(...ys) - 80;
    const maxX = Math.max(...xs) + NW + 60;
    const maxY = Math.max(...ys) + NH + 60;
    const scaleX = rect.width / (maxX - minX);
    const scaleY = rect.height / (maxY - minY);
    const scale = Math.min(scaleX, scaleY, 1.0) * 0.9;
    const x = (rect.width - (maxX - minX) * scale) / 2 - minX * scale;
    const y = (rect.height - (maxY - minY) * scale) / 2 - minY * scale;
    setVp({ x, y, scale });
  }, [allNodes]);

  useEffect(() => { fitToScreen(); }, []);

  function jumpToNode(id) {
    const node = nodeMap.get(id);
    if (!node || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = 0.72;
    const x = rect.width / 2 - (node.x + NW / 2) * scale;
    const y = rect.height / 2 - (node.y + NH / 2) * scale;
    setVp({ x, y, scale });
    setSelectedId(id);
  }

  function onMouseDown(e) {
    if (e.target.closest('[data-node]')) return;
    panning.current = true;
    panOrigin.current = { mx: e.clientX, my: e.clientY, vx: vp.x, vy: vp.y };
    e.currentTarget.style.cursor = 'grabbing';
  }
  function onMouseMove(e) {
    if (!panning.current) return;
    setVp(v => ({ ...v, x: panOrigin.current.vx + (e.clientX - panOrigin.current.mx), y: panOrigin.current.vy + (e.clientY - panOrigin.current.my) }));
  }
  function onMouseUp(e) {
    panning.current = false;
    e.currentTarget.style.cursor = 'grab';
  }

  function onWheel(e) {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    const ns = Math.max(0.2, Math.min(2.5, vp.scale * factor));
    setVp({ scale: ns, x: mx - (mx - vp.x) * (ns / vp.scale), y: my - (my - vp.y) * (ns / vp.scale) });
  }

  function toggleFilter(type) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(type) && next.size > 1) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const selectedNode = selectedId ? nodeMap.get(selectedId) || null : null;

  return (
    <div className="lineage-container">
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="lineage-toolbar">
        {/* Stage jump pills */}
        <div className="lineage-jumps-wrap">
          <span className="lineage-toolbar-lbl">Jump to</span>
          {STAGE_JUMPS.map(s => (
            <button key={s.nodeId} onClick={() => jumpToNode(s.nodeId)} className="lineage-jump-btn">
              {s.label}
            </button>
          ))}
        </div>

        <div className="lineage-divider-v" />

        {/* Zoom controls */}
        <div className="lineage-zoom-controls">
          <button onClick={() => setVp(v => ({ ...v, scale: Math.min(2.5, v.scale * 1.18) }))} className="lineage-zoom-btn">+</button>
          <span className="lineage-zoom-val">{Math.round(vp.scale * 100)}%</span>
          <button onClick={() => setVp(v => ({ ...v, scale: Math.max(0.2, v.scale * 0.85) }))} className="lineage-zoom-btn">−</button>
        </div>

        <button onClick={fitToScreen} className="lineage-fit-btn">
          <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
            <rect x="1" y="1" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="7.5" y="1" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="1" y="7.5" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="7.5" y="7.5" width="3.5" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          Fit all
        </button>

        {/* Search */}
        <div className="lineage-search-wrap">
          <svg className="lineage-search-icon" width="12" height="12" fill="none" viewBox="0 0 12 12">
            <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes…"
            className="lineage-search-input"
          />
        </div>

        {/* Edge labels */}
        <button
          onClick={() => setShowEdgeLabels(v => !v)}
          className={`lineage-labels-btn ${showEdgeLabels ? 'active' : 'inactive'}`}
        >
          <svg width="11" height="11" fill="none" viewBox="0 0 11 11">
            <path d="M1 2.5h9M1 5.5h9M1 8.5h5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Labels
        </button>

        {/* Node type filters */}
        <div className="lineage-type-filters">
          {ALL_TYPES.map(type => {
            const cfg = NODE_CFG[type];
            const on = activeFilters.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className="lineage-type-filter-chip"
                style={on ? { backgroundColor: cfg.accent, color: '#ffffff', borderColor: 'transparent' } : { backgroundColor: '#ffffff', color: cfg.accent, borderColor: '#E2E8F0' }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Live + stats */}
        <div className="lineage-stats-right">
          {liveItems.length > 0 && (
            <div className="lineage-live-indicator">
              <span className="lineage-live-dot animate-pulse" />
              <span className="lineage-live-text">Live</span>
            </div>
          )}
          <span className="lineage-counts-text">{visibleNodes.length} nodes · {visibleEdges.length} edges</span>
        </div>
      </div>

      {/* ── Canvas + panel ───────────────────────────────────────────────────── */}
      <div className="lineage-main-area">
        <div className="lineage-canvas-wrap" style={{ position: 'relative' }}>
          {visibleNodes.length === 0 && !loading && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '24px 32px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E2E8F0',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#E6F7F5',
                color: '#0F9D8A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5" cy="6" r="3" />
                  <circle cx="19" cy="6" r="3" />
                  <circle cx="12" cy="18" r="3" />
                  <line x1="7.5" y1="7.5" x2="10.5" y2="15.5" />
                  <line x1="16.5" y1="7.5" x2="13.5" y2="15.5" />
                </svg>
              </div>
              <p style={{ fontWeight: 600, color: '#0F172A', margin: '0 0 4px', fontSize: '14px' }}>No lineage nodes found</p>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>Upload datasets and train models to map your research provenance.</p>
            </div>
          )}
          <svg
            ref={svgRef}
            className="lineage-svg-canvas"
            style={{ cursor: 'grab' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
          >
            <defs>
              {/* Arrow markers */}
              {Object.entries(EDGE_CFG).map(([label, cfg]) => (
                <marker
                  key={label}
                  id={`arr-${label}`}
                  markerWidth="9"
                  markerHeight="7"
                  refX="8"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 9 3.5, 0 7" fill={cfg.color} opacity="0.85" />
                </marker>
              ))}
              {/* Dot grid */}
              <pattern id="dotgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="14" cy="14" r="0.8" fill="#CBD5E0" opacity="0.45" />
              </pattern>
            </defs>

            {/* Background */}
            <rect width="100%" height="100%" fill="url(#dotgrid)" />

            <g transform={`translate(${vp.x},${vp.y}) scale(${vp.scale})`}>
              {/* ── Swim lane backgrounds ───────────────────────────────── */}
              {SWIM_LANES.map(lane => (
                <g key={lane.label}>
                  <rect
                    x={lane.x} y={0} width={lane.w} height={700} rx="0"
                    fill={lane.color} fillOpacity="0.03"
                  />
                  <line
                    x1={lane.x} y1={0} x2={lane.x + lane.w} y2={0}
                    stroke={lane.color} strokeWidth="1.5" strokeOpacity="0.15"
                  />
                  <rect
                    x={lane.x + 12} y={8} width={lane.w - 24} height={56} rx="10"
                    fill={lane.color} fillOpacity="0.06"
                  />
                  <text
                    x={lane.x + lane.w / 2} y={30} textAnchor="middle"
                    fill={lane.color} fontSize="11" fontWeight="800"
                    fontFamily="'DM Mono', monospace" letterSpacing="0.08em" fillOpacity="0.75"
                  >
                    {lane.label.toUpperCase()}
                  </text>
                  <text
                    x={lane.x + lane.w / 2} y={48} textAnchor="middle"
                    fill={lane.color} fontSize="9.5" fontFamily="'Inter', sans-serif" fillOpacity="0.55"
                  >
                    {lane.sublabel}
                  </text>
                  <line
                    x1={lane.x} y1={0} x2={lane.x} y2={700}
                    stroke={lane.color} strokeWidth="1.5" strokeOpacity="0.2"
                    strokeDasharray="4,4"
                  />
                </g>
              ))}

              {/* ── Edges (behind nodes) ────────────────────────────────── */}
              {visibleEdges.map(edge => (
                <GraphEdge
                  key={edge.id}
                  edge={edge}
                  nodes={nodeMap}
                  selected={!!connectedIds && connectedIds.has(edge.source) && connectedIds.has(edge.target)}
                  showLabel={showEdgeLabels}
                  dimmed={!!connectedIds && !(connectedIds.has(edge.source) && connectedIds.has(edge.target))}
                />
              ))}

              {/* ── Nodes ───────────────────────────────────────────────── */}
              {visibleNodes.map(node => (
                <GraphNode
                  key={node.id}
                  node={node}
                  selected={selectedId === node.id}
                  isNew={pulseIds.has(node.id)}
                  dimmed={!!connectedIds && !connectedIds.has(node.id)}
                  onClick={() => setSelectedId(selectedId === node.id ? null : node.id)}
                />
              ))}
            </g>
          </svg>

          {/* Controls overlay */}
          <div className="lineage-hint-overlay">
            {!selectedId && (
              <div className="lineage-hint-pill">
                Scroll to zoom · Drag to pan · Click a node for details
              </div>
            )}
          </div>

          {/* Live toast */}
          {liveItems.length > 0 && (
            <div className="lineage-toast">
              <span className="lineage-toast-dot animate-pulse" />
              <span className="lineage-toast-title">Live update</span>
              <span className="lineage-toast-sub">+{liveItems.length} new node{liveItems.length > 1 ? 's' : ''} added</span>
            </div>
          )}
        </div>

        {/* ── Detail panel ───────────────────────────────────────────────── */}
        {selectedNode && (
          <DetailsPanel
            node={selectedNode}
            upstream={upstream}
            downstream={downstream}
            onClose={() => setSelectedId(null)}
            onNavigate={id => { setSelectedId(id); jumpToNode(id); }}
          />
        )}
      </div>

      {/* ── Legend bar ──────────────────────────────────────────────────────── */}
      <div className="lineage-legend-bar">
        <span className="lineage-legend-lbl">Node types</span>
        {ALL_TYPES.map(type => {
          const c = NODE_CFG[type];
          return (
            <div key={type} className="lineage-legend-type-item">
              <div className="lineage-legend-type-swatch" style={{ backgroundColor: c.accent }} />
              <span className="lineage-legend-type-text">{c.label}</span>
            </div>
          );
        })}
        <div className="lineage-legend-rel-sec">
          <span className="lineage-legend-lbl" style={{ marginRight: '4px' }}>Relationships</span>
          {['USED_IN', 'GENERATED', 'EVALUATED_BY', 'PRODUCED'].map(label => {
            const cfg = EDGE_CFG[label];
            return (
              <div key={label} className="lineage-legend-rel-item">
                <svg width="22" height="8" viewBox="0 0 22 8">
                  <line x1="0" y1="4" x2="16" y2="4" stroke={cfg.color} strokeWidth="1.6" strokeDasharray={cfg.dash} />
                  <polygon points="15,1 22,4 15,7" fill={cfg.color} />
                </svg>
                <span className="lineage-legend-rel-text">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
