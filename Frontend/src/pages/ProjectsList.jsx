import { useState, useEffect } from 'react';
import { fetchProjects } from '../lib/api';
import './ProjectsList.css';

const STATUS_CFG = {
  active: { dot: 'active', label: 'Active' },
  archived: { dot: 'archived', label: 'Archived' },
  draft: { dot: 'draft', label: 'Draft' },
};

const VIS_CFG = {
  private: { icon: <svg width="11" height="11" fill="none" viewBox="0 0 11 11"><rect x="1.5" y="5" width="8" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>, label: 'Private' },
  team: { icon: <svg width="11" height="11" fill="none" viewBox="0 0 11 11"><circle cx="4" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 9c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="4" r="1.2" stroke="currentColor" strokeWidth="1.1"/><path d="M9.5 8.5c0-1.1-.9-2-2-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>, label: 'Team' },
  public: { icon: <svg width="11" height="11" fill="none" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 1.5C4.5 3 4 4.2 4 5.5s.5 2.5 1.5 4M5.5 1.5C6.5 3 7 4.2 7 5.5s-.5 2.5-1.5 4M1.5 5.5h8" stroke="currentColor" strokeWidth="1.1"/></svg>, label: 'Public' },
};

function AvatarStack({ contributors = [], max = 4 }) {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="projects-list-avatar-stack">
        <div className="projects-list-avatar" style={{ backgroundColor: '#0D9488' }}>YOU</div>
      </div>
    );
  }
  const shown = contributors.slice(0, max);
  const rest = contributors.length - max;
  return (
    <div className="projects-list-avatar-stack">
      {shown.map(c => (
        <div
          key={c.id || c.name}
          title={c.name}
          className="projects-list-avatar"
          style={{ backgroundColor: c.avatarColor || '#0D9488' }}
        >
          {c.initials || (c.name ? c.name[0] : 'U')}
        </div>
      ))}
      {rest > 0 && (
        <div className="projects-list-avatar-more">
          +{rest}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ p, onClick }) {
  const s = STATUS_CFG[p.status] || STATUS_CFG.active;
  const v = VIS_CFG[p.visibility] || VIS_CFG.private;
  const name = p.name || 'Untitled Project';
  const projectCode = p.project_code || p.projectId || (p.id ? `PRJ-${p.id.slice(0, 4).toUpperCase()}` : 'PRJ');
  const desc = p.description || 'No description provided.';
  const tags = p.tags || [];
  const datasetsCount = p.datasets?.length ?? 0;
  const experimentsCount = p.experiments?.length ?? 0;
  const adminName = p.admin || 'You';
  const lastActive = p.lastActivity || (p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Recently');

  return (
    <button
      onClick={onClick}
      className="projects-list-card card-shadow"
    >
      <div className="projects-list-card-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="projects-list-card-badge-row">
            <span className={`projects-list-status-pill ${p.status}`}>
              <span className={`projects-list-status-dot ${s.dot}`} />
              {s.label}
            </span>
            <span className="projects-list-vis-pill">{v.icon} {v.label}</span>
          </div>
          <h3 className="projects-list-card-name">{name}</h3>
          <p className="projects-list-card-pid">{projectCode}</p>
        </div>
      </div>

      <p className="projects-list-card-desc">{desc}</p>

      <div className="projects-list-tags-row">
        {tags.map(tag => (
          <span key={tag} className="projects-list-tag">{tag}</span>
        ))}
      </div>

      <div className="projects-list-card-footer">
        <div className="projects-list-footer-left">
          <AvatarStack contributors={p.contributors} />
          <div className="projects-list-counts">
            <span>{datasetsCount} datasets</span>
            <span style={{ color: '#E2E8F0' }}>·</span>
            <span>{experimentsCount} runs</span>
          </div>
        </div>
        <div className="projects-list-footer-right">
          <span className="projects-list-admin-name">{adminName}</span>
          <span style={{ margin: '0 4px' }}>·</span>
          {lastActive}
        </div>
      </div>
    </button>
  );
}

export default function ProjectsList({ onOpen, onCreate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchProjects().then(data => {
      if (mounted) {
        setProjects(data || []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const filtered = projects.filter(p =>
    !search || (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.project_code || p.projectId || '').toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter(p => p.status === 'active');
  const others = filtered.filter(p => p.status !== 'active');

  return (
    <div className="projects-list-container">
      {/* Header */}
      <div className="projects-list-header">
        <div>
          <h1 className="projects-list-title">Projects</h1>
          <p className="projects-list-subtitle">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} · {active.length} active
          </p>
        </div>
        <button
          onClick={onCreate}
          className="projects-list-new-btn"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="projects-list-search-wrap">
        <div className="projects-list-search-box">
          <svg className="projects-list-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="projects-list-search-input"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="projects-list-stats-grid">
        {[
          { label: 'Total Projects', value: projects.length, accentBg: '#EEF2FF', icon: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M2 6C2 5.17 2.67 4.5 3.5 4.5H7l2 2h5.5c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5h-11C2.67 15.5 2 14.83 2 14V6z" stroke="#6366F1" strokeWidth="1.35" strokeLinejoin="round"/></svg> },
          { label: 'Active', value: active.length, accentBg: '#E6F7F5', icon: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="9" cy="9" r="3" fill="#0F9D8A"/><circle cx="9" cy="9" r="6.5" stroke="#0F9D8A" strokeWidth="1.35" strokeDasharray="2 2"/></svg> },
          { label: 'Visibility', value: 'Team / Lab', accentBg: '#FEF3C7', icon: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="7" cy="6" r="2.5" stroke="#F59E0B" strokeWidth="1.35"/><path d="M2 15c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#F59E0B" strokeWidth="1.35" strokeLinecap="round"/><circle cx="13" cy="6.5" r="2" stroke="#F59E0B" strokeWidth="1.2"/><path d="M15.5 14c0-2-1.34-3.5-3-3.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/></svg> },
          { label: 'Workspaces', value: projects.length, accentBg: '#EDE9FE', icon: <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M7 2.5v6L4 15h10l-3-6.5V2.5" stroke="#8B5CF6" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 2.5h4" stroke="#8B5CF6" strokeWidth="1.35" strokeLinecap="round"/></svg> },
        ].map(s => (
          <div key={s.label} className="projects-list-stat-card card-shadow">
            <div className="projects-list-stat-icon-box" style={{ backgroundColor: s.accentBg }}>{s.icon}</div>
            <div>
              <div className="projects-list-stat-val">{s.value}</div>
              <div className="projects-list-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active projects */}
      {active.length > 0 && (
        <div className="projects-list-section">
          <h2 className="projects-list-sec-heading">Active</h2>
          <div className="projects-list-cards-grid">
            {active.map(p => <ProjectCard key={p.id} p={p} onClick={() => onOpen(p.id)} />)}
          </div>
        </div>
      )}

      {/* Archived / draft */}
      {others.length > 0 && (
        <div className="projects-list-section">
          <h2 className="projects-list-sec-heading">Other</h2>
          <div className="projects-list-cards-grid">
            {others.map(p => <ProjectCard key={p.id} p={p} onClick={() => onOpen(p.id)} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 16px', color: '#64748B' }}>
          <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>No projects yet</p>
          <p style={{ fontSize: '13px', marginBottom: 16 }}>Create your first project to organize datasets and experiment pipelines.</p>
          <button onClick={onCreate} className="projects-list-new-btn" style={{ margin: '0 auto' }}>
            + Create Project
          </button>
        </div>
      )}
    </div>
  );
}
