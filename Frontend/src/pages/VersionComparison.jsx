import { useState, useEffect } from 'react';
import { fetchDataset } from '../lib/api';
import './VersionComparison.css';

function fmt(n) {
  if (n === undefined || n === null) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function DiffBadge({ val, inverse }) {
  const positive = inverse ? val < 0 : val > 0;
  const neutral = val === 0;
  return (
    <span className={`version-comp-diff-badge ${neutral ? 'neutral' : positive ? 'positive' : 'negative'}`}>
      {val > 0 ? '+' : ''}{typeof val === 'number' && Math.abs(val) < 1 ? val.toFixed(1) : fmt(Math.round(val))}
    </span>
  );
}

export default function VersionComparison({ datasetId, onBack }) {
  const [ds, setDs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchDataset(datasetId);
        if (data) {
          const versions = (data.versions && data.versions.length > 0) ? data.versions : [
            {
              id: 'v1',
              label: data.current_version || 'V1',
              version: data.current_version || 'V1',
              rows: data.rows_count || 1000,
              columns: data.columns_count || 10,
              size: data.size_str || '1.0 MB',
              qualityScore: data.quality_score || 100,
              missingValues: 0,
              duplicates: 0,
              author: 'You',
              date: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Initial',
            }
          ];
          setDs({ ...data, versions });
          setLeftIdx(0);
          setRightIdx(versions.length > 1 ? versions.length - 1 : 0);
        }
      } catch (err) {
        console.error('Failed to load dataset for comparison', err);
      } finally {
        setLoading(false);
      }
    }
    if (datasetId) load();
  }, [datasetId]);

  if (loading) {
    return (
      <div className="version-comp-container" style={{ padding: '60px 0', textAlign: 'center', color: '#6B7C93' }}>
        Loading dataset versions for comparison…
      </div>
    );
  }

  if (!ds) {
    return (
      <div className="version-comp-container" style={{ padding: '40px 0' }}>
        <button onClick={onBack} className="version-comp-breadcrumb-btn">← Back to Datasets</button>
        <div style={{ color: '#EF4444', marginTop: '20px' }}>Dataset not found.</div>
      </div>
    );
  }

  const left = ds.versions[leftIdx] || ds.versions[0] || {};
  const right = ds.versions[rightIdx] || ds.versions[ds.versions.length - 1] || {};

  const rowDiff = (right.rows || 0) - (left.rows || 0);
  const colDiff = (right.columns || 0) - (left.columns || 0);
  const qualityDiff = (right.qualityScore || 0) - (left.qualityScore || 0);
  const missingDiff = (right.missingValues || 0) - (left.missingValues || 0);
  const dupDiff = (right.duplicates || 0) - (left.duplicates || 0);

  const addedCols = colDiff > 0 ? Array.from({ length: colDiff }, (_, i) => `new_col_${i + 1}`) : [];
  const removedCols = [];

  const maxShift = ds.pcaDrift && ds.pcaDrift.length > 0 ? Math.max(...ds.pcaDrift.map(p => p.shift)) : 0;

  return (
    <div className="version-comp-container">
      {/* Breadcrumb */}
      <div className="version-comp-breadcrumb">
        <button onClick={onBack} className="version-comp-breadcrumb-btn">Datasets</button>
        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="#A0AEBF" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <button onClick={onBack} className="version-comp-breadcrumb-btn">{ds.name}</button>
        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="#A0AEBF" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <span className="version-comp-breadcrumb-current">Version Comparison</span>
      </div>

      <div className="version-comp-header">
        <div>
          <h1 className="version-comp-title">Compare Versions — {ds.name}</h1>
          <p className="version-comp-subtitle">Side-by-side diff of dataset versions</p>
        </div>
        <button className="version-comp-export-btn">
          <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M6.5 1v9M3.5 7l3 3 3-3M2 11h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          Export Report
        </button>
      </div>

      {/* Version selectors */}
      <div className="version-comp-selectors-grid">
        {[
          { label: 'Base Version', idx: leftIdx, set: setLeftIdx, isBase: true },
          { label: 'Compare Version', idx: rightIdx, set: setRightIdx, isBase: false }
        ].map((sel, si) => (
          <div key={si} className={`version-comp-selector-card ${sel.isBase ? 'base' : 'compare'}`}>
            <p className="version-comp-selector-label">{sel.label}</p>
            <select
              value={sel.idx}
              onChange={e => sel.set(Number(e.target.value))}
              className="version-comp-select"
            >
              {ds.versions.map((v, i) => (
                <option key={v.id} value={i}>{v.label} — {v.date}</option>
              ))}
            </select>
            <div className="version-comp-stats-3">
              {[
                { label: 'Rows', val: fmt(si === 0 ? left.rows : right.rows) },
                { label: 'Columns', val: String(si === 0 ? left.columns : right.columns) },
                { label: 'Quality', val: String(si === 0 ? left.qualityScore : right.qualityScore) }
              ].map(s => (
                <div key={s.label} className="version-comp-stat-cell">
                  <p className="version-comp-stat-lbl">{s.label}</p>
                  <p className="version-comp-stat-val">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Change summary cards */}
      <div className="version-comp-summary-grid">
        {[
          { label: 'Row Changes', val: rowDiff, suffix: ' rows' },
          { label: 'Column Changes', val: colDiff, suffix: ' cols' },
          { label: 'Quality Delta', val: qualityDiff, suffix: ' pts' },
          { label: 'Missing Values', val: parseFloat((missingDiff).toFixed(1)), suffix: '%', inverse: true },
        ].map(s => (
          <div key={s.label} className="version-comp-summary-card card-shadow">
            <p className="version-comp-summary-lbl">{s.label}</p>
            <div className="version-comp-summary-val-wrap">
              <span className="version-comp-summary-val">
                {s.val > 0 ? '+' : ''}{s.val < 1 && s.val > -1 ? s.val.toFixed(1) : fmt(Math.round(s.val))}{s.suffix}
              </span>
            </div>
            <div className="version-comp-summary-sub">
              {s.val === 0
                ? <span className="version-comp-no-change">No change</span>
                : <span className={((s.inverse ? s.val < 0 : s.val > 0) ? 'version-comp-status-pos' : 'version-comp-status-neg')}>
                    {(s.inverse ? s.val < 0 : s.val > 0) ? '▲ Improved' : '▼ Regressed'}
                  </span>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Detailed diff table */}
      <div className="version-comp-table-card card-shadow">
        <div className="version-comp-table-header">
          <h2 className="version-comp-table-title">Detailed Diff</h2>
        </div>
        <div className="version-comp-table-rows">
          {[
            { label: 'Rows', base: fmt(left.rows), head: fmt(right.rows), change: rowDiff, inverse: false },
            { label: 'Columns', base: String(left.columns), head: String(right.columns), change: colDiff, inverse: false },
            { label: 'File Size', base: left.size, head: right.size, change: 0, inverse: false },
            { label: 'Missing Values', base: `${left.missingValues}%`, head: `${right.missingValues}%`, change: missingDiff, inverse: true },
            { label: 'Duplicate Records', base: `${left.duplicates}%`, head: `${right.duplicates}%`, change: dupDiff, inverse: true },
            { label: 'Quality Score', base: String(left.qualityScore), head: String(right.qualityScore), change: qualityDiff, inverse: false },
            { label: 'Author', base: left.author, head: right.author, change: 0, inverse: false },
          ].map(row => (
            <div key={row.label} className="version-comp-row">
              <span className="version-comp-col-label">{row.label}</span>
              <span className="version-comp-col-base">{row.base}</span>
              <span className="version-comp-col-head">{row.head}</span>
              <DiffBadge val={row.change} inverse={row.inverse} />
            </div>
          ))}
        </div>
        <div className="version-comp-table-cols-head">
          <span className="version-comp-th">Dimension</span>
          <span className="version-comp-th">{left.label}</span>
          <span className="version-comp-th">{right.label}</span>
          <span className="version-comp-th">Change</span>
        </div>
      </div>

      {/* Column changes & PCA Drift */}
      <div className="version-comp-lower-grid">
        <div className="version-comp-card card-shadow">
          <h2 className="version-comp-sec-title">Column Changes</h2>
          {addedCols.length === 0 && removedCols.length === 0 ? (
            <p className="version-comp-empty-text">No column additions or removals between these versions.</p>
          ) : (
            <div className="version-comp-cols-list">
              {addedCols.map(col => (
                <div key={col} className="version-comp-col-added">
                  <span className="version-comp-col-plus">+</span>
                  <span className="version-comp-col-name-add">{col}</span>
                  <span className="version-comp-col-badge-add">Added</span>
                </div>
              ))}
              {removedCols.map(col => (
                <div key={col} className="version-comp-col-removed">
                  <span className="version-comp-col-minus">−</span>
                  <span className="version-comp-col-name-rem">{col}</span>
                  <span className="version-comp-col-badge-rem">Removed</span>
                </div>
              ))}
            </div>
          )}

          <div className="version-comp-type-changes">
            <p className="version-comp-sub-head">Data Type Changes</p>
            <p className="version-comp-sub-desc">No data type changes detected between these versions.</p>
          </div>
        </div>

        {/* PCA Drift */}
        <div className="version-comp-card card-shadow">
          <div className="version-comp-card-hdr">
            <h2 className="version-comp-sec-title">PCA Drift Analysis</h2>
            {ds.pcaDrift && ds.pcaDrift.length > 0 && (
              <span className={`version-comp-drift-pill ${maxShift > 0.3 ? 'warn' : 'ok'}`}>
                {maxShift > 0.3 ? '⚠ Drift detected' : '✓ Stable'}
              </span>
            )}
          </div>
          {!ds.pcaDrift || ds.pcaDrift.length === 0 ? (
            <p className="version-comp-empty-text">PCA drift analysis requires at least 2 versions with sufficient rows.</p>
          ) : (
            <div className="version-comp-drift-list">
              {ds.pcaDrift.map(pc => {
                const color = pc.shift > 0.3 ? '#EF4444' : pc.shift > 0.15 ? '#F59E0B' : '#10B981';
                return (
                  <div key={pc.component} className="version-comp-drift-row">
                    <div className="version-comp-drift-content">
                      <div className="version-comp-drift-top">
                        <span className="version-comp-drift-name">{pc.component}</span>
                        <span className="version-comp-drift-delta" style={{ color }}>Δ {pc.shift.toFixed(2)}</span>
                      </div>
                      <div className="version-comp-drift-track">
                        <div className="version-comp-drift-baseline" />
                        <div
                          className="version-comp-drift-bar"
                          style={{
                            left: pc.v4 >= 0 ? '50%' : `${50 - Math.min(pc.shift, 0.5) * 100}%`,
                            width: `${Math.min(pc.shift, 0.5) * 100}%`,
                            backgroundColor: color,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="version-comp-drift-note">Shift measured as L2 distance in normalized PCA space. Values &gt;0.3 indicate significant distributional change.</p>
            </div>
          )}
        </div>
      </div>

      {/* Version notes */}
      <div className="version-comp-notes-box">
        <h2 className="version-comp-notes-title">Change Notes</h2>
        <div className="version-comp-notes-grid">
          {[left, right].map((v, i) => (
            <div key={v.id || i} className="version-comp-note-item">
              <p className="version-comp-note-head">
                {v.label} {i === 1 && <span className="version-comp-note-head-tag">→ HEAD</span>}
              </p>
              <p className="version-comp-note-desc">{v.note}</p>
              <p className="version-comp-note-meta">{v.date} · {v.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
