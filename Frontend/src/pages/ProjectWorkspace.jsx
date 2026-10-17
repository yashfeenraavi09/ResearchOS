import { useState, useEffect } from 'react';
import { fetchProject } from '../lib/api';
import InviteResearcher from './InviteResearcher';
import './ProjectWorkspace.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'pipelines', label: 'Pipelines' },
  { id: 'documents', label: 'Documents' },
  { id: 'lineage', label: 'Collaborative Lineage' },
  { id: 'activity', label: 'Activity History' },
];

const STATUS_COLORS = {
  completed: { bg: 'completed', text: 'completed', dot: '#16A34A' },
  running: { bg: 'running', text: 'running', dot: '#2563EB' },
  queued: { bg: 'queued', text: 'queued', dot: '#D97706' },
  failed: { bg: 'failed', text: 'failed', dot: '#DC2626' },
  active: { bg: 'active', text: 'active', dot: '#0F9D8A' },
  draft: { bg: 'draft', text: 'draft', dot: '#D97706' },
  archived: { bg: 'archived', text: 'archived', dot: '#94A3B8' },
};

function Avatar({ c, size = 32 }) {
  if (!c) return null;
  return (
    <div
      title={`${c.name} · ${c.role || 'Contributor'}`}
      className="proj-ws-avatar-item"
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 600,
        backgroundColor: c.avatarColor || '#0F9D8A',
        fontSize: size * 0.34,
      }}
    >
      {c.initials || c.name?.slice(0, 2).toUpperCase() || 'U'}
    </div>
  );
}

function ActionTypeBadge({ action }) {
  return (
    <span className={`proj-ws-action-pill ${action}`}>
      {action}
    </span>
  );
}

const NODE_COLORS = {
  dataset:        { bg: '#E6F7F5', border: '#0F9D8A', text: '#0F9D8A' },
  transformation: { bg: '#EDE9FE', border: '#7C3AED', text: '#7C3AED' },
  experiment:     { bg: '#F3E8FF', border: '#8B5CF6', text: '#8B5CF6' },
  result:         { bg: '#DCFCE7', border: '#16A34A', text: '#16A34A' },
};

