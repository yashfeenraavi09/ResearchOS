import React from 'react';

export default function ResearchOSLogo({ size = 28, showWordmark = false, textColor = '#0B1220' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 26 26"
        fill="none"
        aria-label="ResearchOS Logo"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="ros-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <path
          d="M 13,5 Q 10.47,12.54 5.21,18.5 Q 13,16.93 20.79,18.5 Q 15.53,12.54 13,5 Z"
          stroke="#0D9488"
          strokeWidth="1.6"
          fill="none"
        />
        <circle cx="5.21" cy="18.5" r="2.8" fill="#0B1F3A" />
        <circle cx="20.79" cy="18.5" r="2.2" fill="#0D9488" />
        <circle cx="13" cy="5" r="2.0" fill="#06B6D4" />
        <circle cx="13" cy="14" r="1.6" fill="url(#ros-logo-grad)" />
      </svg>
      {showWordmark && (
        <span
          style={{
            fontSize: `${size * 0.58}px`,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: textColor,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          Research<span style={{ color: '#0D9488' }}>OS</span>
        </span>
      )}
    </div>
  );
}
