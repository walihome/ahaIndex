import React from 'react';

export function Masthead() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  return (
    <header className="masthead">
      <div className="masthead-inner">
        <div className="masthead-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 32 32" fill="none">
              <polyline points="4,24 12,10 18,18 24,8" stroke="#1a1714" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="8" r="2" fill="#c8432a"/>
            </svg>
          </div>
          <span className="logo-text font-mono font-bold tracking-tighter text-[24px]">
            <span className="text-[var(--accent)]">aha</span>
            <span className="text-[var(--ink)] ml-4">INDEX</span>
          </span>
        </div>

        <div className="masthead-title">
          The Absolute Threshold<br/>
          每日创新洞察报告
        </div>

        <div className="masthead-meta">
          VOL. {now.getMonth() + 1}<br/>
          {year}.{month}.{day}
        </div>
      </div>
    </header>
  );
}
