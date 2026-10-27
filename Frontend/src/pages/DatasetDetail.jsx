import { useState, useEffect, useRef } from 'react';
import { fetchDataset, uploadNewVersion } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import './DatasetDetail.css';

function fmt(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function ScoreArc({ score }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ * 0.75;
  const gap = circ - dash;
  const color = score >= 90 ? '#10B981' : score >= 75 ? '#F59E0B' : '#EF4444';

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="8"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeLinecap="round"
        transform="rotate(135 50 50)" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${gap + circ * 0.25}`}
        strokeLinecap="round"
        transform="rotate(135 50 50)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x="50" y="47" textAnchor="middle" fill="#0B1220" fontSize="18" fontWeight="700" fontFamily="DM Mono, monospace">{score}</text>
      <text x="50" y="60" textAnchor="middle" fill="#6B7C93" fontSize="9" fontFamily="Inter, sans-serif">/ 100</text>
    </svg>
  );
}

function DriftTab({ ds: dataset }) {
  if (dataset.pcaDrift.length === 0) {
    return (
      <div className="datasetdetail-card" style={{ padding: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#0B1220', margin: 0 }}>Insufficient versions for drift analysis</p>
        <p style={{ fontSize: '12.5px', color: '#6B7C93', marginTop: '4px', margin: 0 }}>PCA drift requires at least 2 dataset versions.</p>
      </div>
    );
  }

  const maxShift = Math.max(...dataset.pcaDrift.map(p => p.shift));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      <div className="datasetdetail-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 className="datasetdetail-card-title" style={{ margin: 0 }}>PCA Data Drift</h2>
            <p style={{ fontSize: '12px', color: '#6B7C93', marginTop: '2px', margin: 0 }}>Principal component shift between versions</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 500,
            backgroundColor: maxShift > 0.3 ? '#FEF3C7' : '#ECFDF5', color: maxShift > 0.3 ? '#D97706' : '#059669'
          }}>
            {maxShift > 0.3 ? '⚠ Significant drift' : '✓ Low drift'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {dataset.pcaDrift.map(pc => {
            const pct = (pc.shift / 0.5) * 100;
            const color = pc.shift > 0.3 ? '#EF4444' : pc.shift > 0.15 ? '#F59E0B' : '#10B981';
            return (
              <div key={pc.component}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#0B1220' }}>{pc.component}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums', color }}>
                    Δ {pc.shift.toFixed(2)}
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F0F4F8', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '9999px', transition: 'all 0.5s ease', width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="datasetdetail-card">
        <h2 className="datasetdetail-card-title">Drift Summary</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dataset.pcaDrift.map(pc => (
            <div key={pc.component} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: '#F7F9FC', border: '1px solid #E2E8F0' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700,
                backgroundColor: pc.shift > 0.3 ? '#FEF3C7' : pc.shift > 0.15 ? '#FEF3C7' : '#ECFDF5',
                color: pc.shift > 0.3 ? '#D97706' : pc.shift > 0.15 ? '#D97706' : '#059669'
              }}>
                {pc.shift > 0.3 ? '!' : pc.shift > 0.15 ? '~' : '✓'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12.5px', fontWeight: 500, color: '#0B1220', margin: 0 }}>{pc.component}</p>
                <p style={{ fontSize: '11.5px', color: '#6B7C93', margin: 0 }}>
                  {pc.shift > 0.3 ? 'Significant distributional shift detected' : pc.shift > 0.15 ? 'Moderate shift — monitor closely' : 'Minimal drift — stable distribution'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="datasetdetail-note-card">
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#0F9D8A', margin: '0 0 4px 0' }}>Analysis Note</p>
          <p style={{ fontSize: '12px', color: '#3A4A5C', lineHeight: 1.5, margin: 0 }}>
            Comparing {dataset.versions[dataset.versions.length - 2]?.label ?? 'V1'} → {dataset.versions[dataset.versions.length - 1].label}.
            {maxShift > 0.3 ? ' High drift may impact model performance. Consider retraining.' : ' Distribution is stable. Existing models should remain valid.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DatasetDetail({ datasetId, onBack, onCompare }) {
  const [ds, setDs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [restoreMsg, setRestoreMsg] = useState('');

  // Modal State for New Version
  const [showModal, setShowModal] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [versionNote, setVersionNote] = useState('');
  const [versionFile, setVersionFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      const data = await fetchDataset(datasetId);
      if (data) {
        setDs({
          ...data,
          name: data.name || 'Untitled Dataset',
          desc: data.description || data.desc || 'No description available',
          type: data.type || 'Tabular',
          currentVersion: data.current_version || data.currentVersion || 'V1',
          rows: data.rows_count ?? data.rows ?? 0,
          columns: data.columns_count ?? data.columns ?? 0,
          size: data.size_str || data.size || '0 MB',
          owner: data.owner || 'You',
          updated: data.updated || (data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recently'),
          qualityScore: data.quality_score ?? data.qualityScore ?? 100,
          projectName: data.project_name || null,
          versions: data.versions || [],
          quality: data.quality || data.quality_breakdown || [],
          pcaDrift: data.pcaDrift || data.pca_drift || [],
          columnSchema: data.columnSchema || data.column_schema || [],
        });
      }
    } catch (err) {
      console.error('Failed to load dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [datasetId]);

  function openUploadModal() {
    const nextVer = `V${(ds?.versions?.length || 1) + 1}`;
    setVersionLabel(nextVer);
    setVersionNote('');
    setVersionFile(null);
    setUploadError('');
    setShowModal(true);
  }

  async function handleUploadVersion(e) {
    e.preventDefault();
    if (!versionFile) {
      setUploadError('Please choose a file to upload as the new version.');
      return;
    }
    if (!versionLabel.trim()) {
      setUploadError('Please provide a version label (e.g. V2).');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', versionFile);
      formData.append('version_label', versionLabel.trim());
      formData.append('version_note', versionNote.trim());

      await uploadNewVersion(datasetId, formData);
      setShowModal(false);
      await loadData();
      setRestoreMsg(`Version ${versionLabel.trim()} uploaded successfully!`);
      setTimeout(() => setRestoreMsg(''), 4000);
    } catch (err) {
      console.error('New version upload error:', err);
      setUploadError(err.message || 'Failed to upload new version.');
    } finally {
      setUploading(false);
    }
  }

  function handleRestore(version) {
    setRestoreMsg(`Version ${version} restored as active.`);
    setTimeout(() => setRestoreMsg(''), 3000);
  }

  async function handleDownload(ver) {
    try {
      const v = ver || ds?.currentVersion;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/datasets/${datasetId}/download?version=${v}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('File download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(ds?.name || 'dataset').replace(/\s+/g, '_')}_${v}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setRestoreMsg('Unable to download dataset file.');
      setTimeout(() => setRestoreMsg(''), 3000);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
        <p>Loading dataset details...</p>
      </div>
    );
  }

  if (!ds) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Dataset not found</p>
        <button onClick={onBack} className="datasetdetail-btn-primary" style={{ marginTop: '16px' }}>
          Back to Datasets
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'versions', label: `Versions (${(ds.versions || []).length})` },
    { id: 'quality', label: 'Quality Score' },
    { id: 'drift', label: 'Data Drift' },
    { id: 'schema', label: 'Schema' },
  ];

  return (
    <div className="datasetdetail-container">
      {/* Breadcrumb */}
      <div className="datasetdetail-breadcrumb">
        <button onClick={onBack} className="datasetdetail-crumb-link">Datasets</button>
        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="#A0AEBF" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <span className="datasetdetail-crumb-current">{ds.name}</span>
        <span className={`datasetdetail-type-pill ${ds.type}`}>{ds.type}</span>
        {ds.projectName && (
          <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            📁 {ds.projectName}
          </span>
        )}
      </div>

      {/* Title row */}
      <div className="datasetdetail-header">
        <div>
          <h1 className="datasetdetail-title">{ds.name}</h1>
          <p className="datasetdetail-desc">{ds.desc}</p>
        </div>
        <div className="datasetdetail-actions">
          {ds.versions.length >= 2 && (
            <button onClick={() => onCompare(ds.id)} className="datasetdetail-btn-outline">
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 7h10M2 4h5M2 10h5M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Compare Versions
            </button>
          )}
          <button onClick={() => handleDownload()} className="datasetdetail-btn-outline">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Download
          </button>
          <button onClick={openUploadModal} className="datasetdetail-btn-primary">
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            New Version
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="datasetdetail-stats-grid">
        {[
          { label: 'Current Version', val: ds.currentVersion, mono: true },
          { label: 'Total Rows', val: fmt(ds.rows), mono: true },
          { label: 'Columns', val: String(ds.columns), mono: true },
          { label: 'File Size', val: ds.size, mono: true },
          { label: 'Owner', val: ds.owner, mono: false },
          { label: 'Last Updated', val: ds.updated, mono: false },
        ].map(s => (
          <div key={s.label} className="datasetdetail-stat-card">
            <p className="datasetdetail-stat-label">{s.label}</p>
            <p className={`datasetdetail-stat-val ${s.mono ? 'mono' : ''}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Restore toast */}
      {restoreMsg && (
        <div className="datasetdetail-toast">
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          {restoreMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="datasetdetail-tabs-pill">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`datasetdetail-tab-btn ${tab === t.id ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Version timeline */}
            <div className="datasetdetail-card">
              <h2 className="datasetdetail-card-title">Version Timeline</h2>
              <div className="datasetdetail-timeline-wrap">
                <div className="datasetdetail-timeline-line" />
                <div className="datasetdetail-timeline-items">
                  {[...ds.versions].reverse().map(v => (
                    <div key={v.id} className="datasetdetail-timeline-item">
                      <div className={`datasetdetail-timeline-badge ${v.status === 'active' ? 'active' : 'inactive'}`}>
                        {v.version}
                      </div>
                      <div className="datasetdetail-timeline-card">
                        <div className="datasetdetail-timeline-header">
                          <span className="datasetdetail-timeline-label">{v.label}</span>
                          {v.status === 'active' && <span className="datasetdetail-timeline-active-tag">Active</span>}
                        </div>
                        <p className="datasetdetail-timeline-note">{v.note}</p>
                        <div className="datasetdetail-timeline-meta">
                          <span style={{ fontFamily: 'DM Mono, monospace' }}>{fmt(v.rows)} rows</span>
                          <span style={{ fontFamily: 'DM Mono, monospace' }}>{v.columns} cols</span>
                          <span style={{ fontFamily: 'DM Mono, monospace' }}>{v.size}</span>
                          <span>{v.date} · {v.author}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="datasetdetail-card">
              <h2 className="datasetdetail-card-title">Tags</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ds.tags.map(t => <span key={t} className="datasetdetail-tag-pill">{t}</span>)}
              </div>
            </div>
          </div>

          {/* Quality summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="datasetdetail-card" style={{ textAlign: 'center' }}>
              <h2 className="datasetdetail-card-title" style={{ textAlign: 'center' }}>Quality Score</h2>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <ScoreArc score={ds.qualityScore} />
              </div>
              <p style={{ fontSize: '12px', color: '#6B7C93', margin: 0 }}>
                {ds.qualityScore >= 90 ? 'Excellent quality' : ds.qualityScore >= 75 ? 'Good quality' : 'Needs improvement'}
              </p>
            </div>
            <div className="datasetdetail-card">
              <h2 className="datasetdetail-card-title">Top Issues</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ds.quality.filter(q => q.score < 95).slice(0, 4).map(q => (
                  <div key={q.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '9999px', flexShrink: 0, backgroundColor: q.score >= 90 ? '#10B981' : q.score >= 75 ? '#F59E0B' : '#EF4444' }} />
                    <span style={{ fontSize: '12px', color: '#3A4A5C', flex: 1 }}>{q.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'DM Mono, monospace', color: '#0B1220' }}>{q.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'versions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7C93' }}>
              Showing {ds.versions.length} {ds.versions.length === 1 ? 'version' : 'versions'} for this dataset
            </p>
            <button onClick={openUploadModal} className="datasetdetail-btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Upload New Version
            </button>
          </div>
          <div className="datasetdetail-versions-table">
            <div className="datasetdetail-versions-header">
              {['Version', 'Rows', 'Columns', 'Size', 'Quality', 'Date · Author', 'Actions'].map((h, idx) => (
                <p key={idx} style={{ fontSize: '11px', fontWeight: 600, color: '#6B7C93', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{h}</p>
              ))}
            </div>
          <div>
            {[...ds.versions].reverse().map(v => (
              <div key={v.id} className="datasetdetail-versions-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`datasetdetail-timeline-badge ${v.status === 'active' ? 'active' : 'inactive'}`} style={{ position: 'static' }}>{v.version}</div>
                  <div>
                    <p style={{ fontSize: '12.5px', fontWeight: 500, color: '#0B1220', margin: 0 }}>{v.label}</p>
                    {v.status === 'active' && <span style={{ fontSize: '9.5px', fontWeight: 600, color: '#0F9D8A' }}>● Active</span>}
                  </div>
                </div>
                <span style={{ fontSize: '12.5px', fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums', color: '#0B1220' }}>{fmt(v.rows)}</span>
                <span style={{ fontSize: '12.5px', fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums', color: '#0B1220' }}>{v.columns}</span>
                <span style={{ fontSize: '12.5px', fontFamily: 'DM Mono, monospace', color: '#0B1220' }}>{v.size}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '56px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '9999px', width: `${v.qualityScore}%`, backgroundColor: v.qualityScore >= 90 ? '#10B981' : v.qualityScore >= 75 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'DM Mono, monospace', color: '#0B1220' }}>{v.qualityScore}</span>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#3A4A5C', margin: 0 }}>{v.date}</p>
                  <p style={{ fontSize: '11px', color: '#A0AEBF', margin: 0 }}>{v.author}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => handleDownload(v.version)} className="datasetdetail-btn-outline" style={{ padding: '4px 10px', fontSize: '11.5px' }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 12 12" style={{ display: 'inline', marginRight: '4px' }}><path d="M6 1v7M3 5l3 3 3-3M2 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    Download
                  </button>
                  {v.status === 'archived' && (
                    <button onClick={() => handleRestore(v.version)} className="datasetdetail-btn-outline" style={{ padding: '4px 10px', fontSize: '11.5px', color: '#0F9D8A', backgroundColor: '#E6F7F5', border: 'none' }}>
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {tab === 'quality' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="datasetdetail-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="datasetdetail-card-title" style={{ alignSelf: 'flex-start' }}>Overall Score</h2>
            <ScoreArc score={ds.qualityScore} />
            <p style={{ fontSize: '12px', color: '#6B7C93', marginTop: '4px', textAlign: 'center', maxWidth: '160px' }}>
              {ds.qualityScore >= 90 ? 'Dataset is in excellent shape.' : ds.qualityScore >= 75 ? 'Minor issues to address.' : 'Significant data quality issues detected.'}
            </p>
            <div style={{ marginTop: '16px', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[{ label: '90–100', color: '#10B981', text: 'Excellent' }, { label: '75–89', color: '#F59E0B', text: 'Good' }, { label: '0–74', color: '#EF4444', text: 'Needs work' }].map(r => (
                <div key={r.label} className="datasetdetail-legend-row">
                  <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: r.color }} />
                  <span>{r.label}</span>
                  <span style={{ marginLeft: 'auto' }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="datasetdetail-card" style={{ gridColumn: 'span 2' }}>
            <h2 className="datasetdetail-card-title">Quality Dimensions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ds.quality.map(q => {
                const color = q.score >= 90 ? '#10B981' : q.score >= 75 ? '#F59E0B' : '#EF4444';
                return (
                  <div key={q.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: color }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#0B1220' }}>{q.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {q.issues > 0 && <span style={{ fontSize: '11.5px', color: '#A0AEBF' }}>{q.issues.toLocaleString()} issues</span>}
                        <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'DM Mono, monospace', color: '#0B1220', width: '32px', textAlign: 'right' }}>{q.score}</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F0F4F8', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '9999px', transition: 'all 0.5s ease', width: `${q.score}%`, backgroundColor: color }} />
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#A0AEBF', marginTop: '4px', margin: '4px 0 0 0' }}>{q.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'drift' && <DriftTab ds={ds} />}

      {tab === 'schema' && (
        <div className="datasetdetail-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="datasetdetail-schema-header">
            <h2 style={{ fontSize: '13.5px', fontWeight: 600, color: '#0B1220', margin: 0 }}>Column Schema — {ds.name} {ds.currentVersion}</h2>
          </div>
          <div className="datasetdetail-schema-cols-head">
            {['Column', 'Type', 'Missing %', 'Unique Values'].map((h, idx) => (
              <p key={idx} style={{ fontSize: '11px', fontWeight: 600, color: '#6B7C93', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{h}</p>
            ))}
          </div>
          <div>
            {ds.columnSchema.map(col => (
              <div key={col.name} className="datasetdetail-schema-row">
                <span style={{ fontSize: '13px', fontFamily: 'DM Mono, monospace', fontWeight: 500, color: '#0B1220' }}>{col.name}</span>
                <span style={{ fontSize: '11.5px', padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#F0F4F8', color: '#6B7C93', width: 'fit-content', fontFamily: 'DM Mono, monospace' }}>{col.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '64px', height: '6px', backgroundColor: '#F0F4F8', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '9999px', width: `${col.missing}%`, backgroundColor: col.missing > 10 ? '#EF4444' : col.missing > 3 ? '#F59E0B' : '#10B981' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums', color: '#6B7C93' }}>{col.missing.toFixed(1)}%</span>
                </div>
                <span style={{ fontSize: '12.5px', fontFamily: 'DM Mono, monospace', fontVariantNumeric: 'tabular-nums', color: '#0B1220' }}>{col.unique.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Version Modal */}
      {showModal && (
        <div className="datasetdetail-modal-overlay" onClick={() => !uploading && setShowModal(false)}>
          <div className="datasetdetail-modal-card" onClick={e => e.stopPropagation()}>
            <div className="datasetdetail-modal-header">
              <div>
                <h3 className="datasetdetail-modal-title">Upload New Version</h3>
                <p className="datasetdetail-modal-subtitle">Add a new version for {ds.name}</p>
              </div>
              <button 
                className="datasetdetail-modal-close-btn" 
                onClick={() => !uploading && setShowModal(false)}
                disabled={uploading}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUploadVersion}>
              <div className="datasetdetail-modal-body">
                {uploadError && (
                  <div className="datasetdetail-modal-error">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* File Upload Dropzone */}
                <div className="datasetdetail-modal-field">
                  <label className="datasetdetail-modal-label">Dataset File *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files?.[0]) setVersionFile(e.target.files[0]);
                    }}
                  />
                  {versionFile ? (
                    <div className="datasetdetail-modal-file-selected">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{versionFile.name}</span>
                        <span style={{ fontSize: '11px', opacity: 0.8 }}>({(versionFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button 
                        type="button" 
                        className="datasetdetail-modal-remove-file"
                        onClick={() => setVersionFile(null)}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div 
                      className={`datasetdetail-modal-dropzone ${dragOver ? 'dragover' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files?.[0]) setVersionFile(e.dataTransfer.files[0]);
                      }}
                    >
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#0F9D8A" strokeWidth="1.8" style={{ margin: '0 auto 8px', display: 'block' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: '#0B1220', margin: '0 0 4px 0' }}>
                        Click to browse or drag file here
                      </p>
                      <p style={{ fontSize: '11px', color: '#6B7C93', margin: 0 }}>
                        Supports CSV, TSV, JSON, Parquet, and Excel
                      </p>
                    </div>
                  )}
                </div>

                {/* Version Label */}
                <div className="datasetdetail-modal-field">
                  <label className="datasetdetail-modal-label">Version Label *</label>
                  <input
                    type="text"
                    className="datasetdetail-modal-input"
                    placeholder="e.g. V2"
                    value={versionLabel}
                    onChange={e => setVersionLabel(e.target.value)}
                    required
                  />
                </div>

                {/* Version Note */}
                <div className="datasetdetail-modal-field">
                  <label className="datasetdetail-modal-label">Version Note</label>
                  <textarea
                    rows="3"
                    className="datasetdetail-modal-textarea"
                    placeholder="Describe what changed in this version (e.g. Post-treatment cohort with shifted age distribution...)"
                    value={versionNote}
                    onChange={e => setVersionNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="datasetdetail-modal-footer">
                <button
                  type="button"
                  className="datasetdetail-modal-cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="datasetdetail-modal-submit-btn"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="white" strokeWidth="2" strokeDasharray="20" strokeLinecap="round"/></svg>
                      Uploading Version...
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      Submit Version
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
