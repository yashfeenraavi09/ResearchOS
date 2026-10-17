import { useState, useEffect } from 'react';
import { fetchTracking } from '../lib/api';
import './Tracking.css';

const TRACKED_EVENT_ICONS = [
  <svg key="0" width="16" height="16" fill="none" viewBox="0 0 16 16"><ellipse cx="8" cy="4.5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.3"/><path d="M3 4.5v4c0 1.1 2.24 2 5 2s5-.9 5-2v-4" stroke="currentColor" strokeWidth="1.3"/><path d="M3 8.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="currentColor" strokeWidth="1.3"/></svg>,
  <svg key="1" width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M6 2v5.5L3 13h10l-3-5.5V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 2h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  <svg key="2" width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 6h5M5.5 9h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  <svg key="3" width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M3 8h2l2-5 2 10 2-6 1 3h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
];

const TRACKED_EVENTS = [
  { label: 'Dataset loading', iconIdx: 0, desc: 'File paths, version IDs, row/column counts', active: true },
  { label: 'Model training', iconIdx: 1, desc: 'Hyperparameters, epoch metrics, loss curves', active: true },
  { label: 'Experiment metadata', iconIdx: 2, desc: 'Run IDs, timestamps, framework versions', active: true },
  { label: 'Preprocessing steps', iconIdx: 3, desc: 'Transform type, tool used, duration', active: false },
];

const INITIAL_CONSENT = [
  { id: 'datasets', label: 'Upload Dataset File', detail: 'Raw data files (Requires explicit consent)', checked: false, required: false },
  { id: 'metadata', label: 'Log Experiment Metadata', detail: 'Run config, hyperparams, epoch metrics — no raw data', checked: true, required: true },
  { id: 'lineage', label: 'Sync Lineage Graph', detail: 'Node/edge structure of your pipeline', checked: true, required: false },
  { id: 'versions', label: 'Log Dataset Version Hashes', detail: 'MD5/SHA256 hashes for reproducibility', checked: true, required: false },
];

function StatusDot({ active }) {
  return (
    <span className={`tracking-status-dot ${active ? 'active animate-pulse' : 'inactive'}`} />
  );
}

