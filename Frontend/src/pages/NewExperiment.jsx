import { useState, useEffect } from 'react';
import { fetchDatasets, fetchProjects, createExperiment } from '../lib/api';
import './NewExperiment.css';

const STEPS = [
  { id: 'dataset', label: 'Dataset' },
  { id: 'model', label: 'Model' },
  { id: 'params', label: 'Parameters' },
  { id: 'review', label: 'Review & Run' },
];

const MODEL_OPTIONS = [
  { family: 'Transformer', models: ['BERT-Base', 'BERT-Large', 'RoBERTa-Base', 'RoBERTa-Large', 'GPT-2', 'T5-Base', 'T5-Large', 'XLM-RoBERTa'] },
  { family: 'CNN', models: ['ResNet-50', 'ResNet-101', 'EfficientNet-B4', 'VGG-16', 'DenseNet-121'] },
  { family: 'GNN', models: ['GraphSAGE', 'GCN', 'GAT', 'GIN'] },
  { family: 'Classical', models: ['XGBoost', 'LightGBM', 'Random Forest', 'SVM'] },
];

const GPU_OPTIONS = ['NVIDIA A100 80GB', 'NVIDIA V100 32GB', 'NVIDIA T4 16GB', 'NVIDIA RTX 4090'];

export default function NewExperiment({ onBack, onSuccess }) {
  const [datasets, setDatasets] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  const [step, setStep] = useState('dataset');
  const [datasetId, setDatasetId] = useState('');
  const [datasetVersion, setDatasetVersion] = useState('');
  const [model, setModel] = useState('');
  const [framework, setFramework] = useState('PyTorch 2.1');
  const [gpu, setGpu] = useState(GPU_OPTIONS[0]);
  const [lr, setLr] = useState('2e-5');
  const [batchSize, setBatchSize] = useState('32');
  const [epochs, setEpochs] = useState('10');
  const [maxSeqLen, setMaxSeqLen] = useState('512');
  const [warmup, setWarmup] = useState('500');
  const [dropout, setDropout] = useState('0.1');
  const [name, setName] = useState('');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function initData() {
      try {
        const [ds, prjs] = await Promise.all([fetchDatasets(), fetchProjects()]);
        setDatasets(ds || []);
        setProjectsList(prjs || []);
        if (prjs && prjs.length > 0) {
          setProject(prjs[0].id);
        }
      } catch (err) {
        console.error('Failed to load datasets/projects', err);
      } finally {
        setLoadingDatasets(false);
      }
    }
    initData();
  }, []);

  const selectedDataset = datasets.find(d => d.id === datasetId);
  const stepIdx = STEPS.findIndex(s => s.id === step);

  function canProceed() {
    if (step === 'dataset') return !!datasetId && !!datasetVersion;
    if (step === 'model') return !!model;
    if (step === 'params') return !!lr && !!batchSize && !!epochs;
    return !!name;
  }

  function next() {
    if (step === 'dataset') setStep('model');
    else if (step === 'model') setStep('params');
    else if (step === 'params') {
      if (!name) setName(`${model} on ${selectedDataset?.name || 'Dataset'}`);
      setStep('review');
    }
  }

  async function handleRun() {
    setSaving(true);
    try {
      await createExperiment({
        name: name.trim(),
        model,
        project_id: project || null,
        dataset_id: datasetId,
        dataset_version: datasetVersion,
        framework,
        gpu,
        epochs: parseInt(epochs) || 10,
        batch_size: parseInt(batchSize) || 32,
        learning_rate: parseFloat(lr) || 0.00002,
        hyperparams: {
          maxSeqLen,
          warmup,
          dropout,
          notes,
        },
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to run experiment', err);
      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="new-exp-container">
      <div className="new-exp-breadcrumb">
        <button onClick={onBack} className="new-exp-breadcrumb-btn">Experiments</button>
        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="#A0AEBF" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <span className="new-exp-breadcrumb-current">New Experiment</span>
      </div>

      <h1 className="new-exp-title">New Experiment</h1>

      {/* Step indicator */}
      <div className="new-exp-stepper">
        {STEPS.map((s, i) => (
          <div key={s.id} className="new-exp-step-item">
            <div className="new-exp-step-col">
              <div className={`new-exp-step-circle ${
                i < stepIdx ? 'completed' :
                i === stepIdx ? 'active' :
                'upcoming'
              }`}>
                {i < stepIdx ? <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2.5 6l3 3 4-5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg> : i + 1}
              </div>
              <p className={`new-exp-step-label ${i === stepIdx ? 'active' : 'upcoming'}`}>{s.label}</p>
            </div>
            {i < STEPS.length - 1 && <div className={`new-exp-step-line ${i < stepIdx ? 'completed' : 'upcoming'}`} />}
          </div>
        ))}
      </div>

      {/* Step: Dataset */}
      {step === 'dataset' && (
        <div className="new-exp-space-y-4">
          <p className="new-exp-section-title">Select a dataset and version to train on</p>
          
          {loadingDatasets ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#6B7C93' }}>Loading available datasets…</div>
          ) : datasets.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#6B7C93', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
              <p style={{ fontWeight: 600, color: '#0B1220', marginBottom: '6px' }}>No datasets available</p>
              <p style={{ fontSize: '13px', marginBottom: '14px' }}>Upload a dataset first before running an experiment.</p>
              <button onClick={onBack} className="new-exp-primary-btn" style={{ margin: '0 auto' }}>
                Go to Datasets
              </button>
            </div>
          ) : (
            <div className="new-exp-ds-list">
              {datasets.map(ds => {
                const ver = ds.current_version || ds.currentVersion || 'V1';
                return (
                  <button
                    key={ds.id}
                    onClick={() => { setDatasetId(ds.id); setDatasetVersion(ver); }}
                    className={`new-exp-ds-card ${datasetId === ds.id ? 'selected' : ''}`}
                  >
                    <div className={`new-exp-ds-icon-box ${datasetId === ds.id ? 'selected' : ''}`}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><ellipse cx="8" cy="4.5" rx="4.5" ry="1.8" stroke={datasetId === ds.id ? 'white' : '#6B7C93'} strokeWidth="1.4"/><path d="M3.5 4.5v3c0 1 2.02 1.8 4.5 1.8S12.5 8.5 12.5 7.5v-3" stroke={datasetId === ds.id ? 'white' : '#6B7C93'} strokeWidth="1.4"/><path d="M3.5 7.5v3c0 1 2.02 1.8 4.5 1.8S12.5 11.5 12.5 10.5v-3" stroke={datasetId === ds.id ? 'white' : '#6B7C93'} strokeWidth="1.4"/></svg>
                    </div>
                    <div className="new-exp-ds-info">
                      <div className="new-exp-ds-title-row">
                        <p className="new-exp-ds-name">{ds.name}</p>
                        <span className="new-exp-ds-ver-tag">{ver}</span>
                      </div>
                      <p className="new-exp-ds-desc">{ds.description || ds.desc || 'No description provided'}</p>
                    </div>
                    <div className="new-exp-ds-meta">
                      <p className="new-exp-ds-meta-rows">{ds.rows_count ? `${(ds.rows_count / 1000).toFixed(0)}K rows` : ds.size_str || '—'}</p>
                      <p className="new-exp-ds-meta-type">{ds.type || 'Dataset'}</p>
                    </div>
                    {datasetId === ds.id && (
                      <svg width="18" height="18" fill="none" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                        <circle cx="9" cy="9" r="8" fill="#0F9D8A"/>
                        <path d="M5.5 9l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {datasetId && (
            <div className="new-exp-versions-wrap">
              <label className="new-exp-versions-label">Version</label>
              <div className="new-exp-versions-list">
                {(selectedDataset?.versions && selectedDataset.versions.length > 0 ? selectedDataset.versions : [{ version: datasetVersion || 'V1', label: datasetVersion || 'V1' }]).map((v, idx) => {
                  const val = v.version || v;
                  const lbl = v.label || v.version || v;
                  return (
                    <button
                      key={idx}
                      onClick={() => setDatasetVersion(val)}
                      className={`new-exp-ver-btn ${datasetVersion === val ? 'selected' : ''}`}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step: Model */}
      {step === 'model' && (
        <div className="new-exp-space-y-5">
          {MODEL_OPTIONS.map(fam => (
            <div key={fam.family}>
              <p className="new-exp-family-title">{fam.family}</p>
              <div className="new-exp-models-wrap">
                {fam.models.map(m => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={`new-exp-model-chip ${model === m ? 'selected' : ''}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="new-exp-grid-2" style={{ paddingTop: '8px' }}>
            <div>
              <label className="new-exp-label">Framework</label>
              <select value={framework} onChange={e => setFramework(e.target.value)} className="new-exp-select">
                <option>PyTorch 2.1</option>
                <option>TensorFlow 2.14</option>
                <option>HuggingFace Transformers</option>
                <option>PyTorch Lightning</option>
                <option>JAX 0.4</option>
              </select>
            </div>
            <div>
              <label className="new-exp-label">GPU</label>
              <select value={gpu} onChange={e => setGpu(e.target.value)} className="new-exp-select">
                {GPU_OPTIONS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step: Parameters */}
      {step === 'params' && (
        <div className="new-exp-space-y-5">
          <div className="new-exp-grid-2">
            {[
              { label: 'Learning Rate', val: lr, set: setLr, placeholder: '2e-5', hint: 'e.g. 1e-4, 3e-5' },
              { label: 'Batch Size', val: batchSize, set: setBatchSize, placeholder: '32', hint: '8, 16, 32, 64, 128' },
              { label: 'Epochs', val: epochs, set: setEpochs, placeholder: '10', hint: 'Total training epochs' },
              { label: 'Max Seq Length', val: maxSeqLen, set: setMaxSeqLen, placeholder: '512', hint: 'Token limit per input' },
              { label: 'Warmup Steps', val: warmup, set: setWarmup, placeholder: '500', hint: 'LR scheduler warmup' },
              { label: 'Dropout', val: dropout, set: setDropout, placeholder: '0.1', hint: '0.0 to 0.5' },
            ].map(p => (
              <div key={p.label}>
                <label className="new-exp-label">{p.label}</label>
                <input
                  value={p.val}
                  onChange={e => p.set(e.target.value)}
                  placeholder={p.placeholder}
                  className="new-exp-input mono"
                />
                <p className="new-exp-hint">{p.hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="new-exp-space-y-4">
          <div className="new-exp-grid-2">
            <div>
              <label className="new-exp-label">Experiment Name <span className="new-exp-req">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} className="new-exp-input-lg" />
            </div>
            <div>
              <label className="new-exp-label">Project</label>
              <select value={project} onChange={e => setProject(e.target.value)} className="new-exp-select" style={{ padding: '10px 14px' }}>
                <option value="">(No Project / Standalone)</option>
                {projectsList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="new-exp-label">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="What are you testing?" className="new-exp-textarea" />
          </div>

          <div className="new-exp-summary-card card-shadow">
            <h2 className="new-exp-summary-title">Run Summary</h2>
            <div className="new-exp-summary-grid">
              {[
                { label: 'Dataset', val: `${selectedDataset?.name || 'Dataset'} (${datasetVersion})` },
                { label: 'Model', val: model },
                { label: 'Framework', val: framework },
                { label: 'GPU', val: gpu },
                { label: 'Learning Rate', val: lr },
                { label: 'Batch Size', val: batchSize },
                { label: 'Epochs', val: epochs },
                { label: 'Max Seq Len', val: maxSeqLen },
              ].map(r => (
                <div key={r.label} className="new-exp-summary-row">
                  <span className="new-exp-summary-lbl">{r.label}</span>
                  <span className="new-exp-summary-val">{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="new-exp-footer">
        <button
          onClick={stepIdx === 0 ? onBack : () => {
            if (step === 'model') setStep('dataset');
            else if (step === 'params') setStep('model');
            else if (step === 'review') setStep('params');
          }}
          className="new-exp-back-btn"
        >
          {stepIdx === 0 ? 'Cancel' : 'Back'}
        </button>
        {step !== 'review' ? (
          <button onClick={next} disabled={!canProceed()} className="new-exp-primary-btn">
            Continue
            <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M4.5 3L8.5 6.5L4.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        ) : (
          <button onClick={handleRun} disabled={!name || saving} className="new-exp-run-btn">
            {saving ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="white" strokeWidth="2" strokeDasharray="20" strokeLinecap="round"/></svg>
                Queuing...
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><polygon points="3,2 11,6.5 3,11" fill="white"/></svg>
                Run Experiment
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