function CollabLineage({ nodes = [], edgePairs = [], contributors = [] }) {
  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
        No lineage graph elements recorded for this project yet.
      </div>
    );
  }

  const contribMap = Object.fromEntries(contributors.map(c => [c.id, c]));
  const NW = 160, NH = 50, SVG_W = 600;
  const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => n.y || 100)) : 400;
  const SVG_H = maxY + 100;

  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%' }}>
      <defs>
        <marker id="cla-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 z" fill="#94A3B8" />
        </marker>
      </defs>

      {/* Edges */}
      {edgePairs.map(([sId, tId], i) => {
        const s = nodes.find(n => n.id === sId);
        const t = nodes.find(n => n.id === tId);
        if (!s || !t) return null;
        const x1 = SVG_W / 2, y1 = (s.y || 50) + NH / 2;
        const x2 = SVG_W / 2, y2 = (t.y || 150) - NH / 2;
        const cy = (y1 + y2) / 2;
        return (
          <path
            key={i}
            d={`M${x1},${y1} C${x1},${cy} ${x2},${cy} ${x2},${y2}`}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            markerEnd="url(#cla-arrow)"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(n => {
        const cx = SVG_W / 2 - NW / 2;
        const cfg = NODE_COLORS[n.type] || NODE_COLORS.dataset;
        const contributor = contribMap[n.contributorId];
        const statusCfg = STATUS_COLORS[n.status] || STATUS_COLORS.active;
        return (
          <g key={n.id} transform={`translate(${cx},${(n.y || 50) - NH / 2})`}>
            <rect
              width={NW} height={NH} rx={8}
              fill={cfg.bg} stroke={cfg.border} strokeWidth="1.5"
            />
            {/* Type label */}
            <text x={10} y={16} fontSize={9} fill={cfg.text} fontWeight="600" fontFamily="Inter, sans-serif">
              {(n.type || 'dataset').toUpperCase()}
            </text>
            {/* Main label */}
            <text x={10} y={30} fontSize={12} fill="#0B1220" fontWeight="600" fontFamily="Inter, sans-serif">
              {(n.label || n.name || '').length > 18 ? (n.label || n.name).slice(0, 17) + '…' : (n.label || n.name || '')}
            </text>
            {/* Status dot */}
            <circle cx={NW - 12} cy={NH / 2} r={4} fill={statusCfg?.dot || '#94A3B8'} />
            {/* Contributor avatar */}
            {contributor && (
              <g transform={`translate(${NW + 8},${NH / 2 - 12})`}>
                <circle cx={12} cy={12} r={12} fill={contributor.avatarColor || '#0F9D8A'} />
                <text x={12} y={16} textAnchor="middle" fontSize={8} fill="white" fontWeight="700" fontFamily="Inter, sans-serif">
                  {contributor.initials || 'U'}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ProjectWorkspace({ projectId, onBack }) {
  const [tab, setTab] = useState('overview');
  const [showInvite, setShowInvite] = useState(false);
  const [docOpen, setDocOpen] = useState(null);
  const [rawProject, setRawProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchProject(projectId);
        setRawProject(data);
      } catch (err) {
        console.error('Failed to load project', err);
      } finally {
        setLoading(false);
      }
    }
    if (projectId) load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="proj-ws-container" style={{ padding: '60px 0', textAlign: 'center', color: '#6B7C93' }}>
        Loading project workspace…
      </div>
    );
  }

  if (!rawProject) {
    return (
      <div className="proj-ws-container" style={{ padding: '40px 0' }}>
        <button onClick={onBack} className="proj-ws-breadcrumb">
          ← Back to Projects
        </button>
        <div style={{ color: '#EF4444', marginTop: '20px' }}>Project not found or failed to load.</div>
      </div>
    );
  }

  const p = {
    id: rawProject.id,
    projectId: rawProject.id?.slice(0, 8)?.toUpperCase() || 'PRJ',
    name: rawProject.name || 'Untitled Project',
    description: rawProject.description || '',
    visibility: rawProject.visibility || 'team',
    status: rawProject.status || 'active',
    tags: Array.isArray(rawProject.tags) ? rawProject.tags : [],
    admin: rawProject.admin || 'Project Owner',
    createdAt: rawProject.created_at ? new Date(rawProject.created_at).toLocaleDateString() : 'Recently',
    lastActivity: rawProject.updated_at ? new Date(rawProject.updated_at).toLocaleDateString() : 'Just now',
    contributors: rawProject.contributors || [
      { id: 'owner', name: 'Project Owner', role: 'Project Admin', initials: 'PO', avatarColor: '#0F9D8A', contributions: 1 }
    ],
    datasets: rawProject.datasets || [],
    experiments: rawProject.experiments || [],
    pipelines: rawProject.pipelines || [],
    documents: rawProject.documents || [],
    activity: rawProject.activity || [],
    lineageNodes: rawProject.lineageNodes || [],
    lineageEdges: rawProject.lineageEdges || [],
  };

  const openDoc = p.documents?.find(d => d.id === docOpen);

  return (
    <div className="proj-ws-container">
      {/* Breadcrumb */}
      <button onClick={onBack} className="proj-ws-breadcrumb">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Projects
        <span className="proj-ws-sep">/</span>
        <span className="proj-ws-current-name">{p.name}</span>
      </button>

      {/* Project header */}
      <div className="proj-ws-card card-shadow">
        <div className="proj-ws-hdr-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="proj-ws-hdr-meta-row">
              <span className="proj-ws-id-badge">{p.projectId}</span>
              <span className="proj-ws-status-active">Active</span>
              <span className="proj-ws-vis-text">{p.visibility === 'team' ? '👥 Team' : p.visibility === 'public' ? '🌐 Public' : '🔒 Private'}</span>
            </div>
            <h1 className="proj-ws-title">{p.name}</h1>
            <p className="proj-ws-desc">{p.description}</p>
            <div className="proj-ws-tags-wrap">
              {p.tags.map(t => <span key={t} className="proj-ws-tag">{t}</span>)}
            </div>
          </div>
          <div className="proj-ws-hdr-actions">
            <div className="proj-ws-avatar-stack">
              {p.contributors.map(c => <Avatar key={c.id} c={c} />)}
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="proj-ws-invite-btn"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Invite
            </button>
          </div>
        </div>
        <div className="proj-ws-hdr-footer">
          <span>Admin: <strong>{p.admin}</strong></span>
          <span>Created {p.createdAt}</span>
          <span>Last activity {p.lastActivity}</span>
          <span>{p.contributors.length} contributors</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="proj-ws-tabs-bar card-shadow">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`proj-ws-tab-btn ${tab === t.id ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="proj-ws-overview-grid">
          <div className="proj-ws-col-left">
            {/* Stats */}
            <div className="proj-ws-stats-row">
              {[
                { label: 'Datasets', value: p.datasets.length, color: '#0F9D8A' },
                { label: 'Experiments', value: p.experiments.length, color: '#8B5CF6' },
                { label: 'Contributors', value: p.contributors.length, color: '#22C7D6' },
              ].map(s => (
                <div key={s.label} className="proj-ws-stat-cell card-shadow">
                  <div className="proj-ws-stat-num" style={{ color: s.color }}>{s.value}</div>
                  <div className="proj-ws-stat-text">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Recent Activity */}
            <div className="proj-ws-card card-shadow" style={{ margin: 0 }}>
              <h3 className="proj-ws-card-heading">Recent Activity</h3>
              <div className="proj-ws-activity-list">
                {p.activity.slice(0, 5).map(a => {
                  const c = p.contributors.find(x => x.id === a.contributorId) || p.contributors[0];
                  return (
                    <div key={a.id} className="proj-ws-activity-row">
                      <Avatar c={c} size={28} />
                      <div className="proj-ws-activity-content">
                        <div className="proj-ws-activity-meta">
                          <span className="proj-ws-activity-name">{c.name}</span>
                          <ActionTypeBadge action={a.action} />
                          <span className="proj-ws-activity-res">{a.resource}</span>
                        </div>
                        {a.detail && <p className="proj-ws-activity-detail">"{a.detail}"</p>}
                      </div>
                      <span className="proj-ws-activity-time">{a.timeAgo}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setTab('activity')} className="proj-ws-view-all-link">View all activity →</button>
            </div>
          </div>
          {/* Team panel */}
          <div className="proj-ws-col-right">
            <div className="proj-ws-card card-shadow" style={{ margin: 0 }}>
              <div className="proj-ws-team-row-top">
                <h3 className="proj-ws-card-heading" style={{ margin: 0 }}>Team</h3>
                <button onClick={() => setShowInvite(true)} className="proj-ws-view-all-link" style={{ margin: 0 }}>+ Invite</button>
              </div>
              <div className="proj-ws-team-list">
                {p.contributors.map(c => (
                  <div key={c.id} className="proj-ws-team-member">
                    <Avatar c={c} size={32} />
                    <div className="proj-ws-team-info">
                      <div className="proj-ws-team-name">{c.name}</div>
                      <div className="proj-ws-team-sub">
                        <span className={`proj-ws-role-tag ${c.role === 'Project Admin' ? 'admin' : c.role === 'Reviewer' ? 'reviewer' : 'contributor'}`}>
                          {c.role}
                        </span>
                        <span style={{ fontSize: '10px', color: '#CBD5E1' }}>·</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{c.contributions} commits</span>
                      </div>
                    </div>
                    <span className="proj-ws-team-dot" title="Active" />
                  </div>
                ))}
              </div>
            </div>
            {/* Quick links */}
            <div className="proj-ws-card card-shadow" style={{ margin: 0 }}>
              <h3 className="proj-ws-card-heading" style={{ marginBottom: '12px' }}>Quick Access</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><ellipse cx="7" cy="4" rx="4.5" ry="1.8" stroke="#0F9D8A" strokeWidth="1.25"/><path d="M2.5 4v3c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8V4" stroke="#0F9D8A" strokeWidth="1.25"/><path d="M2.5 7v2.5c0 1 2 1.8 4.5 1.8s4.5-.8 4.5-1.8V7" stroke="#0F9D8A" strokeWidth="1.25"/></svg>, label: 'Latest Dataset', sub: p.datasets[p.datasets.length - 1]?.name || '—' },
                  { icon: <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M5.5 2v5L3 12h8l-2.5-5V2" stroke="#8B5CF6" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 2h3" stroke="#8B5CF6" strokeWidth="1.25" strokeLinecap="round"/></svg>, label: 'Best Experiment', sub: p.experiments.find(e => e.status === 'completed')?.name || '—' },
                  { icon: <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><rect x="2.5" y="1.5" width="9" height="11" rx="1.5" stroke="#6B7C93" strokeWidth="1.25"/><path d="M5 5h4M5 7.5h2.5" stroke="#6B7C93" strokeWidth="1.25" strokeLinecap="round"/></svg>, label: 'Latest Document', sub: p.documents[p.documents.length - 1]?.title || '—' },
                ].map(q => (
                  <div key={q.label} className="proj-ws-quick-item">
                    <span style={{ flexShrink: 0 }}>{q.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="proj-ws-quick-title">{q.label}</div>
                      <div className="proj-ws-quick-sub">{q.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Datasets ── */}
      {tab === 'datasets' && (
        <div className="proj-ws-card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 className="proj-ws-card-heading" style={{ margin: 0 }}>{p.datasets.length} Datasets</h3>
          </div>
          <table className="proj-ws-table">
            <thead>
              <tr>
                <th className="proj-ws-th">Name</th>
                <th className="proj-ws-th">Version</th>
                <th className="proj-ws-th">Rows</th>
                <th className="proj-ws-th">Size</th>
                <th className="proj-ws-th">Created by</th>
                <th className="proj-ws-th">Modified</th>
              </tr>
            </thead>
            <tbody>
              {p.datasets.map((d, i) => {
                const creator = p.contributors.find(c => c.id === d.createdBy);
                return (
                  <tr key={d.id} className="proj-ws-tr">
                    <td className="proj-ws-td" style={{ fontWeight: 500, color: '#0B1220' }}>{d.name}</td>
                    <td className="proj-ws-td"><span className="proj-ws-version-pill">{d.version}</span></td>
                    <td className="proj-ws-td" style={{ color: '#475569' }}>{d.rows.toLocaleString()}</td>
                    <td className="proj-ws-td" style={{ color: '#475569' }}>{d.size}</td>
                    <td className="proj-ws-td">
                      {creator && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Avatar c={creator} size={20} />
                          <span style={{ color: '#475569' }}>{creator.name.split(' ')[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="proj-ws-td" style={{ color: '#94A3B8' }}>{d.modifiedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Experiments ── */}
      {tab === 'experiments' && (
        <div className="proj-ws-card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 className="proj-ws-card-heading" style={{ margin: 0 }}>{p.experiments.length} Experiments</h3>
          </div>
          <table className="proj-ws-table">
            <thead>
              <tr>
                <th className="proj-ws-th">Name</th>
                <th className="proj-ws-th">Model</th>
                <th className="proj-ws-th">Status</th>
                <th className="proj-ws-th">Accuracy</th>
                <th className="proj-ws-th">Run by</th>
                <th className="proj-ws-th">Date</th>
              </tr>
            </thead>
            <tbody>
              {p.experiments.map(e => {
                const runner = p.contributors.find(c => c.id === e.createdBy);
                const sc = STATUS_COLORS[e.status] || STATUS_COLORS.active;
                return (
                  <tr key={e.id} className="proj-ws-tr">
                    <td className="proj-ws-td" style={{ fontWeight: 500, color: '#0B1220' }}>{e.name}</td>
                    <td className="proj-ws-td" style={{ color: '#475569' }}>{e.model}</td>
                    <td className="proj-ws-td">
                      <span className={`proj-ws-status-pill ${e.status}`}>
                        <span className="proj-ws-status-dot" style={{ backgroundColor: sc.dot }} />
                        {e.status}
                      </span>
                    </td>
                    <td className="proj-ws-td" style={{ fontWeight: 600, color: '#0F9D8A' }}>{e.accuracy ? `${e.accuracy}%` : '—'}</td>
                    <td className="proj-ws-td">
                      {runner && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Avatar c={runner} size={20} />
                          <span style={{ color: '#475569' }}>{runner.name.split(' ')[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="proj-ws-td" style={{ color: '#94A3B8' }}>{e.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pipelines ── */}
      {tab === 'pipelines' && (
        <div className="proj-ws-pipelines-list">
          {p.pipelines.map(pipe => {
            const creator = p.contributors.find(c => c.id === pipe.createdBy);
            return (
              <div key={pipe.id} className="proj-ws-pipeline-card card-shadow">
                <div className="proj-ws-pipeline-icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M10.5 2L4 10.5h5L7.5 16l6.5-8.5H9L10.5 2z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className="proj-ws-pipeline-info">
                  <div className="proj-ws-pipeline-name">{pipe.name}</div>
                  <div className="proj-ws-pipeline-sub">{pipe.steps} steps · Last run {pipe.lastRun}</div>
                </div>
                <span className={`proj-ws-status-pill ${pipe.status}`} style={{ textTransform: 'capitalize' }}>{pipe.status}</span>
                {creator && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
                    <Avatar c={creator} size={20} />
                    {creator.name.split(' ')[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Documents ── */}
      {tab === 'documents' && (
        <div className="proj-ws-docs-grid">
          {p.documents.map(d => {
            const creator = p.contributors.find(c => c.id === d.createdBy);
            const typeIconMap = {
              paper: <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="3.5" y="2" width="12" height="16" rx="1.5" stroke="#8B5CF6" strokeWidth="1.35"/><path d="M7 7h5M7 10h5M7 13h3" stroke="#8B5CF6" strokeWidth="1.35" strokeLinecap="round"/><path d="M13.5 2v4.5h4" stroke="#8B5CF6" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              notes: <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="3.5" y="2" width="12" height="16" rx="1.5" stroke="#0F9D8A" strokeWidth="1.35"/><path d="M7 7h6M7 10.5h6M7 14h4" stroke="#0F9D8A" strokeWidth="1.35" strokeLinecap="round"/></svg>,
              report: <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="3.5" y="2" width="15" height="18" rx="1.5" stroke="#22C7D6" strokeWidth="1.35"/><path d="M7.5 14.5v-3M10.5 14.5v-5M13.5 14.5v-7" stroke="#22C7D6" strokeWidth="1.35" strokeLinecap="round"/></svg>,
              protocol: <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="3.5" y="2" width="15" height="18" rx="1.5" stroke="#F59E0B" strokeWidth="1.35"/><path d="M7 7h8M7 10h8M7 13h5" stroke="#F59E0B" strokeWidth="1.35" strokeLinecap="round"/><circle cx="15" cy="13" r="1" fill="#F59E0B"/></svg>,
            };
            const typeIcon = typeIconMap[d.type] || <svg width="22" height="22" fill="none" viewBox="0 0 22 22"><rect x="3.5" y="2" width="15" height="18" rx="1.5" stroke="#94A3B8" strokeWidth="1.35"/><path d="M7 7h8M7 10h8M7 13h5" stroke="#94A3B8" strokeWidth="1.35" strokeLinecap="round"/></svg>;
            return (
              <button
                key={d.id}
                onClick={() => setDocOpen(d.id)}
                className="proj-ws-doc-card card-shadow"
              >
                <div className="proj-ws-doc-content">
                  <span style={{ flexShrink: 0 }}>{typeIcon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="proj-ws-doc-title">{d.title}</div>
                    <p className="proj-ws-doc-snippet">{d.snippet}</p>
                    <div className="proj-ws-doc-meta">
                      {creator && <Avatar c={creator} size={16} />}
                      <span>{creator?.name.split(' ')[0]}</span>
                      <span>·</span>
                      <span>{d.updatedAt}</span>
                      <span>·</span>
                      <span>{d.size}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Lineage ── */}
      {tab === 'lineage' && (
        <div className="proj-ws-collab-lineage-card card-shadow">
          <div className="proj-ws-collab-hdr">
            <div>
              <h3 className="proj-ws-card-heading" style={{ margin: 0, fontSize: '15px' }}>Collaborative Lineage</h3>
              <p className="proj-ws-collab-sub">Contributor avatars mark who created or modified each node</p>
            </div>
            <div className="proj-ws-collab-contribs">
              {p.contributors.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                  <Avatar c={c} size={20} />
                  {c.name.split(' ')[0]}
                </div>
              ))}
            </div>
          </div>
          <div className="proj-ws-collab-svg-wrap">
            <CollabLineage nodes={p.lineageNodes} edgePairs={p.lineageEdges} contributors={p.contributors} />
          </div>
          <div className="proj-ws-collab-legend">
            {Object.entries({ dataset: '#0F9D8A', transformation: '#7C3AED', experiment: '#8B5CF6', result: '#16A34A' }).map(([type, color]) => (
              <div key={type} className="proj-ws-collab-legend-item">
                <div className="proj-ws-collab-swatch" style={{ backgroundColor: color }} />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Activity History ── */}
      {tab === 'activity' && (
        <div className="proj-ws-card card-shadow">
          <h3 className="proj-ws-card-heading" style={{ fontSize: '15px', marginBottom: '20px' }}>Activity History</h3>
          <div className="proj-ws-timeline-wrap">
            <div className="proj-ws-timeline-line" />
            <div className="proj-ws-timeline-list">
              {p.activity.map(a => {
                const c = p.contributors.find(x => x.id === a.contributorId) || p.contributors[0];
                return (
                  <div key={a.id} className="proj-ws-timeline-item">
                    <div className="proj-ws-timeline-avatar">
                      <Avatar c={c} size={30} />
                    </div>
                    <div className="proj-ws-timeline-box">
                      <div className="proj-ws-timeline-top">
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1220', marginRight: '8px' }}>{c.name}</span>
                          <ActionTypeBadge action={a.action} />
                        </div>
                        <span style={{ fontSize: '11px', color: '#94A3B8', flexShrink: 0 }}>{a.timestamp}</span>
                      </div>
                      <p className="proj-ws-timeline-desc">
                        <span style={{ color: '#0B1220', fontWeight: 500 }}>{a.resource}</span>
                        {a.detail && <span style={{ color: '#94A3B8' }}> — {a.detail}</span>}
                      </p>
                      <div className="proj-ws-timeline-sub">
                        <span className="proj-ws-res-badge">{a.resourceType}</span>
                        <span>{c.affiliation}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Document viewer modal */}
      {openDoc && (
        <div className="proj-ws-modal-backdrop" onClick={() => setDocOpen(null)}>
          <div className="proj-ws-modal" onClick={e => e.stopPropagation()}>
            <div className="proj-ws-modal-hdr">
              <h3 className="proj-ws-modal-title">{openDoc.title}</h3>
              <button onClick={() => setDocOpen(null)} className="proj-ws-modal-close">×</button>
            </div>
            <p className="proj-ws-modal-snippet">{openDoc.snippet}</p>
            <p className="proj-ws-modal-foot">Full document not available in demo. Last updated: {openDoc.updatedAt} · {openDoc.size}</p>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <InviteResearcher
          projectName={p.name}
          onClose={() => setShowInvite(false)}
          onInvite={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
