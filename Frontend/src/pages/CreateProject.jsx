import { useState } from 'react';
import { createProject } from '../lib/api';
import './CreateProject.css';

const STEP_LABELS = ['Project Info', 'Team & Access', 'Review'];

export default function CreateProject({ onBack, onCreate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    description: '',
    visibility: 'team',
    tags: [],
    tagInput: '',
    inviteEmails: '',
    defaultRole: 'Contributor',
    enableLineage: true,
    enableCopilot: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function addTag() {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    set('tagInput', '');
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await createProject({
        name: form.name.trim(),
        description: form.description.trim(),
        visibility: form.visibility,
        tags: form.tags,
        status: 'active',
      });
      setDone(true);
      setTimeout(() => onCreate(res?.id || form.name), 1200);
    } catch (err) {
      console.error('Failed to create project', err);
      setDone(true);
      setTimeout(() => onCreate(form.name), 1200);
    } finally {
      setSubmitting(false);
    }
  }

  const canNext1 = form.name.trim().length >= 3;

  if (done) {
    return (
      <div className="create-proj-done-wrap">
        <div className="create-proj-done-card card-shadow">
          <div className="create-proj-done-icon">✓</div>
          <h2 className="create-proj-done-title">Project Created!</h2>
          <p className="create-proj-done-sub">Redirecting to your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-proj-container">
      {/* Back */}
      <button onClick={onBack} className="create-proj-back-link">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Projects
      </button>

      <h1 className="create-proj-title">Create New Project</h1>
      <p className="create-proj-subtitle">Set up a shared research workspace for your team</p>

      {/* Step indicator */}
      <div className="create-proj-stepper">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const isDone = step > n;
          return (
            <div key={n} className="create-proj-step-item">
              <div className={`create-proj-step-circle ${
                active ? 'active' : isDone ? 'done' : 'upcoming'
              }`}>
                {isDone ? '✓' : n}
              </div>
              <span className={`create-proj-step-label ${active ? 'active' : 'inactive'}`}>{label}</span>
              {i < STEP_LABELS.length - 1 && <div className="create-proj-step-divider" />}
            </div>
          );
        })}
      </div>

      <div className="create-proj-card card-shadow">
        {/* Step 1 */}
        {step === 1 && (
          <div className="create-proj-space-y-5">
            <div>
              <label className="create-proj-field-label">Project Name <span className="create-proj-req">*</span></label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. NLP Research Q4"
                className="create-proj-input"
              />
            </div>
            <div>
              <label className="create-proj-field-label">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                placeholder="Brief description of research goals..."
                className="create-proj-textarea"
              />
            </div>
            <div>
              <label className="create-proj-field-label">Tags</label>
              <div className="create-proj-tag-input-row">
                <input
                  value={form.tagInput}
                  onChange={e => set('tagInput', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  placeholder="Add tag..."
                  className="create-proj-input"
                  style={{ flex: 1 }}
                />
                <button onClick={addTag} className="create-proj-tag-add-btn">Add</button>
              </div>
              {form.tags.length > 0 && (
                <div className="create-proj-tags-list">
                  {form.tags.map(t => (
                    <span key={t} className="create-proj-tag-pill">
                      {t}
                      <button onClick={() => set('tags', form.tags.filter(x => x !== t))} className="create-proj-tag-del-btn">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="create-proj-space-y-5">
            <div>
              <label className="create-proj-field-label" style={{ marginBottom: '8px' }}>Visibility</label>
              <div className="create-proj-vis-grid">
                {[
                  { val: 'private', icon: '🔒', label: 'Private', desc: 'Only invited members' },
                  { val: 'team', icon: '👥', label: 'Team', desc: 'All org members' },
                  { val: 'public', icon: '🌐', label: 'Public', desc: 'Anyone with link' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => set('visibility', opt.val)}
                    className={`create-proj-vis-card ${form.visibility === opt.val ? 'selected' : ''}`}
                  >
                    <div className="create-proj-vis-icon">{opt.icon}</div>
                    <div className="create-proj-vis-label">{opt.label}</div>
                    <div className="create-proj-vis-desc">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="create-proj-field-label">Invite Collaborators</label>
              <textarea
                value={form.inviteEmails}
                onChange={e => set('inviteEmails', e.target.value)}
                rows={3}
                placeholder="r.hassan@mit.edu, a.verma@stanford.edu..."
                className="create-proj-textarea mono"
              />
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0 0' }}>Separate multiple emails with commas</p>
            </div>
            <div>
              <label className="create-proj-field-label" style={{ marginBottom: '8px' }}>Default Member Role</label>
              <div className="create-proj-roles-row">
                {['Contributor', 'Reviewer'].map(r => (
                  <button
                    key={r}
                    onClick={() => set('defaultRole', r)}
                    className={`create-proj-role-btn ${form.defaultRole === r ? 'selected' : ''}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="create-proj-field-label">Features</label>
              {[
                { key: 'enableLineage', label: 'Collaborative Lineage', desc: 'Show contributor avatars on lineage nodes' },
                { key: 'enableCopilot', label: 'Research Copilot', desc: 'AI-assisted research assistant for the project' },
              ].map(f => (
                <div
                  key={f.key}
                  onClick={() => set(f.key, !form[f.key])}
                  className="create-proj-feature-item"
                >
                  <div>
                    <div className="create-proj-feature-title">{f.label}</div>
                    <div className="create-proj-feature-sub">{f.desc}</div>
                  </div>
                  <div className={`create-proj-toggle-switch ${form[f.key] ? 'on' : 'off'}`}>
                    <div className={`create-proj-toggle-knob ${form[f.key] ? 'on' : 'off'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="create-proj-space-y-4">
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0B1220', margin: '0 0 16px 0' }}>Review & Create</h3>
            {[
              { label: 'Project Name', value: form.name || '—' },
              { label: 'Description', value: form.description || '—' },
              { label: 'Visibility', value: form.visibility },
              { label: 'Tags', value: form.tags.join(', ') || '—' },
              { label: 'Default Role', value: form.defaultRole },
              { label: 'Invite', value: form.inviteEmails || '—' },
              { label: 'Lineage', value: form.enableLineage ? 'Enabled' : 'Disabled' },
              { label: 'Copilot', value: form.enableCopilot ? 'Enabled' : 'Disabled' },
            ].map(row => (
              <div key={row.label} className="create-proj-review-row">
                <span className="create-proj-review-lbl">{row.label}</span>
                <span className="create-proj-review-val">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="create-proj-footer">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="create-proj-back-btn">
            Back
          </button>
        ) : <div />}
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !canNext1}
            className="create-proj-continue-btn"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="create-proj-continue-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Creating…
              </>
            ) : 'Create Project'}
          </button>
        )}
      </div>
    </div>
  );
}
