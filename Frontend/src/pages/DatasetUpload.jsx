import { useState, useRef } from 'react';
import { createDataset, uploadDatasetFile } from '../lib/api';
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
  const [rawFile, setRawFile] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('Tabular');
  const [versionNote, setVersionNote] = useState('Initial upload');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef(null);

  function handleFileDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }

  function handleFileSelect(e) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }

  function processFile(f) {
    setRawFile(f);
    const sizeStr = f.size > 1_000_000 ? `${(f.size / 1_000_000).toFixed(1)} MB` : `${(f.size / 1_000).toFixed(0)} KB`;
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
    
    // Auto-select type based on extension
    let detectedType = 'Tabular';
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp', '.tiff'].includes(ext)) {
      detectedType = 'Vision';
    } else if (['.txt', '.log', '.md', '.corpus', '.rtf', '.jsonl'].includes(ext)) {
      detectedType = 'NLP';
    } else if (['.graphml', '.gml', '.edges'].includes(ext)) {
      detectedType = 'Graph';
    }
    setType(detectedType);

    // Initial file state
    setFile({
      name: f.name,
      size: sizeStr,
      rows: null,
      cols: null,
      format: ext.replace('.', '').toUpperCase() || 'FILE',
    });
    setName(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

    // 1. Image Files (Vision datasets)
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp'].includes(ext) || f.type.startsWith('image/')) {
      try {
        const img = new Image();
        const objUrl = URL.createObjectURL(f);
        img.onload = () => {
          setFile(prev => prev ? ({
            ...prev,
            rows: `${img.naturalHeight.toLocaleString()} px (Height)`,
            cols: `${img.naturalWidth.toLocaleString()} px (Width)`,
          }) : null);
          URL.revokeObjectURL(objUrl);
        };
        img.onerror = () => URL.revokeObjectURL(objUrl);
        img.src = objUrl;
        return;
      } catch (err) {
        console.warn('Image dimensions extraction error', err);
      }
    }

    // 2. CSV / TSV / PSV Tabular files
    if (['.csv', '.tsv', '.tab', '.psv'].includes(ext) || f.type.includes('csv')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target?.result;
          if (typeof content === 'string') {
            const lines = content.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
            if (lines.length > 0) {
              const rowCount = Math.max(0, lines.length - 1); // exclude header row
              let delimiter = ',';
              if (ext === '.tsv' || ext === '.tab') delimiter = '\t';
              else if (ext === '.psv') delimiter = '|';
              else if (lines[0].includes(';') && !lines[0].includes(',')) delimiter = ';';
              
              const colCount = lines[0].split(delimiter).length;
              setFile(prev => prev ? ({
                ...prev,
                rows: rowCount,
                cols: colCount,
              }) : null);
            }
          }
        } catch (err) {
          console.warn('Could not inspect CSV client-side', err);
        }
      };
      reader.readAsText(f.slice(0, 2 * 1024 * 1024));
      return;
    }

    // 3. JSON / JSONL / NDJSON
    if (['.json', '.jsonl', '.ndjson'].includes(ext) || f.type.includes('json')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target?.result;
          if (typeof content === 'string') {
            if (ext === '.jsonl' || ext === '.ndjson') {
              const lines = content.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
              setFile(prev => prev ? ({ ...prev, rows: lines.length, cols: 'Dynamic JSON' }) : null);
            } else {
              const data = JSON.parse(content);
              if (Array.isArray(data)) {
                setFile(prev => prev ? ({
                  ...prev,
                  rows: data.length,
                  cols: data[0] && typeof data[0] === 'object' ? Object.keys(data[0]).length : 1,
                }) : null);
              } else if (typeof data === 'object' && data !== null) {
                setFile(prev => prev ? ({
                  ...prev,
                  rows: Object.keys(data).length,
                  cols: 'Key-Value Map',
                }) : null);
              }
            }
          }
        } catch (err) {
          console.warn('Could not parse JSON client-side', err);
        }
      };
      reader.readAsText(f.slice(0, 2 * 1024 * 1024));
      return;
    }

    // 4. Plain Text / NLP Corpora
    if (['.txt', '.log', '.md', '.corpus', '.rtf'].includes(ext) || f.type.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target?.result;
          if (typeof content === 'string') {
            const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
            setFile(prev => prev ? ({
              ...prev,
              rows: `${lines.length.toLocaleString()} lines / documents`,
              cols: '1 (Text Column)',
            }) : null);
          }
        } catch (_) {}
      };
      reader.readAsText(f.slice(0, 2 * 1024 * 1024));
      return;
    }

    // 5. Parquet / Arrow Columnar Data
    if (['.parquet', '.pq', '.arrow'].includes(ext)) {
      setFile(prev => prev ? ({
        ...prev,
        rows: 'Columnar Parquet Records',
        cols: 'Schema-indexed',
      }) : null);
      return;
    }

    // 6. Excel Spreadsheets
    if (['.xlsx', '.xls', '.xlsm'].includes(ext)) {
      setFile(prev => prev ? ({
        ...prev,
        rows: 'Worksheet Data Rows',
        cols: 'Multi-column Table',
      }) : null);
      return;
    }

    // 7. NumPy Tensors
    if (['.npy', '.npz'].includes(ext)) {
      setFile(prev => prev ? ({
        ...prev,
        rows: 'Tensor Sample Dimension',
        cols: 'Array Features',
      }) : null);
      return;
    }

    // 8. Archives & Binary Model Weights (.zip, .tar.gz, .pt, .onnx, .h5)
    setFile(prev => prev ? ({
      ...prev,
      rows: 'Binary Package Asset',
      cols: 'Raw Byte Stream',
    }) : null);
  }

  async function handleSave() {
    setSaving(true);
    setErrorMsg('');
    try {
      if (rawFile) {
        // Send multipart form-data to backend
        const formData = new FormData();
        formData.append('file', rawFile);
        formData.append('name', name.trim());
        formData.append('description', desc.trim());
        formData.append('dataset_type', type);
        formData.append('version_label', 'V1');
        formData.append('version_note', versionNote.trim());

        await uploadDatasetFile(formData);
      } else {
        await createDataset({
          name: name.trim(),
          description: desc.trim(),
          type,
          size_str: file?.size || '1.0 MB',
          tags: [type],
        });
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to upload/create dataset', err);
      setErrorMsg(err.message || 'Failed to upload dataset.');
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
                <p className="dataset-upload-file-meta">
                  {file.size}
                  {file.rows != null ? ` · ${typeof file.rows === 'number' ? `${file.rows.toLocaleString()} rows` : file.rows}` : ''}
                  {file.cols != null ? ` · ${typeof file.cols === 'number' ? `${file.cols} columns detected` : file.cols}` : ' · Inspecting format...'}
                </p>
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
                { 
                  label: 'Detected Rows', 
                  val: file.rows != null 
                    ? (typeof file.rows === 'number'
                        ? (file.rows >= 1000 ? `~${(file.rows / 1000).toFixed(1)}K (${file.rows.toLocaleString()} rows)` : `${file.rows.toLocaleString()} rows`)
                        : String(file.rows))
                    : 'Profiled upon save' 
                },
                { 
                  label: 'Detected Columns', 
                  val: file.cols != null 
                    ? (typeof file.cols === 'number' ? `${file.cols} columns` : String(file.cols))
                    : 'Profiled upon save' 
                },
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

          {errorMsg && (
            <div className="dataset-upload-error-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="dataset-upload-error-text">
                <strong>Upload Failed:</strong> {errorMsg}
              </div>
            </div>
          )}

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
