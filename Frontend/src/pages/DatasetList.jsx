import { useState, useEffect } from 'react';
import { fetchDatasets } from '../lib/api';
import './DatasetList.css';

function QualityBadge({ score }) {
  const level = score >= 90 ? 'high' : score >= 75 ? 'med' : 'low';
  return (
    <div className={`datasetlist-quality-badge ${level}`}>
      <div className="datasetlist-quality-track">
        <div className="datasetlist-quality-fill" style={{ width: `${score}%` }} />
      </div>
      <span className="datasetlist-quality-score">{score}</span>
    </div>
  );
}

function fmt(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function DatasetIcon({ type }) {
  if (type === 'Vision') return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><rect x="1.5" y="2.5" width="12" height="10" rx="1.5" stroke="#0F9D8A" strokeWidth="1.4"/><circle cx="7.5" cy="7.5" r="2" stroke="#0F9D8A" strokeWidth="1.2"/></svg>;
  if (type === 'Graph') return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><circle cx="3" cy="7.5" r="1.5" stroke="#0F9D8A" strokeWidth="1.3"/><circle cx="7.5" cy="3" r="1.5" stroke="#0F9D8A" strokeWidth="1.3"/><circle cx="12" cy="7.5" r="1.5" stroke="#0F9D8A" strokeWidth="1.3"/><circle cx="7.5" cy="12" r="1.5" stroke="#0F9D8A" strokeWidth="1.3"/><path d="M4.5 7.5h1.5M9 7.5h1.5M7.5 4.5v1.5M7.5 9v1.5" stroke="#0F9D8A" strokeWidth="1.2"/></svg>;
  return <svg width="15" height="15" fill="none" viewBox="0 0 15 15"><ellipse cx="7.5" cy="4.5" rx="4.5" ry="1.8" stroke="#0F9D8A" strokeWidth="1.3"/><path d="M3 4.5v3c0 1 2.02 1.8 4.5 1.8S12 8.5 12 7.5v-3" stroke="#0F9D8A" strokeWidth="1.3"/><path d="M3 7.5v3c0 1 2.02 1.8 4.5 1.8S12 11.5 12 10.5v-3" stroke="#0F9D8A" strokeWidth="1.3"/></svg>;
}

function DatasetRow({ ds, onSelect }) {
  const name = ds.name || 'Untitled Dataset';
  const owner = ds.owner || 'You';
  const type = ds.type || 'Tabular';
  const version = ds.current_version || ds.currentVersion || 'V1';
  const rows = ds.rows_count ?? ds.rows ?? 0;
  const cols = ds.columns_count ?? ds.columns ?? 0;
  const quality = ds.quality_score ?? ds.qualityScore ?? 100;
  const updated = ds.updated || (ds.created_at ? new Date(ds.created_at).toLocaleDateString() : 'Recently');

  return (
    <div
      onClick={onSelect}
      className="datasetlist-table-row"
    >
      <div className="datasetlist-info-cell">
        <div className="datasetlist-icon-box">
          <DatasetIcon type={type} />
        </div>
        <div className="datasetlist-name-box">
          <p className="datasetlist-name">{name}</p>
          <p className="datasetlist-owner">{owner}</p>
        </div>
      </div>
      <span className={`datasetlist-type-pill ${type}`}>{type}</span>
      <span className="datasetlist-version-cell">{version}</span>
      <span className="datasetlist-num-cell">{fmt(rows)}</span>
      <span className="datasetlist-num-cell">{cols}</span>
      <QualityBadge score={quality} />
      <span className="datasetlist-time-cell">{updated}</span>
      <button
        onClick={e => { e.stopPropagation(); onSelect(); }}
        className="datasetlist-open-btn"
      >
        Open
      </button>
    </div>
  );
}

export default function DatasetList({ onSelect, onUpload }) {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('updated');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchDatasets().then(data => {
      if (mounted) {
        setDatasets(data || []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const filtered = datasets
    .filter(d => filter === 'all' || d.type === filter)
    .filter(d => (d.name || '').toLowerCase().includes(search.toLowerCase()) || (d.description || d.desc || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const qA = a.quality_score ?? a.qualityScore ?? 100;
      const qB = b.quality_score ?? b.qualityScore ?? 100;
      const rA = a.rows_count ?? a.rows ?? 0;
      const rB = b.rows_count ?? b.rows ?? 0;
      return sort === 'quality' ? qB - qA : sort === 'rows' ? rB - rA : 0;
    });

  return (
    <div className="datasetlist-container">
      {/* Header */}
      <div className="datasetlist-header">
        <div>
          <h1 className="datasetlist-title">Datasets</h1>
          <p className="datasetlist-subtitle">{datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'} in your workspace</p>
        </div>
        <button
          onClick={onUpload}
          className="datasetlist-upload-btn"
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Upload Dataset
        </button>
      </div>

      {/* Controls */}
      <div className="datasetlist-controls">
        <div className="datasetlist-search-wrap">
          <svg className="datasetlist-search-icon" width="13" height="13" fill="none" viewBox="0 0 13 13">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 9L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search datasets..."
            className="datasetlist-search-input"
          />
        </div>
        <div className="datasetlist-filter-group">
          {['all', 'NLP', 'Vision', 'Tabular', 'Graph'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`datasetlist-filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <div className="datasetlist-sort-wrap">
          <span className="datasetlist-sort-label">Sort by</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="datasetlist-sort-select"
          >
            <option value="updated">Last Updated</option>
            <option value="quality">Quality Score</option>
            <option value="rows">Row Count</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="datasetlist-table-box">
        <div className="datasetlist-table-header">
          {['Dataset', 'Type', 'Version', 'Rows', 'Columns', 'Quality', 'Updated', ''].map((h, idx) => (
            <p key={idx} className="datasetlist-col-header">{h}</p>
          ))}
        </div>
        <div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748B' }}>
              <p style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>No datasets found</p>
              <p style={{ fontSize: '13px', marginBottom: 16 }}>Upload your first dataset to start tracking versions and data quality.</p>
              <button onClick={onUpload} className="datasetlist-upload-btn" style={{ margin: '0 auto' }}>
                + Upload Dataset
              </button>
            </div>
          ) : (
            filtered.map(ds => (
              <DatasetRow key={ds.id} ds={ds} onSelect={() => onSelect(ds.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
