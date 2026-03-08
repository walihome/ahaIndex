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
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="1,17 8,7 14,12 20,3 25,6"
                        stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="25" cy="6" r="2.6" fill="var(--accent)"/>
            </svg>
            <span className="logo-aha">aha</span>
            <span className="logo-zh">指数</span>
            <div className="logo-dot"></div>
          </div>
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
