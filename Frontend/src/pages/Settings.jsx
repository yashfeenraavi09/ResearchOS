import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchSettings, saveSettings } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import './Settings.css';

// SVG icon components for Settings sidebar — original ResearchOS line-icon style
const SECTION_ICONS = {
  profile: (
    <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
      <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2.5 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  project: (
    <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
      <rect x="1.5" y="4" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8.5" y="1.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8.5" y="9.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6.5 6h1.5M6.5 6c0-1.93 1.57-3.5 2-3.5M6.5 6c0 1.93 1.57 3.5 2 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  team: (
    <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
      <circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1 12.5c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="11" cy="5" r="1.75" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M13.5 12c0-1.66-1.12-3-2.5-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  notifications: (
    <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
      <path d="M7.5 2a4.5 4.5 0 0 1 4.5 4.5c0 3.5 1.5 4.5 1.5 4.5H2s1.5-1 1.5-4.5A4.5 4.5 0 0 1 7.5 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M6.25 11.5a1.25 1.25 0 0 0 2.5 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  privacy: (
    <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
      <rect x="2.5" y="7" width="10" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7.5" cy="10.25" r="1" fill="currentColor"/>
    </svg>
  ),
  tracking: (
    <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7.5 2V1M7.5 14v-1M2 7.5H1M14 7.5h-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
};

const SECTIONS = [
  { id: 'profile',       label: 'Profile',             desc: 'Your personal details and credentials' },
  { id: 'project',       label: 'Project Settings',    desc: 'Workspace storage and default configuration' },
  { id: 'team',          label: 'Team & Permissions',  desc: 'Collaborators and workspace access' },
  { id: 'notifications', label: 'Notifications',       desc: 'Activity alerts and message digests' },
  { id: 'privacy',       label: 'Privacy',             desc: 'Data handling, retention, and visibility' },
  { id: 'tracking',      label: 'Tracking Preferences',desc: 'Python SDK keys, telemetry, and session logs' },
];

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`settings-toggle ${on ? 'on' : 'off'}`}
      aria-pressed={on}
    >
      <span className="settings-toggle-knob" />
    </button>
  );
}

function Row({ label, desc, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row-info">
        <div className="settings-row-label">{label}</div>
        {desc && <div className="settings-row-desc">{desc}</div>}
      </div>
      <div className="settings-row-action">{children}</div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="settings-card">
      <div className="settings-card-header">
        <h3 className="settings-card-title">{title}</h3>
      </div>
      <div className="settings-card-body">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { user, session } = useAuth();
  const [section, setSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [pwdStatus, setPwdStatus] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Contributor');
  const [inviteMsg, setInviteMsg] = useState('');

  // Live backend data
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    affiliation: '',
    bio: '',
    initials: 'U',
    created_at: null,
  });

  const [storage, setStorage] = useState({
    used_bytes: 0,
    used_str: '0 B',
    limit_str: '50 GB',
    pct: 0,
    datasets_count: 0,
    versions_count: 0,
  });

  const [projectsSummary, setProjectsSummary] = useState({
    total: 0,
    active: 0,
  });

  const [team, setTeam] = useState([]);

  const [notifs, setNotifs] = useState({
    experimentComplete: true,
    datasetUpload: true,
    teamInvite: true,
    weeklyDigest: true,
    lineageUpdate: false,
    errorAlert: true,
    slackWebhook: false,
    emailDigest: true,
    slackWebhookUrl: '',
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    shareUsage: true,
    allowAnalytics: true,
    dataRetention: '90d',
    defaultVisibility: 'team',
  });

  const [track, setTrack] = useState({
    autoTrack: true,
    trackDatasets: true,
    trackModels: true,
    trackMetadata: true,
    trackPreprocessing: false,
    retentionDays: '30',
    anonymizeIds: false,
  });

  // Fetch real-time settings from backend
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const data = await fetchSettings();
      if (!mounted || !data) return;

      if (data.profile) {
        setProfile(p => ({
          ...p,
          name: data.profile.name || p.name,
          email: data.profile.email || p.email,
          affiliation: data.profile.affiliation ?? p.affiliation,
          bio: data.profile.bio ?? p.bio,
          initials: data.profile.initials || p.initials,
          created_at: data.profile.created_at,
        }));
      }

      if (data.storage) {
        setStorage(data.storage);
      }

      if (data.projects_summary) {
        setProjectsSummary(data.projects_summary);
      }

      if (data.team && Array.isArray(data.team)) {
        setTeam(data.team);
      }

      if (data.notifications) {
        setNotifs(n => ({ ...n, ...data.notifications }));
      }

      if (data.privacy) {
        setPrivacy(pr => ({ ...pr, ...data.privacy }));
      }

      if (data.tracking) {
        setTrack(t => ({ ...t, ...data.tracking }));
      }
    };

    loadData();

    // Live background polling every 5s so metrics like storage and projects update automatically
    const interval = setInterval(loadData, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user]);

  // Save changes to backend
  async function handleSave() {
    setSaving(true);
    try {
      const res = await saveSettings({
        profile: {
          name: profile.name,
          affiliation: profile.affiliation,
          bio: profile.bio,
        },
        notifications: notifs,
        privacy,
        tracking: track,
      });

      if (res) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('[Settings] Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  }

  // Password reset via Supabase Auth
  async function handlePasswordReset() {
    if (!profile.email) return;
    setPwdStatus('Sending reset link...');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) {
        setPwdStatus(`Error: ${error.message}`);
      } else {
        setPwdStatus('Password reset email sent successfully!');
      }
    } catch (err) {
      setPwdStatus(`Error: ${err.message}`);
    }
    setTimeout(() => setPwdStatus(''), 4500);
  }

  // Invite member
  function handleInviteSubmit(e) {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteMsg('Please enter a valid collaborator email address.');
      setTimeout(() => setInviteMsg(''), 3000);
      return;
    }

    const newMember = {
      id: `invited-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      color: '#8B5CF6',
      initials: inviteEmail.slice(0, 2).toUpperCase(),
      active: false,
      is_self: false,
      pending: true,
    };

    setTeam(prev => [...prev, newMember]);
    setInviteMsg(`Invitation sent to ${inviteEmail} as ${inviteRole}!`);
    setInviteEmail('');
    setTimeout(() => setInviteMsg(''), 4000);
  }

  const setN = (k, v) => setNotifs(n => ({ ...n, [k]: v }));
  const setP = (k, v) => setPrivacy(p => ({ ...p, [k]: v }));
  const setT = (k, v) => setTrack(t => ({ ...t, [k]: v }));

  const activeSection = SECTIONS.find(s => s.id === section);

  // Format account member since date
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' })
    : 'Active member';

  return (
    <div className="settings-container">
      {/* Sidebar nav */}
      <div className="settings-nav">
        <p className="settings-nav-title">Settings</p>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`settings-nav-btn ${section === s.id ? 'active' : ''}`}
          >
            <span className="settings-nav-icon">{SECTION_ICONS[s.id]}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="settings-content">
        <div className="settings-content-inner">
          {/* Title */}
          <div className="settings-header">
            <h1 className="settings-title">{activeSection?.label}</h1>
            <p className="settings-desc">{activeSection?.desc}</p>
          </div>

          {/* ── Profile ── */}
          {section === 'profile' && (
            <>
              <SectionCard title="Personal Information">
                <div className="settings-avatar-row">
                  <div className="settings-avatar-circle gradient-teal">{profile.initials || 'U'}</div>
                  <div>
                    <p className="settings-avatar-label">{profile.name || 'Your Profile'}</p>
                    <p className="settings-avatar-desc">{profile.email} · {memberSince}</p>
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Full Name</label>
                  <input
                    value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="settings-input"
                    placeholder="Your name"
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Email Address (Supabase Account)</label>
                  <input
                    value={profile.email}
                    disabled
                    readOnly
                    className="settings-input"
                    style={{ background: '#F8FAFC', color: '#64748B', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Affiliation / Institution</label>
                  <input
                    value={profile.affiliation}
                    onChange={e => setProfile(p => ({ ...p, affiliation: e.target.value }))}
                    className="settings-input"
                    placeholder="University or Lab Name"
                  />
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Research Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="settings-textarea"
                    placeholder="Describe your research focus or group..."
                  />
                </div>
              </SectionCard>

              <SectionCard title="Account Security">
                <Row
                  label="Password"
                  desc={pwdStatus || "Send a secure password reset link to your registered email"}
                >
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="settings-btn-secondary"
                  >
                    Reset Password
                  </button>
                </Row>
                <Row label="Account Created" desc={memberSince}>
                  <span style={{ fontSize: '12px', color: '#0F9D8A', fontWeight: 600 }}>Active</span>
                </Row>
              </SectionCard>
            </>
          )}

          {/* ── Project Settings ── */}
          {section === 'project' && (
            <>
              <SectionCard title="Workspace Defaults">
                <Row label="Default Project Visibility" desc="Applied when creating new research projects">
                  <select
                    value={privacy.defaultVisibility}
                    onChange={e => setP('defaultVisibility', e.target.value)}
                    className="settings-select"
                  >
                    <option value="team">Team (Invited collaborators)</option>
                    <option value="private">Private (Only you)</option>
                    <option value="public">Public (Open research)</option>
                  </select>
                </Row>
                <Row label="Total Projects in Workspace" desc={`${projectsSummary.total} projects (${projectsSummary.active} active)`}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                    {projectsSummary.total}
                  </span>
                </Row>
                <Row label="Enable Collaborative Lineage" desc="Show contributor avatars on provenance nodes">
                  <Toggle on={true} onChange={() => {}} />
                </Row>
                <Row label="Enable Research Copilot" desc="AI assistant for research questions and analysis">
                  <Toggle on={true} onChange={() => {}} />
                </Row>
              </SectionCard>

              <SectionCard title="Storage & Quota (Live)">
                <Row
                  label="Storage Used"
                  desc={`Total: ${storage.used_str} of ${storage.limit_str} quota used across ${storage.datasets_count || 0} datasets (${storage.versions_count || 0} versions)`}
                >
                  <div className="settings-storage-bar-wrap">
                    <div className="settings-storage-bar-track">
                      <div
                        className="settings-storage-bar-fill"
                        style={{ width: `${Math.max(2, storage.pct)}%` }}
                      />
                    </div>
                    <p className="settings-storage-pct">{storage.pct}%</p>
                  </div>
                </Row>
                <Row label="Primary Storage Engine" desc="Local MinIO with Supabase Cloud Storage automatic fallback">
                  <span style={{ fontSize: '12px', color: '#0F9D8A', fontWeight: 600 }}>Connected</span>
                </Row>
                <Row label="Session Log Retention" desc="Duration to retain inactive Python SDK logs">
                  <select
                    value={track.retentionDays}
                    onChange={e => setT('retentionDays', e.target.value)}
                    className="settings-select"
                  >
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </Row>
              </SectionCard>
            </>
          )}

          {/* ── Team & Permissions ── */}
          {section === 'team' && (
            <>
              <SectionCard title="Active Collaborators">
                <div className="settings-team-list">
                  {team.map(m => (
                    <div key={m.id} className="settings-team-item">
                      <div
                        className="settings-team-avatar"
                        style={{ backgroundColor: m.color || '#0D9488' }}
                      >
                        {m.initials || 'U'}
                      </div>
                      <div className="settings-team-info">
                        <div className="settings-team-name-row">
                          <span className="settings-team-name">{m.name}</span>
                          {m.is_self && <span style={{ fontSize: '11px', background: '#E6F4EA', color: '#137333', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>You</span>}
                          {m.pending && <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>Invited</span>}
                          {m.active && <span className="settings-team-active-dot" title="Active" />}
                        </div>
                        <p className="settings-team-email">{m.email}</p>
                      </div>
                      <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Invite Collaborator">
                <form onSubmit={handleInviteSubmit} className="settings-invite-row">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="collaborator@university.edu"
                    className="settings-input settings-input-mono"
                    style={{ flex: 1 }}
                  />
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="settings-select settings-select-sm"
                  >
                    <option value="Contributor">Contributor</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Project Admin">Project Admin</option>
                  </select>
                  <button type="submit" className="settings-btn-primary">Invite</button>
                </form>
                {inviteMsg && (
                  <p style={{ fontSize: '12px', color: '#0F9D8A', marginTop: '8px', fontWeight: 500 }}>
                    {inviteMsg}
                  </p>
                )}
              </SectionCard>

              <SectionCard title="Role Permissions">
                <Row label="Contributors can create experiments" desc="Log runs and record models without admin approval">
                  <Toggle on={true} onChange={() => {}} />
                </Row>
                <Row label="Reviewers can download datasets" desc="Access raw dataset files and versions">
                  <Toggle on={false} onChange={() => {}} />
                </Row>
              </SectionCard>
            </>
          )}

          {/* ── Notifications ── */}
          {section === 'notifications' && (
            <>
              <SectionCard title="Activity Alerts">
                <Row label="Experiment completed" desc="Trigger notification when any ML training run finishes">
                  <Toggle on={notifs.experimentComplete} onChange={v => setN('experimentComplete', v)} />
                </Row>
                <Row label="Dataset uploaded" desc="When a new dataset version or drift analysis is computed">
                  <Toggle on={notifs.datasetUpload} onChange={v => setN('datasetUpload', v)} />
                </Row>
                <Row label="Team member invited" desc="When a new collaborator joins your workspace">
                  <Toggle on={notifs.teamInvite} onChange={v => setN('teamInvite', v)} />
                </Row>
                <Row label="Lineage graph update" desc="When new nodes or edges are linked in real time">
                  <Toggle on={notifs.lineageUpdate} onChange={v => setN('lineageUpdate', v)} />
                </Row>
                <Row label="Error or failure alert" desc="Experiment failures and drift threshold alerts">
                  <Toggle on={notifs.errorAlert} onChange={v => setN('errorAlert', v)} />
                </Row>
              </SectionCard>

              <SectionCard title="Delivery Channels">
                <Row label="Weekly digest email" desc="Comprehensive summary of experiments, datasets, and best models">
                  <Toggle on={notifs.weeklyDigest} onChange={v => setN('weeklyDigest', v)} />
                </Row>
                <Row label="In-app email notifications" desc="Mirror critical alerts directly to your inbox">
                  <Toggle on={notifs.emailDigest} onChange={v => setN('emailDigest', v)} />
                </Row>
                <Row label="Slack webhook" desc="Post real-time event updates to a Slack channel">
                  <Toggle on={notifs.slackWebhook} onChange={v => setN('slackWebhook', v)} />
                </Row>
                {notifs.slackWebhook && (
                  <div className="settings-form-group" style={{ borderTop: '1px solid #F1F5F9', borderBottom: 'none', paddingTop: '12px' }}>
                    <label className="settings-label">Slack Webhook URL</label>
                    <input
                      value={notifs.slackWebhookUrl || ''}
                      onChange={e => setN('slackWebhookUrl', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="settings-input settings-input-mono"
                    />
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {/* ── Privacy ── */}
          {section === 'privacy' && (
            <>
              <SectionCard title="Visibility & Discovery">
                <Row label="Public researcher profile" desc="Allow your name and affiliation to appear in shared workspaces">
                  <Toggle on={privacy.profilePublic} onChange={v => setP('profilePublic', v)} />
                </Row>
                <Row label="Default project visibility" desc="Default setting applied when creating new projects">
                  <select
                    value={privacy.defaultVisibility}
                    onChange={e => setP('defaultVisibility', e.target.value)}
                    className="settings-select settings-select-sm"
                  >
                    <option value="private">Private</option>
                    <option value="team">Team</option>
                    <option value="public">Public</option>
                  </select>
                </Row>
              </SectionCard>

              <SectionCard title="Data Protection & Telemetry">
                <Row label="Share anonymous diagnostic telemetry" desc="Helps improve PCA drift calculations and performance">
                  <Toggle on={privacy.shareUsage} onChange={v => setP('shareUsage', v)} />
                </Row>
                <Row label="Allow product analytics" desc="Page views and feature usage patterns">
                  <Toggle on={privacy.allowAnalytics} onChange={v => setP('allowAnalytics', v)} />
                </Row>
                <Row label="Session data retention" desc="How long to keep detailed activity logs">
                  <select
                    value={privacy.dataRetention}
                    onChange={e => setP('dataRetention', e.target.value)}
                    className="settings-select settings-select-sm"
                  >
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                    <option value="1y">1 year</option>
                    <option value="forever">Forever</option>
                  </select>
                </Row>
              </SectionCard>

              <div className="settings-callout settings-callout-warning">
                <span className="settings-callout-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.35"/>
                    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
                  </svg>
                </span>
                <p className="settings-callout-text">
                  <strong>Dataset files are never uploaded without your consent.</strong> ResearchOS tracks metadata, schema, and SHA-256 fingerprints locally unless you explicitly upload raw files or confirm sync on the Tracking SDK page.
                </p>
              </div>
            </>
          )}

          {/* ── Tracking Preferences ── */}
          {section === 'tracking' && (
            <>
              <SectionCard title="Python SDK Authentication & Setup">
                <div style={{ padding: '6px 0 14px' }}>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px 0' }}>
                    Your personal SDK access token connects Python sessions (VS Code, Jupyter, Google Colab, or CLI) directly to your ResearchOS account. All tracked datasets and experiments are automatically linked to your user dashboard.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="password"
                      readOnly
                      value={session?.access_token || 'Please sign in to view SDK token'}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: '#334155',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (session?.access_token) {
                          navigator.clipboard.writeText(session.access_token);
                          setTokenCopied(true);
                          setTimeout(() => setTokenCopied(false), 3000);
                        }
                      }}
                      className="settings-btn-primary"
                      style={{ padding: '9px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      {tokenCopied ? '✓ Copied!' : 'Copy SDK Token'}
                    </button>
                  </div>

                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginTop: '16px', marginBottom: '8px' }}>
                    Run tracking in your Python notebook or script:
                  </p>
                  <pre style={{
                    background: '#0B1220',
                    color: '#E2E8F0',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
{`from Backend.tracking_plugin.sdk import tracker

# 1. Start tracker with your personal token
tracker.start(project_id="My Research", token="${session?.access_token ? session.access_token.slice(0, 16) + '...' : 'YOUR_TOKEN'}")

# 2. Your regular data science code runs as normal
import pandas as pd
df = pd.read_csv("my_research_data.csv")

from sklearn.ensemble import RandomForestClassifier
clf = RandomForestClassifier(n_estimators=50).fit(X, y)

# 3. Synchronize with your live ResearchOS dashboard!
tracker.sync()`}
                  </pre>
                </div>
              </SectionCard>

              <SectionCard title="Telemetry & Auto-Capture">
                <Row label="Enable auto-tracking" desc="Automatically intercept pandas reads and sklearn fits">
                  <Toggle on={track.autoTrack} onChange={v => setT('autoTrack', v)} />
                </Row>
                <Row label="Track dataset loading" desc="Log file paths, version SHA-256 hashes, and row counts">
                  <Toggle on={track.trackDatasets} onChange={v => setT('trackDatasets', v)} />
                </Row>
                <Row label="Track model training" desc="Log hyperparameters, estimator parameters, and evaluation metrics">
                  <Toggle on={track.trackModels} onChange={v => setT('trackModels', v)} />
                </Row>
                <Row label="Track experiment metadata" desc="Run IDs, timestamps, and environment details">
                  <Toggle on={track.trackMetadata} onChange={v => setT('trackMetadata', v)} />
                </Row>
                <Row label="Track preprocessing steps" desc="Column transformers, standard scalers, and encoders">
                  <Toggle on={track.trackPreprocessing} onChange={v => setT('trackPreprocessing', v)} />
                </Row>
              </SectionCard>

              <SectionCard title="Session Logging">
                <Row label="Session retention" desc="Duration to retain inactive tracking session history">
                  <select
                    value={track.retentionDays}
                    onChange={e => setT('retentionDays', e.target.value)}
                    className="settings-select settings-select-sm"
                  >
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </Row>
                <Row label="Anonymize experiment identifiers" desc="Replace experiment IDs with cryptographic hashes in exports">
                  <Toggle on={track.anonymizeIds} onChange={v => setT('anonymizeIds', v)} />
                </Row>
              </SectionCard>
            </>
          )}

          {/* Save button */}
          <div className="settings-actions-bar">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="settings-btn-primary"
              style={{ padding: '10px 22px' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="settings-saved-indicator">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M2 7L5.5 10.5L12 3" stroke="#0F9D8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Saved to Account
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
