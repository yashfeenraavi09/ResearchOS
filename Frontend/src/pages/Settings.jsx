import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  { id: 'profile',       label: 'Profile',             desc: 'Your personal details and preferences' },
  { id: 'project',       label: 'Project Settings',    desc: 'Default project configuration' },
  { id: 'team',          label: 'Team & Permissions',  desc: 'Members, roles, and access control' },
  { id: 'notifications', label: 'Notifications',       desc: 'Email, in-app, and webhook alerts' },
  { id: 'privacy',       label: 'Privacy',             desc: 'Data handling and visibility settings' },
  { id: 'tracking',      label: 'Tracking Preferences',desc: 'SDK behavior and session logging' },
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
  const { user } = useAuth();
  const [section, setSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  // Derive real values from Supabase user
  const meta = user?.user_metadata ?? {};
  const realName = meta.full_name || meta.name || user?.email?.split('@')[0] || 'Researcher';
  const realEmail = user?.email || '';
  const realOrg = meta.org || meta.organization || '';

  // Compute initials for avatar
  const initials = realName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  // Profile state — seeded from real user on mount
  const [profile, setProfile] = useState({
    name: realName,
    email: realEmail,
    affiliation: realOrg,
    bio: meta.bio || '',
  });

  // Notification toggles
  const [notifs, setNotifs] = useState({
    experimentComplete: true,
    datasetUpload: true,
    teamInvite: true,
    weeklyDigest: true,
    lineageUpdate: false,
    errorAlert: true,
    slackWebhook: false,
    emailDigest: true,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    shareUsage: true,
    allowAnalytics: true,
    dataRetention: '90d',
    defaultVisibility: 'team',
  });

  // Tracking prefs
  const [track, setTrack] = useState({
    autoTrack: true,
    trackDatasets: true,
    trackModels: true,
    trackMetadata: true,
    trackPreprocessing: false,
    retentionDays: '30',
    anonymizeIds: false,
  });

  // Team members
  const TEAM = [
    { id: 'alex',   name: 'Alex Chen',     email: 'a.chen@mit.edu',         role: 'Project Admin', color: '#22C7D6', initials: 'AC', active: true },
    { id: 'rifa',   name: 'Rifa Hassan',   email: 'r.hassan@mit.edu',       role: 'Contributor',   color: '#8B5CF6', initials: 'RH', active: true },
    { id: 'aman',   name: 'Aman Verma',    email: 'a.verma@stanford.edu',   role: 'Contributor',   color: '#0F9D8A', initials: 'AV', active: true },
    { id: 'sara',   name: 'Sara Okonkwo',  email: 's.okonkwo@cambridge.ac.uk', role: 'Contributor', color: '#F59E0B', initials: 'SO', active: false },
    { id: 'prof',   name: 'Prof. David Lin', email: 'd.lin@mit.edu',        role: 'Reviewer',      color: '#3B82F6', initials: 'DL', active: true },
  ];

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const setN = (k, v) => setNotifs(n => ({ ...n, [k]: v }));
  const setP = (k, v) => setPrivacy(p => ({ ...p, [k]: v }));
  const setT = (k, v) => setTrack(t => ({ ...t, [k]: v }));

  const activeSection = SECTIONS.find(s => s.id === section);

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
                  <div className="settings-avatar-circle gradient-teal">{initials || '?'}</div>
                  <div>
                    <p className="settings-avatar-label">Profile photo</p>
                    <p className="settings-avatar-desc">Used across ResearchOS and shared workspaces</p>
                  </div>
                  <button type="button" className="settings-btn-secondary settings-avatar-btn">Change</button>
                </div>
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'Your name' },
                  { key: 'email', label: 'Email', placeholder: 'your@email.edu' },
                  { key: 'affiliation', label: 'Affiliation', placeholder: 'Institution or organization' },
                ].map(f => (
                  <div key={f.key} className="settings-form-group">
                    <label className="settings-label">{f.label}</label>
                    <input
                      value={profile[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      className="settings-input"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div className="settings-form-group">
                  <label className="settings-label">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="settings-textarea"
                  />
                </div>
              </SectionCard>
              <SectionCard title="Account">
                <Row label="Change Password" desc="Last changed 3 months ago">
                  <button type="button" className="settings-btn-secondary">Update</button>
                </Row>
                <Row label="Two-Factor Authentication" desc="Adds an extra layer of security">
                  <Toggle on={false} onChange={() => {}} />
                </Row>
                <Row label="API Key" desc="For ResearchOS SDK and integrations">
                  <button type="button" className="settings-btn-secondary">Regenerate</button>
                </Row>
              </SectionCard>
            </>
          )}

          {/* ── Project Settings ── */}
          {section === 'project' && (
            <>
              <SectionCard title="Defaults">
                <Row label="Default Visibility" desc="Applied to new projects">
                  <select className="settings-select">
                    <option>Team</option>
                    <option>Private</option>
                    <option>Public</option>
                  </select>
                </Row>
                <Row label="Auto-generate Project ID" desc="e.g. PRJ-0043">
                  <Toggle on={true} onChange={() => {}} />
                </Row>
                <Row label="Enable Collaborative Lineage" desc="Show contributor avatars on lineage nodes">
                  <Toggle on={true} onChange={() => {}} />
                </Row>
                <Row label="Enable Research Copilot" desc="AI assistant for all projects">
                  <Toggle on={true} onChange={() => {}} />
                </Row>
              </SectionCard>
              <SectionCard title="Storage & Retention">
                <Row label="Dataset Storage" desc="Total: 28.4 GB of 100 GB used">
                  <div className="settings-storage-bar-wrap">
                    <div className="settings-storage-bar-track">
                      <div className="settings-storage-bar-fill" style={{ width: '28%' }} />
                    </div>
                    <p className="settings-storage-pct">28%</p>
                  </div>
                </Row>
                <Row label="Experiment Log Retention" desc="Logs older than this are archived">
                  <select className="settings-select">
                    <option>6 months</option>
                    <option>1 year</option>
                    <option>Forever</option>
                  </select>
                </Row>
              </SectionCard>
            </>
          )}

          {/* ── Team & Permissions ── */}
          {section === 'team' && (
            <>
              <SectionCard title="Members">
                <div className="settings-team-list">
                  {TEAM.map(m => (
                    <div key={m.id} className="settings-team-item">
                      <div
                        className="settings-team-avatar"
                        style={{ backgroundColor: m.color }}
                      >
                        {m.initials}
                      </div>
                      <div className="settings-team-info">
                        <div className="settings-team-name-row">
                          <span className="settings-team-name">{m.name}</span>
                          {m.active && <span className="settings-team-active-dot" title="Active" />}
                        </div>
                        <p className="settings-team-email">{m.email}</p>
                      </div>
                      <select
                        defaultValue={m.role}
                        className="settings-select settings-select-sm"
                      >
                        <option>Project Admin</option>
                        <option>Contributor</option>
                        <option>Reviewer</option>
                      </select>
                      {m.id !== 'alex' && (
                        <button type="button" className="settings-team-remove-btn">Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Invite New Member">
                <div className="settings-invite-row">
                  <input
                    placeholder="researcher@university.edu"
                    className="settings-input settings-input-mono"
                    style={{ flex: 1 }}
                  />
                  <select className="settings-select settings-select-sm">
                    <option>Contributor</option>
                    <option>Reviewer</option>
                    <option>Project Admin</option>
                  </select>
                  <button type="button" className="settings-btn-primary">Invite</button>
                </div>
              </SectionCard>
              <SectionCard title="Permissions">
                <Row label="Contributors can create experiments" desc="Without admin approval">
                  <Toggle on={true} onChange={() => {}} />
                </Row>
                <Row label="Reviewers can download datasets" desc="Read-only access to raw files">
                  <Toggle on={false} onChange={() => {}} />
                </Row>
                <Row label="Public projects require 2FA" desc="Extra security for open workspaces">
                  <Toggle on={true} onChange={() => {}} />
                </Row>
              </SectionCard>
            </>
          )}

          {/* ── Notifications ── */}
          {section === 'notifications' && (
            <>
              <SectionCard title="Activity Alerts">
                <Row label="Experiment completed" desc="When any team experiment finishes">
                  <Toggle on={notifs.experimentComplete} onChange={v => setN('experimentComplete', v)} />
                </Row>
                <Row label="Dataset uploaded" desc="When a new dataset version is added">
                  <Toggle on={notifs.datasetUpload} onChange={v => setN('datasetUpload', v)} />
                </Row>
                <Row label="Team member invited" desc="When someone joins your project">
                  <Toggle on={notifs.teamInvite} onChange={v => setN('teamInvite', v)} />
                </Row>
                <Row label="Lineage graph update" desc="When nodes are added in real time">
                  <Toggle on={notifs.lineageUpdate} onChange={v => setN('lineageUpdate', v)} />
                </Row>
                <Row label="Error or failure alert" desc="Experiment failures, upload errors">
                  <Toggle on={notifs.errorAlert} onChange={v => setN('errorAlert', v)} />
                </Row>
              </SectionCard>
              <SectionCard title="Delivery">
                <Row label="Weekly digest email" desc="Summary of experiments and results">
                  <Toggle on={notifs.weeklyDigest} onChange={v => setN('weeklyDigest', v)} />
                </Row>
                <Row label="In-app email notifications" desc="Mirror alerts to your inbox">
                  <Toggle on={notifs.emailDigest} onChange={v => setN('emailDigest', v)} />
                </Row>
                <Row label="Slack webhook" desc="Post alerts to a Slack channel">
                  <Toggle on={notifs.slackWebhook} onChange={v => setN('slackWebhook', v)} />
                </Row>
                {notifs.slackWebhook && (
                  <div className="settings-form-group" style={{ borderTop: '1px solid #F1F5F9', borderBottom: 'none', paddingTop: '12px' }}>
                    <label className="settings-label">Webhook URL</label>
                    <input
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
              <SectionCard title="Visibility">
                <Row label="Public profile" desc="Your name and affiliation visible to all ResearchOS users">
                  <Toggle on={privacy.profilePublic} onChange={v => setP('profilePublic', v)} />
                </Row>
                <Row label="Default project visibility" desc="Applied when creating new projects">
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
              <SectionCard title="Data Handling">
                <Row label="Share anonymous usage data" desc="Helps improve ResearchOS features">
                  <Toggle on={privacy.shareUsage} onChange={v => setP('shareUsage', v)} />
                </Row>
                <Row label="Allow product analytics" desc="Page views and feature usage patterns">
                  <Toggle on={privacy.allowAnalytics} onChange={v => setP('allowAnalytics', v)} />
                </Row>
                <Row label="Session data retention" desc="How long to keep activity logs">
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
                  <strong>Dataset files are never uploaded without your confirmation.</strong> ResearchOS only tracks metadata (file paths, hashes, column names) unless you explicitly choose to sync raw files.
                </p>
              </div>
            </>
          )}

          {/* ── Tracking Preferences ── */}
          {section === 'tracking' && (
            <>
              <SectionCard title="SDK Behavior">
                <Row label="Enable auto-tracking" desc="Automatically track all sessions when SDK is initialized">
                  <Toggle on={track.autoTrack} onChange={v => setT('autoTrack', v)} />
                </Row>
                <Row label="Track dataset loading" desc="Log file paths, version IDs, and row counts">
                  <Toggle on={track.trackDatasets} onChange={v => setT('trackDatasets', v)} />
                </Row>
                <Row label="Track model training" desc="Log hyperparameters, epoch metrics, and loss curves">
                  <Toggle on={track.trackModels} onChange={v => setT('trackModels', v)} />
                </Row>
                <Row label="Track experiment metadata" desc="Run IDs, timestamps, and framework versions">
                  <Toggle on={track.trackMetadata} onChange={v => setT('trackMetadata', v)} />
                </Row>
                <Row label="Track preprocessing steps" desc="Transform types, tools, and durations">
                  <Toggle on={track.trackPreprocessing} onChange={v => setT('trackPreprocessing', v)} />
                </Row>
              </SectionCard>
              <SectionCard title="Session Retention">
                <Row label="Retain session logs for" desc="Older sessions are archived automatically">
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
                <Row label="Anonymize experiment IDs" desc="Replace exp IDs with hashes in exported logs">
                  <Toggle on={track.anonymizeIds} onChange={v => setT('anonymizeIds', v)} />
                </Row>
              </SectionCard>
              <div className="settings-callout settings-callout-info">
                <span className="settings-callout-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.35"/>
                    <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.35"/>
                    <circle cx="8" cy="8" r="1" fill="currentColor"/>
                    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
                  </svg>
                </span>
                <p className="settings-callout-text">
                  <strong>Dataset files are never uploaded without your confirmation.</strong> The ResearchOS SDK tracks only metadata. Use the Tracking SDK page to review and confirm each sync session.
                </p>
              </div>
            </>
          )}

          {/* Save button */}
          <div className="settings-actions-bar">
            <button
              type="button"
              onClick={save}
              className="settings-btn-primary"
              style={{ padding: '10px 20px' }}
            >
              Save Changes
            </button>
            {saved && (
              <span className="settings-saved-indicator">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                  <path d="M2 7L5.5 10.5L12 3" stroke="#0F9D8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
