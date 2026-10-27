import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

// ── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 6.5L8 2l6 4.5V14H10v-3H6v3H2V6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}
function DatabaseIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><ellipse cx="8" cy="4.5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 4.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 7.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
function FlaskIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M6 2v5L3 13h10L10 7V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="5.5" cy="11" r="0.75" fill="currentColor"/><circle cx="8.5" cy="10" r="0.5" fill="currentColor"/></svg>;
}
function LineageIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="3" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="3.5" r="1.75" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="12.5" r="1.75" stroke="currentColor" strokeWidth="1.5"/><circle cx="13" cy="8" r="1.75" stroke="currentColor" strokeWidth="1.5"/><path d="M4.75 8h1.5M9.75 3.5l1.75 3M9.75 12.5l1.75-3" stroke="currentColor" strokeWidth="1.25"/></svg>;
}
function ChartIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 12L5.5 8l3 2.5L12 5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function CopilotIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M8 2a5.5 5.5 0 0 1 5.5 5.5c0 2.5-1.6 4.6-3.9 5.3L8 14l-1.6-1.2A5.5 5.5 0 0 1 2.5 7.5 5.5 5.5 0 0 1 8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 7.5h4M8 5.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function TrackingIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" fill="currentColor"/><path d="M8 2.5V1M8 15v-1.5M2.5 8H1M15 8h-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function FolderIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 5.5C2 4.67 2.67 4 3.5 4H6l1.5 1.5H12.5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-9C2.67 13.5 2 12.83 2 12V5.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}
function SettingsIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1.5v1.25M8 13.25V14.5M14.5 8h-1.25M2.75 8H1.5M12.72 3.28l-.88.88M4.16 11.84l-.88.88M12.72 12.72l-.88-.88M4.16 4.16l-.88-.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

const navItems = [
  { id: 'home',        label: 'Home',            icon: HomeIcon },
  { id: 'datasets',    label: 'Datasets',         icon: DatabaseIcon },
  { id: 'experiments', label: 'Experiments',      icon: FlaskIcon },
  { id: 'lineage',     label: 'Lineage',          icon: LineageIcon },
  { id: 'results',     label: 'Results',          icon: ChartIcon },
  { id: 'copilot',     label: 'Research Copilot', icon: CopilotIcon },
  { id: 'tracking',    label: 'Tracking SDK',     icon: TrackingIcon },
  { id: 'projects',    label: 'Projects',         icon: FolderIcon },
  { id: 'settings',    label: 'Settings',         icon: SettingsIcon },
];

function NavItem({ item, active, onClick, collapsed }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`sidebar-nav-item ${collapsed ? 'sidebar-item-collapsed' : 'sidebar-expanded'} ${active ? 'sidebar-item-active' : ''}`}
    >
      <span className="sidebar-item-icon">
        <Icon />
      </span>
      {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
      {!collapsed && item.id === 'copilot' && (
        <span className="sidebar-ai-badge">AI</span>
      )}
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate, isOpen, onToggle }) {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : 'Researcher');
  const roleOrEmail = user?.user_metadata?.org || user?.email || 'ResearchOS Member';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Logo row / Collapse row */}
      <div className={`sidebar-header ${!isOpen ? 'sidebar-header-collapsed' : ''}`}>
        {isOpen ? (
          <>
            {/* Mark */}
            <svg viewBox="0 0 26 26" fill="none" className="sidebar-mark" aria-label="ResearchOS">
              <defs>
                <linearGradient id="sb-mark-g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
              <path d="M 13,5 Q 10.47,12.54 5.21,18.5 Q 13,16.93 20.79,18.5 Q 15.53,12.54 13,5 Z"
                stroke="#14B8A6" strokeWidth="1.4" fill="none" />
              <circle cx="5.21"  cy="18.5" r="2.8" fill="#0B1F3A" />
              <circle cx="20.79" cy="18.5" r="2.2" fill="#14B8A6" />
              <circle cx="13"    cy="5"    r="1.8" fill="#22D3EE" />
              <circle cx="13"    cy="14"   r="1.4" fill="url(#sb-mark-g)" />
            </svg>

            {/* Wordmark — only when expanded */}
            <span className="sidebar-wordmark">
              <svg viewBox="0 0 116 18" fill="none" style={{ width: 116, height: 18 }} aria-hidden="true">
                <text x="0" y="14"
                  fontFamily="'Inter', ui-sans-serif, system-ui, sans-serif"
                  fontSize="14" letterSpacing="-0.3">
                  <tspan fontWeight="500" fill="#0B1220">Research</tspan>
                  <tspan fontWeight="700" fill="#14B8A6">OS</tspan>
                </text>
              </svg>
            </span>

            {/* Collapse button */}
            <button
              onClick={onToggle}
              className="sidebar-toggle-btn"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path d="M8.5 3.5L5 7l3.5 3.5M11.5 3.5L8 7l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        ) : (
          /* When collapsed: instead of logo, show the arrow expand button */
          <button
            onClick={onToggle}
            className="sidebar-expand-btn-collapsed"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 14 14">
              <path d="M4.5 3.5L8 7l-3.5 3.5M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`sidebar-nav scrollbar-hide ${isOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {isOpen && <p className="sidebar-section-title">Workspace</p>}
        {navItems.slice(0, 5).map(item => (
          <NavItem key={item.id} item={item} active={activePage === item.id} onClick={() => onNavigate(item.id)} collapsed={!isOpen} />
        ))}

        <div className={`sidebar-nav-group ${isOpen ? '' : 'sidebar-collapsed'}`}>
          {isOpen && <p className="sidebar-section-title">AI & Tools</p>}
          {navItems.slice(5, 7).map(item => (
            <NavItem key={item.id} item={item} active={activePage === item.id} onClick={() => onNavigate(item.id)} collapsed={!isOpen} />
          ))}
        </div>

        <div className={`sidebar-nav-group ${isOpen ? '' : 'sidebar-collapsed'}`}>
          {isOpen && <p className="sidebar-section-title">Manage</p>}
          {navItems.slice(7).map(item => (
            <NavItem key={item.id} item={item} active={activePage === item.id} onClick={() => onNavigate(item.id)} collapsed={!isOpen} />
          ))}
        </div>
      </nav>

      {/* User */}
      <div className={`sidebar-footer ${isOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        {isOpen ? (
          <div className="sidebar-user-card" onClick={() => onNavigate('settings')} style={{ cursor: 'pointer' }} title="Account Settings">
            <div className="sidebar-avatar">{initial}</div>
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0, paddingRight: '6px' }}>
              <p className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
              <p className="sidebar-user-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roleOrEmail}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                signOut();
              }}
              title="Sign out"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="sidebar-avatar-only" onClick={() => onNavigate('settings')} style={{ cursor: 'pointer' }} title={`${displayName} (${roleOrEmail})`}>
            <div className="sidebar-avatar">{initial}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
