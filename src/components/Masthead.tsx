import React, { useState, useEffect } from 'react';
import { ProcessedItem } from '../types';

interface MastheadProps {
  items?: ProcessedItem[];
}

export function Masthead({ items = [] }: MastheadProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  useEffect(() => {
    const handleClick = () => setShowTooltip(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const ahaScore = items.length > 0 
    ? (items.reduce((sum, item) => sum + (item.aha_index || 0), 0) / items.length * 100).toFixed(1)
    : '0.0';

  // Calculate dimensions (fallback to derived if not present in raw_metrics)
  let scarcity = 0, timeliness = 0, impact = 0;
  if (items.length > 0) {
    let sSum = 0, tSum = 0, iSum = 0;
    let count = 0;
    items.forEach(item => {
      if (item.raw_metrics && typeof item.raw_metrics === 'object') {
        sSum += item.raw_metrics.scarcity || (item.aha_index * 100 * 1.1);
        tSum += item.raw_metrics.timeliness || (item.aha_index * 100 * 0.9);
        iSum += item.raw_metrics.impact || (item.aha_index * 100 * 1.05);
        count++;
      } else {
        sSum += (item.aha_index * 100 * 1.1);
        tSum += (item.aha_index * 100 * 0.9);
        iSum += (item.aha_index * 100 * 1.05);
        count++;
      }
    });
    scarcity = Math.min(100, Math.round(sSum / count));
    timeliness = Math.min(100, Math.round(tSum / count));
    impact = Math.min(100, Math.round(iSum / count));
  }

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
          <div className="aha-score-mobile">
            <span className="score-trigger" onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}>{ahaScore}</span>
            <div className={`score-tooltip ${showTooltip ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="tooltip-label">今日 AHA 指数</div>
              <div className="tooltip-score">{ahaScore}</div>
              <div className="tooltip-trend">▲ 2.3% 较昨日</div>
              <div className="tooltip-divider"></div>
              <div className="tooltip-dim">
                <span>稀缺性</span>
                <div className="dim-bar-container"><div className="dim-bar-fill" style={{width: `${scarcity}%`}}></div></div>
                <span>{scarcity} / 100</span>
              </div>
              <div className="tooltip-dim">
                <span>时效性</span>
                <div className="dim-bar-container"><div className="dim-bar-fill" style={{width: `${timeliness}%`}}></div></div>
                <span>{timeliness} / 100</span>
              </div>
              <div className="tooltip-dim">
                <span>影响力</span>
                <div className="dim-bar-container"><div className="dim-bar-fill" style={{width: `${impact}%`}}></div></div>
                <span>{impact} / 100</span>
              </div>
              <div className="tooltip-divider"></div>
              <div className="tooltip-desc">
                综合今日所有内容的稀缺性、时效性与影响力加权平均得出。满分 100。
              </div>
              <a href="/about" className="tooltip-link">查看完整指数说明 →</a>
            </div>
          </div>
          <div className="meta-text">
            VOL. {now.getMonth() + 1}<br/>
            {year}.{month}.{day}
          </div>
        </div>
      </div>
    </header>
  );
}
