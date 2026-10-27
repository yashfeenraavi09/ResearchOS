import React, { useState } from 'react';
import './TopBar.css';

export default function TopBar({ onToggleSidebar, sidebarOpen }) {
  const [query, setQuery] = useState('');

  return (
    <header className="topbar-header">
      {/* Mobile hamburger menu button */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Close menu' : 'Open menu'}
        aria-label="Toggle navigation menu"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
          <path d="M3 4.5h12M3 9h12M3 13.5h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>

      {/* Search */}
      <div className="topbar-search-container">
        <div className="topbar-search-wrapper">
          <svg className="topbar-search-icon" width="14" height="14" fill="none" viewBox="0 0 14 14">
            <circle cx="6" cy="6" r="4.2" stroke="currentColor" strokeWidth="1.35"/>
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search datasets, experiments, or ask a question..."
            className="topbar-search-input"
          />
          <div className="topbar-kbd-badge">
            <kbd>⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Notifications */}
        <button
          className="topbar-action-btn"
          title="Notifications"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path d="M8 2.5C5.79 2.5 4 4.29 4 6.5v4l-1.5 1.5h11L12 10.5v-4C12 4.29 10.21 2.5 8 2.5z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
            <path d="M6.5 12a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.35"/>
          </svg>
          <span className="topbar-notification-dot" />
        </button>

        {/* Theme toggle */}
        <button
          className="topbar-action-btn"
          title="Toggle Theme"
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 15 15">
            <path d="M7.5 1V2.5M7.5 12.5V14M1 7.5H2.5M12.5 7.5H14M3.2 3.2l1.06 1.06M10.74 10.74l1.06 1.06M3.2 11.8l1.06-1.06M10.74 4.26l1.06-1.06" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
            <circle cx="7.5" cy="7.5" r="2.3" stroke="currentColor" strokeWidth="1.35"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
