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
          <div className="flex items-center gap-3">
            {/* Original Logo Mark */}
            <div className="logo-mark">
              <svg viewBox="0 0 32 32" fill="none">
                <polyline points="4,24 12,10 18,18 24,8" stroke="#1a1714" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="24" cy="8" r="2" fill="#c8432a"/>
              </svg>
            </div>
            
            <div className="flex items-baseline">
              {/* Sparkle Icon from design image */}
              <div className="text-[var(--muted)] opacity-30 mr-2 self-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
                </svg>
              </div>
              <span className="font-playfair italic font-bold text-[32px] text-[var(--ink)] tracking-tight">aha</span>
              <span className="font-noto font-[200] text-[32px] text-[var(--ink)] ml-1">指数</span>
              {/* Red Dot from design image */}
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] ml-1.5 mb-1.5"></div>
            </div>
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