export default function Tracking() {
  const [consent, setConsent] = useState(INITIAL_CONSENT);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [tracking, setTracking] = useState(true);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const sessions = await fetchTracking();
        if (sessions && sessions.length > 0) {
          setSession(sessions[0]);
        }
      } catch (err) {
        console.error('Failed to load tracking session', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  function toggle(id) {
    setConsent(prev => prev.map(c => c.id === id && !c.required ? { ...c, checked: !c.checked } : c));
  }

  async function handleSync() {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1200));
    setSyncing(false);
    setSynced(true);
    setTimeout(() => setSynced(false), 4000);
  }

  function handleCancel() {
    setConsent(INITIAL_CONSENT);
  }

  const datasetsTouched = session?.logs?.filter(l => l.type === 'dataset') || [];
  const experimentsRun = session?.logs?.filter(l => l.type === 'experiment') || [];
  const modelsTrained = session?.logs?.filter(l => l.type === 'model') || [];

  return (
    <div className="tracking-container">
      {/* Header */}
      <div className="tracking-header">
        <div>
          <h1 className="tracking-title">Tracking SDK</h1>
          <p className="tracking-subtitle">Monitor data lineage, experiments, and model training in real time</p>
        </div>
        <div className="tracking-header-actions">
          <div className={`tracking-status-badge ${tracking ? 'active' : 'paused'}`}>
            <StatusDot active={tracking} />
            Tracking {tracking ? 'Active' : 'Paused'}
          </div>
          <button
            onClick={() => setTracking(t => !t)}
            className="tracking-btn-pause"
          >
            {tracking ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      <div className="tracking-grid">
        {/* Left column: status + session */}
        <div className="tracking-col-main">

          {/* Tracking Status card */}
          <div className="tracking-card card-shadow">
            <div className="tracking-card-header">
              <h2 className="tracking-card-title">Tracking Status</h2>
              <span className="tracking-session-id">
                {session?.session_token || session?.id || (loading ? 'Loading…' : 'ros-sdk-standby')}
              </span>
            </div>
            <div className="tracking-events-grid">
              {TRACKED_EVENTS.map(ev => (
                <div key={ev.label} className={`tracking-event-item ${ev.active ? 'active' : 'inactive'}`}>
                  <span className={`tracking-event-icon ${ev.active ? 'active' : 'inactive'}`}>
                    {TRACKED_EVENT_ICONS[ev.iconIdx]}
                  </span>
                  <div className="tracking-event-body">
                    <div className="tracking-event-top">
                      <span className="tracking-event-label">{ev.label}</span>
                      <StatusDot active={ev.active} />
                    </div>
                    <p className="tracking-event-desc">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Summary */}
          <div className="tracking-card card-shadow">
            <div className="tracking-card-header">
              <h2 className="tracking-card-title">Session Summary</h2>
              <div className="tracking-session-meta">
                <span className="tracking-session-time">
                  {session?.created_at ? new Date(session.created_at).toLocaleString() : 'Standby · Ready to track'}
                </span>
                <span style={{ margin: '0 6px' }}>·</span>
                {session?.status || 'Live'}
              </div>
            </div>

            {/* Datasets touched */}
            <div className="tracking-section-group">
              <h3 className="tracking-section-title">Datasets Touched</h3>
              <div className="tracking-items-list">
                {datasetsTouched.length > 0 ? (
                  datasetsTouched.map((d, i) => (
                    <div key={i} className="tracking-item-row">
                      <span className="tracking-item-icon-teal">
                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                          <ellipse cx="8" cy="4.5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.3"/>
                          <path d="M3 4.5v4c0 1.1 2.24 2 5 2s5-.9 5-2v-4" stroke="currentColor" strokeWidth="1.3"/>
                          <path d="M3 8.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="currentColor" strokeWidth="1.3"/>
                        </svg>
                      </span>
                      <div className="tracking-item-content">
                        <span className="tracking-item-name">{d.name || d.label}</span>
                        <span className="tracking-item-version">{d.version || 'V1'}</span>
                      </div>
                      <span className="tracking-item-action">{d.action || 'loaded'}</span>
                      <span className="tracking-item-timestamp">{d.time || 'just now'}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '14px', fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
                    No dataset events recorded in current session
                  </div>
                )}
              </div>
            </div>

            {/* Experiments run */}
            <div className="tracking-section-group">
              <h3 className="tracking-section-title">Experiments Run</h3>
              <div className="tracking-items-list">
                {experimentsRun.length > 0 ? (
                  experimentsRun.map((e, i) => (
                    <div key={i} className="tracking-item-row">
                      <span className="tracking-item-icon-purple">
                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                          <path d="M6 2v5.5L3 13h10l-3-5.5V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 2h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <div className="tracking-item-content">
                        <span className="tracking-item-name">{e.name || 'Experiment'}</span>
                        <span className="tracking-item-model">{e.model || 'Transformer'}</span>
                      </div>
                      <span className="tracking-item-acc">{e.accuracy ? `${e.accuracy}%` : '—'}</span>
                      <span className="tracking-item-status">{e.status || 'completed'}</span>
                      <span className="tracking-item-timestamp">{e.time || 'just now'}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '14px', fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
                    No experiments initiated in current session
                  </div>
                )}
              </div>
            </div>

            {/* Models trained */}
            <div className="tracking-section-group">
              <h3 className="tracking-section-title">Models Trained</h3>
              <div className="tracking-items-list">
                {modelsTrained.length > 0 ? (
                  modelsTrained.map((m, i) => (
                    <div key={i} className="tracking-item-row">
                      <span className="tracking-item-icon-cyan">
                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                          <rect x="3" y="5" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                          <path d="M6 5V4a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                          <circle cx="6" cy="9" r="1" fill="currentColor"/>
                          <circle cx="10" cy="9" r="1" fill="currentColor"/>
                        </svg>
                      </span>
                      <div className="tracking-item-content">
                        <span className="tracking-item-name">{m.name}</span>
                      </div>
                      <span className="tracking-item-sub">{m.epochs ? `${m.epochs} epochs` : '—'}</span>
                      <span className="tracking-item-sub">{m.size || '—'}</span>
                      <span className="tracking-item-timestamp">{m.time || 'just now'}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '14px', fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
                    No model checkpoints saved in current session
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: consent panel */}
        <div className="tracking-col-side">
          <div className="tracking-card card-shadow">
            <h2 className="tracking-card-title" style={{ marginBottom: 4 }}>Sync Consent</h2>
            <p className="tracking-event-desc" style={{ marginBottom: 16 }}>Choose what to sync to your ResearchOS workspace.</p>

            {/* Privacy notice */}
            <div className="tracking-privacy-alert">
              <span className="tracking-privacy-icon">
                <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
                  <rect x="2.5" y="6.5" width="10" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </span>
              <p className="tracking-privacy-text">
                Dataset files are never uploaded without your confirmation.
              </p>
            </div>

            <div className="tracking-consent-list">
              {consent.map(c => (
                <label
                  key={c.id}
                  className={`tracking-consent-item ${c.checked ? 'checked' : ''} ${c.required ? 'required' : ''}`}
                  onClick={() => toggle(c.id)}
                >
                  <div className={`tracking-checkbox ${c.checked ? 'checked' : ''}`}>
                    {c.checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tracking-consent-top">
                      <span className="tracking-consent-label">{c.label}</span>
                      {c.required && <span className="tracking-consent-badge">required</span>}
                    </div>
                    <p className="tracking-consent-detail">{c.detail}</p>
                  </div>
                </label>
              ))}
            </div>

            {synced && (
              <div className="tracking-synced-banner">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M2 7L5.5 10.5L12 3" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Synced successfully!
              </div>
            )}

            <div className="tracking-actions">
              <button
                onClick={handleCancel}
                className="tracking-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSync}
                disabled={syncing || !consent.some(c => c.checked)}
                className="tracking-btn-sync gradient-teal"
              >
                {syncing ? (
                  <>
                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
                      <path d="M6.5 1.5A5 5 0 0 1 11.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Syncing…
                  </>
                ) : 'Confirm & Sync'}
              </button>
            </div>
          </div>

          {/* SDK snippet */}
          <div className="tracking-code-card card-shadow">
            <h3 className="tracking-code-title">Python SDK</h3>
            <pre className="tracking-code-block">
{`import researchos as ros

ros.init(project="PRJ-0042")

with ros.experiment("bert-large-v3"):
    model.fit(X_train, y_train)
    ros.log_metric("accuracy", 0.942)
    ros.log_dataset("pubmed-v4")`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
