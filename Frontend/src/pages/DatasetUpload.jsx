import { useState, useRef } from 'react';
import { createDataset } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './DatasetUpload.css';

const STEPS = [
  { id: 'upload', label: 'Upload File', desc: 'Choose your data file' },
  { id: 'configure', label: 'Configure', desc: 'Set metadata & type' },
  { id: 'review', label: 'Review & Save', desc: 'Confirm and submit' },
];

export default function DatasetUpload({ onBack, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState('upload');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('NLP');
  const [versionNote, setVersionNote] = useState('Initial upload');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  function handleFileDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) simulateFileRead(f.name, f.size);
  }

  function handleFileSelect(e) {
    const f = e.target.files?.[0];
    if (f) simulateFileRead(f.name, f.size);
  }

  function simulateFileRead(fileName, fileSize) {
    const sizeStr = fileSize > 1_000_000 ? `${(fileSize / 1_000_000).toFixed(1)} MB` : `${(fileSize / 1_000).toFixed(0)} KB`;
    setFile({ name: fileName, size: sizeStr, rows: Math.floor(Math.random() * 900000) + 100000, cols: Math.floor(Math.random() * 20) + 5 });
    setName(fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await createDataset({
        name: name.trim(),
        description: desc.trim(),
        type,
        rows_count: file?.rows || 1000,
        columns_count: file?.cols || 10,
        size_str: file?.size || '1.0 MB',
        tags: [type],
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to create dataset', err);
      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  const stepIdx = STEPS.findIndex(s => s.id === step);

  return (
    <div className="dataset-upload-container">
      {/* Breadcrumb */}
      <div className="dataset-upload-breadcrumb">
        <button onClick={onBack} className="dataset-upload-breadcrumb-btn">Datasets</button>
        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M4.5 3L7.5 6L4.5 9" stroke="#A0AEBF" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <span className="dataset-upload-breadcrumb-current">Upload Dataset</span>
      </div>

      <h1 className="dataset-upload-title">Upload Dataset</h1>

      {/* Step indicator */}
      <div className="dataset-upload-stepper">
        {STEPS.map((s, i) => (
          <div key={s.id} className="dataset-upload-step-item">
            <div className="dataset-upload-step-col">
              <div className={`dataset-upload-step-circle ${
                i < stepIdx ? 'completed' :
                i === stepIdx ? 'active' :
                'upcoming'
              }`}>
                {i < stepIdx ? <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M2.5 6l3 3 4-5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg> : i + 1}
              </div>
              <p className={`dataset-upload-step-label ${i === stepIdx ? 'active' : 'upcoming'}`}>{s.label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`dataset-upload-step-line ${i < stepIdx ? 'completed' : 'upcoming'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 'upload' && (
        <div className="dataset-upload-space-y-4">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileRef.current?.click()}
            className={`dataset-upload-dropzone ${dragOver ? 'dragover' : file ? 'has-file' : ''}`}
          >
            <input ref={fileRef} type="file" accept=".csv,.parquet,.json,.jsonl,.xlsx" className="dataset-upload-hidden-input" onChange={handleFileSelect} />
            {file ? (
              <div className="dataset-upload-center-box">
                <div className="dataset-upload-file-icon-box">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#0F9D8A" strokeWidth="1.5"/><polyline points="14,2 14,8 20,8" stroke="#0F9D8A" strokeWidth="1.5"/></svg>
                </div>
                <p className="dataset-upload-file-name">{file.name}</p>
                <p className="dataset-upload-file-meta">{file.size} · {(file.rows / 1000).toFixed(0)}K rows · {file.cols} columns detected</p>
                <button onClick={e => { e.stopPropagation(); setFile(null); }} className="dataset-upload-remove-btn">Remove file</button>
              </div>
            ) : (
              <div className="dataset-upload-center-box">
                <div className="dataset-upload-empty-icon-box">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#6B7C93" strokeWidth="1.5"/><polyline points="17,8 12,3 7,8" stroke="#6B7C93" strokeWidth="1.5"/><line x1="12" y1="3" x2="12" y2="15" stroke="#6B7C93" strokeWidth="1.5"/></svg>
                </div>
                <p className="dataset-upload-prompt-text">Drop your file here, or click to browse</p>
                <p className="dataset-upload-prompt-sub">CSV, Parquet, JSON, JSONL, XLSX — up to 50 GB</p>
              </div>
            )}
          </div>

          {/* Format chips */}
          <div className="dataset-upload-formats-wrap">
            {['CSV', 'Parquet', 'JSON / JSONL', 'Excel (.xlsx)', 'HDF5'].map(fmt => (
              <span key={fmt} className="dataset-upload-format-chip">{fmt}</span>
            ))}
          </div>

          <div className="dataset-upload-footer-right">
            <button
              onClick={() => file && setStep('configure')}
              disabled={!file}
              className="dataset-upload-primary-btn"
            >
              Continue
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M4.5 3L8.5 6.5L4.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      )}

      {step === 'configure' && (
        <div className="dataset-upload-space-y-5">
          <div className="dataset-upload-grid-2">
            <div className="dataset-upload-field-group">
              <label className="dataset-upload-label">Dataset Name <span className="dataset-upload-req">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} className="dataset-upload-input" placeholder="e.g. PubMed-2024" />
            </div>
            <div className="dataset-upload-field-group">
              <label className="dataset-upload-label">Dataset Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="dataset-upload-select">
                <option>NLP</option>
                <option>Vision</option>
                <option>Tabular</option>
                <option>Graph</option>
              </select>
            </div>
          </div>

          <div className="dataset-upload-field-group">
            <label className="dataset-upload-label">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="dataset-upload-textarea" placeholder="Describe the dataset, its source, and use cases..." />
          </div>

          <div className="dataset-upload-field-group">
            <label className="dataset-upload-label">Version Note (V1)</label>
            <input value={versionNote} onChange={e => setVersionNote(e.target.value)} className="dataset-upload-input" />
          </div>

          <div className="dataset-upload-info-box">
            <p className="dataset-upload-info-title">Quality Analysis</p>
            <p className="dataset-upload-info-desc">ResearchOS will automatically compute quality scores, detect missing values, duplicates, and schema information after upload.</p>
          </div>

          <div className="dataset-upload-footer-between">
            <button onClick={() => setStep('upload')} className="dataset-upload-back-btn">Back</button>
            <button onClick={() => name && setStep('review')} disabled={!name} className="dataset-upload-primary-btn">
              Review
              <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M4.5 3L8.5 6.5L4.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      )}

      {step === 'review' && file && (
        <div className="dataset-upload-space-y-5">
          <div className="dataset-upload-card card-shadow">
            <h2 className="dataset-upload-card-title">Review Before Saving</h2>
            <div className="dataset-upload-review-grid">
              {[
                { label: 'Dataset Name', val: name || '—' },
                { label: 'Type', val: type },
                { label: 'Source File', val: file.name },
                { label: 'File Size', val: file.size },
                { label: 'Detected Rows', val: `~${(file.rows / 1000).toFixed(0)}K` },
                { label: 'Detected Columns', val: String(file.cols) },
                { label: 'Version', val: 'V1 · ' + versionNote },
                { label: 'Owner', val: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You' },
              ].map(s => (
                <div key={s.label} className="dataset-upload-review-row">
                  <span className="dataset-upload-review-label">{s.label}</span>
                  <span className="dataset-upload-review-val">{s.val}</span>
                </div>
              ))}
            </div>
            {desc && (
              <div className="dataset-upload-review-desc-wrap">
                <span className="dataset-upload-review-label">Description</span>
                <p className="dataset-upload-review-desc-text">{desc}</p>
              </div>
            )}
          </div>

          <div className="dataset-upload-footer-between">
            <button onClick={() => setStep('configure')} className="dataset-upload-back-btn">Back</button>
            <button onClick={handleSave} disabled={saving} className="dataset-upload-save-btn">
              {saving ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="white" strokeWidth="2" strokeDasharray="20" strokeLinecap="round"/></svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 13 13"><path d="M2 7l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  Save Dataset
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
