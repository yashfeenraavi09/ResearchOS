import { useState, useEffect } from 'react';
import { fetchExperiment } from '../lib/api';
import './ExperimentDetail.css';

export default function ExperimentDetail({ experimentId, onBack, onViewDataset, onViewLineage }) {
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    let mounted = true;
    fetchExperiment(experimentId).then(data => {
      if (mounted) {
        if (data) {
          setExp({
            ...data,
            name: data.name || 'Untitled Experiment',
            project: data.project_name || data.project || 'Project',
            framework: data.framework || 'PyTorch',
            model: data.model || 'Unknown Model',
            modelFamily: data.model_family || data.modelFamily || 'Transformer',
            datasetId: data.dataset_id || data.datasetId,
            datasetName: data.dataset_name || data.datasetName || 'Dataset',
            datasetVersion: data.dataset_version || data.datasetVersion || 'V1',
            status: data.status || 'completed',
            accuracy: data.accuracy ?? 0,
            precision: data.precision ?? 0,
            recall: data.recall ?? 0,
            f1: data.f1 ?? 0,
            loss: data.loss ?? 0,
            epochs: data.epochs ?? 10,
            batchSize: data.batch_size ?? data.batchSize ?? 32,
            learningRate: data.learning_rate ?? data.learningRate ?? 0.001,
            gpu: data.gpu || 'NVIDIA A100',
            executionTime: data.execution_time || data.executionTime || '0s',
            hyperparams: data.hyperparams || [],
            trainingCurves: data.metrics_history || [],
            rocCurve: data.roc_curve || [],
          });
        }
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [experimentId]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
        <p>Loading experiment details...</p>
      </div>
    );
  }

  if (!exp) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>Experiment not found</p>
        <button onClick={onBack} className="exp-detail-primary-btn" style={{ marginTop: '16px' }}>
          Back to Experiments
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'training', label: 'Training Curves' },
    { id: 'confusion', label: 'Confusion Matrix' },
    { id: 'roc', label: 'ROC Curve' },
  ];

  return (
    <div className="exp-detail-container">
      {/* Breadcrumb */}
      <div className="exp-detail-breadcrumb">
        <button onClick={onBack} className="exp-detail-breadcrumb-btn">Experiments</button>
        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="#A0AEBF" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <span className="exp-detail-breadcrumb-current">{exp.name}</span>
      </div>

      {/* Title row */}
      <div className="exp-detail-title-row">
        <div className="exp-detail-title-left">
          <div>
            <div className="exp-detail-heading-row">
              <h1 className="exp-detail-title">{exp.name}</h1>
              <span className={`exp-detail-status-badge ${exp.status}`}>
                <span className={`exp-detail-status-dot ${exp.status} ${exp.status === 'running' ? 'animate-pulse' : ''}`} />
                {exp.status}
              </span>
            </div>
            <p className="exp-detail-subtitle">{exp.id} · {exp.project} · {exp.framework}</p>
          </div>
        </div>
        <div className="exp-detail-actions">
          <button onClick={() => onViewDataset?.(exp.datasetId)} className="exp-detail-action-btn">
            <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><ellipse cx="6.5" cy="3.5" rx="4" ry="1.7" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 3.5v4c0 .94 1.79 1.7 4 1.7s4-.76 4-1.7v-4" stroke="currentColor" strokeWidth="1.3"/></svg>
            View Dataset
          </button>
          <button onClick={onViewLineage} className="exp-detail-action-btn">
            <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><circle cx="2.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 6.5h1M7.5 3l1.5 2.5" stroke="currentColor" strokeWidth="1.2"/></svg>
            View Lineage
          </button>
          <button className="exp-detail-primary-btn">
            <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M2 7l4.5-4.5 4.5 4.5M6.5 2.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Clone & Rerun
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="exp-detail-strip">
        {[
          { label: 'Accuracy', val: exp.accuracy != null ? `${exp.accuracy}%` : '—', hi: exp.accuracy != null && exp.accuracy >= 92 },
          { label: 'Precision', val: exp.precision != null ? `${exp.precision}%` : '—', hi: false },
          { label: 'Recall', val: exp.recall != null ? `${exp.recall}%` : '—', hi: false },
          { label: 'F1 Score', val: exp.f1 != null ? `${exp.f1}%` : '—', hi: false },
          { label: 'AUC-ROC', val: exp.auc != null ? exp.auc.toFixed(3) : '—', hi: false },
          { label: 'Exec Time', val: exp.executionTime, hi: false },
          { label: 'GPU', val: exp.gpu.split(' ').slice(1, 3).join(' '), hi: false },
          { label: 'Dataset Ver.', val: exp.datasetVersion, hi: false },
        ].map(s => (
          <div key={s.label} className={`exp-detail-strip-item ${s.hi ? 'highlighted' : ''}`}>
            <p className="exp-detail-strip-lbl">{s.label}</p>
            <p className={`exp-detail-strip-val ${s.hi ? 'highlighted' : ''}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="exp-detail-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`exp-detail-tab-btn ${tab === t.id ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab exp={exp} />}
      {tab === 'metrics' && <MetricsTab exp={exp} />}
      {tab === 'training' && <TrainingTab exp={exp} />}
      {tab === 'confusion' && <ConfusionTab exp={exp} />}
      {tab === 'roc' && <RocTab exp={exp} />}
    </div>
  );
}

function OverviewTab({ exp }) {
  return (
    <div className="exp-detail-grid-3">
      <div className="exp-detail-col-span-2 exp-detail-space-y-5">
        {/* Model info */}
        <div className="exp-detail-card card-shadow">
          <h2 className="exp-detail-card-title">Model Information</h2>
          <div className="exp-detail-info-grid">
            {[
              { label: 'Model Name', val: exp.model },
              { label: 'Model Family', val: exp.modelFamily },
              { label: 'Framework', val: exp.framework },
              { label: 'GPU', val: exp.gpu },
              { label: 'Batch Size', val: String(exp.batchSize) },
              { label: 'Epochs', val: String(exp.epochs) },
              { label: 'Learning Rate', val: exp.learningRate ? exp.learningRate.toExponential(0) : '—' },
              { label: 'Created By', val: exp.createdBy },
            ].map(r => (
              <div key={r.label} className="exp-detail-info-row">
                <span className="exp-detail-info-lbl">{r.label}</span>
                <span className="exp-detail-info-val">{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset */}
        <div className="exp-detail-card card-shadow">
          <h2 className="exp-detail-card-title">Dataset Version</h2>
          <div className="exp-detail-ds-box">
            <div className="exp-detail-ds-icon">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><ellipse cx="8" cy="4.5" rx="4.5" ry="1.8" stroke="#0F9D8A" strokeWidth="1.4"/><path d="M3.5 4.5v3c0 1 2.02 1.8 4.5 1.8S12.5 8.5 12.5 7.5v-3" stroke="#0F9D8A" strokeWidth="1.4"/><path d="M3.5 7.5v3c0 1 2.02 1.8 4.5 1.8S12.5 11.5 12.5 10.5v-3" stroke="#0F9D8A" strokeWidth="1.4"/></svg>
            </div>
            <div className="exp-detail-ds-text">
              <p className="exp-detail-ds-name">{exp.datasetName}</p>
              <p className="exp-detail-ds-sub">Version {exp.datasetVersion} · Used for training and evaluation</p>
            </div>
            <span className="exp-detail-ds-badge">{exp.datasetVersion}</span>
          </div>
        </div>

        {/* Notes */}
        {exp.notes && (
          <div className="exp-detail-notes-card">
            <h2 className="exp-detail-notes-title">
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M6.5 1a5.5 5.5 0 1 1 0 11A5.5 5.5 0 0 1 6.5 1z" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 5v4M6.5 4.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Researcher Notes
            </h2>
            <p className="exp-detail-notes-body">{exp.notes}</p>
          </div>
        )}
      </div>

      {/* Hyperparams */}
      <div className="exp-detail-card card-shadow">
        <h2 className="exp-detail-card-title">Hyperparameters</h2>
        <div className="exp-detail-hp-list">
          {exp.hyperparams && exp.hyperparams.map(hp => (
            <div key={hp.name} className="exp-detail-hp-row">
              <span className="exp-detail-hp-name">{hp.name}</span>
              <span className={`exp-detail-hp-val ${
                hp.type === 'bool' ? (hp.value ? 'bool-true' : 'bool-false') : 'default'
              }`}>
                {String(hp.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricsTab({ exp }) {
  const metrics = [
    { label: 'Accuracy', val: exp.accuracy, desc: 'Fraction of correct predictions', color: '#0F9D8A' },
    { label: 'Precision', val: exp.precision, desc: 'TP / (TP + FP)', color: '#22C7D6' },
    { label: 'Recall', val: exp.recall, desc: 'TP / (TP + FN)', color: '#8B5CF6' },
    { label: 'F1 Score', val: exp.f1, desc: 'Harmonic mean of precision & recall', color: '#F59E0B' },
  ];

  return (
    <div className="exp-detail-grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <div className="exp-detail-card card-shadow">
        <h2 className="exp-detail-card-title">Evaluation Metrics</h2>
        {exp.accuracy == null ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: '13px', color: '#6B7C93' }}>No metrics available — experiment {exp.status === 'failed' ? 'failed before completion' : 'not yet started'}.</p>
          </div>
        ) : (
          <div>
            {metrics.map(m => (
              <div key={m.label} className="exp-detail-metric-bar-group">
                <div className="exp-detail-metric-bar-top">
                  <div>
                    <span className="exp-detail-metric-bar-lbl">{m.label}</span>
                    <span className="exp-detail-metric-bar-desc">{m.desc}</span>
                  </div>
                  <span className="exp-detail-metric-bar-val" style={{ color: m.color }}>
                    {m.val != null ? m.val.toFixed(1) : 0}%
                  </span>
                </div>
                <div className="exp-detail-metric-track">
                  <div className="exp-detail-metric-fill" style={{ width: `${m.val || 0}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="exp-detail-card card-shadow">
        <h2 className="exp-detail-card-title">Performance Summary</h2>
        {exp.accuracy == null ? (
          <p style={{ fontSize: '13px', color: '#6B7C93' }}>No data available.</p>
        ) : (
          <>
            <div className="exp-detail-perf-grid">
              {[
                { label: 'AUC-ROC', val: exp.auc != null ? exp.auc.toFixed(3) : '—', colorClass: 'teal' },
                { label: 'Exec Time', val: exp.executionTime, colorClass: 'dark' },
                { label: 'GPU', val: exp.gpu.split(' ').slice(1, 3).join(' '), colorClass: 'dark' },
                { label: 'Framework', val: exp.framework.split(' ')[0], colorClass: 'dark' },
              ].map(s => (
                <div key={s.label} className="exp-detail-perf-cell">
                  <p className="exp-detail-perf-lbl">{s.label}</p>
                  <p className={`exp-detail-perf-val ${s.colorClass}`}>{s.val}</p>
                </div>
              ))}
            </div>
            <div className="exp-detail-assessment-box">
              <p className="exp-detail-assessment-title">Assessment</p>
              <p className="exp-detail-assessment-desc">
                {exp.accuracy >= 92
                  ? `Excellent performance. This run ranks in the top experiments for ${exp.datasetName}.`
                  : exp.accuracy >= 85
                  ? `Good performance. Consider tuning learning rate or architecture for further gains.`
                  : `Below threshold. Review hyperparameters and data preprocessing.`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TrainingTab({ exp }) {
  if (!exp.epochMetrics || exp.epochMetrics.length === 0) {
    return (
      <div className="exp-detail-empty-card card-shadow">
        <p className="exp-detail-empty-title">No training data available</p>
        <p className="exp-detail-empty-sub">Experiment has not started training yet.</p>
      </div>
    );
  }

  const data = exp.epochMetrics;
  const W = 520, H = 180, PAD = { t: 12, r: 12, b: 32, l: 44 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  function toX(i) { return PAD.l + (i / (data.length - 1 || 1)) * iW; }
  function toY(val, min, max) { return PAD.t + (1 - (val - min) / ((max - min) || 1)) * iH; }

  function polyline(vals, min, max) {
    return vals.map((v, i) => `${toX(i)},${toY(v, min, max)}`).join(' ');
  }

  const accVals = data.flatMap(d => [d.trainAcc, d.valAcc]);
  const lossVals = data.flatMap(d => [d.trainLoss, d.valLoss]);
  const accMin = Math.max(0, Math.min(...accVals) - 5);
  const accMax = Math.min(100, Math.max(...accVals) + 2);
  const lossMin = 0;
  const lossMax = Math.max(...lossVals) * 1.1;

  function yTicks(min, max, n = 4) {
    return Array.from({ length: n }, (_, i) => min + (i / (n - 1)) * (max - min));
  }

  function Chart({ title, trainVals, valVals, min, max, unit }) {
    return (
      <div className="exp-detail-card card-shadow" style={{ marginBottom: '20px' }}>
        <div className="exp-detail-chart-header">
          <h3 className="exp-detail-card-title-sm">{title}</h3>
          <div className="exp-detail-legend">
            <div className="exp-detail-legend-item">
              <div className="exp-detail-legend-line-train" />
              <span className="exp-detail-legend-lbl">Train</span>
            </div>
            <div className="exp-detail-legend-item">
              <div className="exp-detail-legend-line-val" />
              <span className="exp-detail-legend-lbl">Val</span>
            </div>
          </div>
        </div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {yTicks(min, max).map((v, i) => (
            <g key={i}>
              <line x1={PAD.l} y1={toY(v, min, max)} x2={W - PAD.r} y2={toY(v, min, max)} stroke="#F0F4F8" strokeWidth="1" />
              <text x={PAD.l - 4} y={toY(v, min, max) + 4} textAnchor="end" fill="#A0AEBF" fontSize="9" fontFamily="DM Mono">{v.toFixed(unit === '%' ? 0 : 2)}{unit}</text>
            </g>
          ))}
          {/* X labels */}
          {data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1).map(d => (
            <text key={d.epoch} x={toX(data.indexOf(d))} y={H - 6} textAnchor="middle" fill="#A0AEBF" fontSize="9" fontFamily="DM Mono">E{d.epoch}</text>
          ))}
          {/* Val line (dashed) */}
          <polyline points={polyline(valVals, min, max)} fill="none" stroke="#22C7D6" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round" />
          {/* Train line */}
          <polyline points={polyline(trainVals, min, max)} fill="none" stroke="#0F9D8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Last point dot */}
          <circle cx={toX(data.length - 1)} cy={toY(trainVals[trainVals.length - 1], min, max)} r="3" fill="#0F9D8A" />
          <circle cx={toX(data.length - 1)} cy={toY(valVals[valVals.length - 1], min, max)} r="3" fill="#22C7D6" />
        </svg>
      </div>
    );
  }

  return (
    <div className="exp-detail-space-y-5">
      <Chart title="Accuracy over Epochs" trainVals={data.map(d => d.trainAcc)} valVals={data.map(d => d.valAcc)} min={accMin} max={accMax} unit="%" />
      <Chart title="Loss over Epochs" trainVals={data.map(d => d.trainLoss)} valVals={data.map(d => d.valLoss)} min={lossMin} max={lossMax} unit="" />

      {/* Epoch table */}
      <div className="exp-detail-card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="exp-detail-epoch-table-header">
          <h3 className="exp-detail-card-title-sm">Epoch Log</h3>
        </div>
        <div className="exp-detail-epoch-table-cols">
          {['Epoch', 'Train Acc', 'Val Acc', 'Train Loss', 'Val Loss'].map(h => (
            <p key={h} className="exp-detail-epoch-th">{h}</p>
          ))}
        </div>
        <div className="exp-detail-epoch-body">
          {[...data].reverse().map(d => (
            <div key={d.epoch} className="exp-detail-epoch-row">
              <span style={{ color: '#6B7C93' }}>{d.epoch}</span>
              <span style={{ color: '#059669' }}>{d.trainAcc.toFixed(2)}%</span>
              <span style={{ color: '#22C7D6' }}>{d.valAcc.toFixed(2)}%</span>
              <span style={{ color: '#0B1220' }}>{d.trainLoss.toFixed(4)}</span>
              <span style={{ color: '#0B1220' }}>{d.valLoss.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfusionTab({ exp }) {
  if (!exp.confusionMatrix || exp.confusionMatrix.length === 0) {
    return (
      <div className="exp-detail-empty-card card-shadow">
        <p className="exp-detail-empty-title">No confusion matrix available</p>
        <p className="exp-detail-empty-sub">Experiment {exp.status === 'failed' ? 'did not complete' : 'has not run yet'}.</p>
      </div>
    );
  }

  const mat = exp.confusionMatrix;
  const labels = exp.confusionLabels;
  const totals = mat.map(row => row.reduce((a, b) => a + b, 0));
  const maxVal = Math.max(...mat.flat());

  return (
    <div className="exp-detail-grid-3">
      <div className="exp-detail-col-span-2 exp-detail-card card-shadow">
        <h2 className="exp-detail-card-title">Confusion Matrix</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="exp-detail-confusion-table">
            <thead>
              <tr>
                <td style={{ paddingRight: '12px', paddingBottom: '8px', fontSize: '10px', color: '#A0AEBF', textAlign: 'right', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actual ↓ Pred →</td>
                {labels.map(l => <th key={l} style={{ padding: '0 4px 8px 4px', fontSize: '11px', fontWeight: 600, color: '#3A4A5C', minWidth: '80px' }}>{l}</th>)}
                <th style={{ padding: '0 4px 8px 4px', fontSize: '11px', fontWeight: 600, color: '#A0AEBF' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {mat.map((row, ri) => (
                <tr key={ri}>
                  <td style={{ paddingRight: '12px', padding: '4px 12px 4px 0', fontSize: '11.5px', fontWeight: 600, color: '#3A4A5C', textAlign: 'right' }}>{labels[ri]}</td>
                  {row.map((val, ci) => {
                    const isDiag = ri === ci;
                    const intensity = val / (maxVal || 1);
                    const bg = isDiag
                      ? `rgba(15,157,138,${0.12 + intensity * 0.55})`
                      : val > 0 ? `rgba(239,68,68,${Math.min(0.5, intensity * 1.2)})` : '#F7F9FC';
                    return (
                      <td key={ci} style={{ padding: '4px' }}>
                        <div className="exp-detail-confusion-cell" style={{ backgroundColor: bg }}>
                          <span className={`exp-detail-confusion-cell-num ${isDiag ? '' : val > 20 ? 'misclass' : ''}`} style={{ color: isDiag ? '#0F9D8A' : val > 20 ? '#DC2626' : '#6B7C93' }}>{val}</span>
                          <span className="exp-detail-confusion-cell-pct" style={{ color: isDiag ? '#0F9D8A' : '#6B7C93' }}>{((val / (totals[ri] || 1)) * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ paddingLeft: '4px', fontSize: '12px', fontFamily: 'monospace', color: '#A0AEBF' }}>{totals[ri].toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: '#A0AEBF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(15,157,138,0.5)' }} />
            <span>Correct prediction</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(252,165,165,0.5)' }} />
            <span>Misclassification</span>
          </div>
        </div>
      </div>

      <div className="exp-detail-card card-shadow">
        <h2 className="exp-detail-card-title">Per-Class Stats</h2>
        <div>
          {labels.map((label, ri) => {
            const tp = mat[ri][ri];
            const sumCol = mat.map(row => row[ri]).reduce((a, b) => a + b, 0);
            const prec = sumCol > 0 ? tp / sumCol : 0;
            const rec = totals[ri] > 0 ? tp / totals[ri] : 0;
            const f1 = (prec + rec > 0) ? (2 * prec * rec) / (prec + rec) : 0;
            return (
              <div key={label} className="exp-detail-class-stat-box">
                <p className="exp-detail-class-stat-name">{label}</p>
                <div className="exp-detail-class-stat-grid">
                  {[{ label: 'Prec', val: prec }, { label: 'Rec', val: rec }, { label: 'F1', val: f1 }].map(m => (
                    <div key={m.label}>
                      <p className="exp-detail-class-stat-lbl">{m.label}</p>
                      <p className="exp-detail-class-stat-val">{(m.val * 100).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RocTab({ exp }) {
  if (!exp.rocPoints || exp.rocPoints.length === 0) {
    return (
      <div className="exp-detail-empty-card card-shadow">
        <p className="exp-detail-empty-title">No ROC curve data available</p>
        <p className="exp-detail-empty-sub">Experiment has not completed evaluation.</p>
      </div>
    );
  }

  const W = 420, H = 380, PAD = 50;
  const iW = W - PAD * 2, iH = H - PAD * 2;
  const pts = exp.rocPoints;

  function toX(fpr) { return PAD + fpr * iW; }
  function toY(tpr) { return PAD + (1 - tpr) * iH; }

  const polyPts = pts.map(p => `${toX(p.fpr)},${toY(p.tpr)}`).join(' ');
  const fillPts = `${toX(0)},${toY(0)} ` + polyPts + ` ${toX(1)},${toY(0)}`;

  return (
    <div className="exp-detail-grid-3">
      <div className="exp-detail-col-span-2 exp-detail-card card-shadow">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 className="exp-detail-card-title" style={{ margin: 0 }}>ROC Curve</h2>
          <div className="exp-detail-auc-badge">
            <span className="exp-detail-auc-badge-text">AUC = {exp.auc?.toFixed(3)}</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: '420px', margin: '0 auto', display: 'block' }}>
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map(v => (
            <g key={v}>
              <line x1={toX(v)} y1={PAD} x2={toX(v)} y2={H - PAD} stroke="#F0F4F8" strokeWidth="1" />
              <line x1={PAD} y1={toY(v)} x2={W - PAD} y2={toY(v)} stroke="#F0F4F8" strokeWidth="1" />
              <text x={toX(v)} y={H - PAD + 14} textAnchor="middle" fill="#A0AEBF" fontSize="9" fontFamily="DM Mono">{v.toFixed(2)}</text>
              <text x={PAD - 8} y={toY(v) + 3} textAnchor="end" fill="#A0AEBF" fontSize="9" fontFamily="DM Mono">{v.toFixed(2)}</text>
            </g>
          ))}
          {/* Diagonal reference */}
          <line x1={toX(0)} y1={toY(0)} x2={toX(1)} y2={toY(1)} stroke="#D1D9E4" strokeWidth="1.5" strokeDasharray="5,4" />
          {/* Fill under curve */}
          <polygon points={fillPts} fill="url(#rocGrad)" opacity="0.25" />
          <defs>
            <linearGradient id="rocGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F9D8A" />
              <stop offset="100%" stopColor="#22C7D6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* ROC curve */}
          <polyline points={polyPts} fill="none" stroke="#0F9D8A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Axis labels */}
          <text x={W / 2} y={H - 6} textAnchor="middle" fill="#6B7C93" fontSize="11" fontFamily="Inter">False Positive Rate</text>
          <text x={14} y={H / 2} textAnchor="middle" fill="#6B7C93" fontSize="11" fontFamily="Inter" transform={`rotate(-90 14 ${H / 2})`}>True Positive Rate</text>
        </svg>
      </div>

      <div className="exp-detail-space-y-4">
        <div className="exp-detail-card card-shadow">
          <h2 className="exp-detail-card-title-sm" style={{ marginBottom: '12px' }}>Classifier Quality</h2>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <p className="exp-detail-auc-big">{exp.auc?.toFixed(3)}</p>
            <p className="exp-detail-auc-sub">Area Under Curve</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { range: '1.0', label: 'Perfect', color: '#10B981' },
              { range: '0.9–1.0', label: 'Excellent', color: '#0F9D8A' },
              { range: '0.8–0.9', label: 'Good', color: '#22C7D6' },
              { range: '0.7–0.8', label: 'Fair', color: '#F59E0B' },
              { range: '< 0.7', label: 'Poor', color: '#EF4444' },
            ].map(r => {
              const active = exp.auc != null && (
                (r.range === '1.0' && exp.auc === 1) ||
                (r.range === '0.9–1.0' && exp.auc >= 0.9 && exp.auc < 1) ||
                (r.range === '0.8–0.9' && exp.auc >= 0.8 && exp.auc < 0.9) ||
                (r.range === '0.7–0.8' && exp.auc >= 0.7 && exp.auc < 0.8) ||
                (r.range === '< 0.7' && exp.auc < 0.7)
              );
              return (
                <div key={r.range} className={`exp-detail-roc-bracket ${active ? 'active' : ''}`}>
                  <div className="exp-detail-roc-bracket-dot" style={{ backgroundColor: r.color }} />
                  <span className="exp-detail-roc-bracket-rng">{r.range}</span>
                  <span className={`exp-detail-roc-bracket-lbl ${active ? 'active' : ''}`}>{r.label}</span>
                  {active && <span className="exp-detail-roc-bracket-current">← This run</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
