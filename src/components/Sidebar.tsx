import React from 'react';
import { ProcessedItem } from '../types';

interface SidebarProps {
  items?: ProcessedItem[];
}

export function Sidebar({ items = [] }: SidebarProps) {
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
    <aside className="side-col">
      <div className="aha-score-card">
        <div className="score-header">Daily AHA Index</div>

        <div className="score-display">
          <span className="score-number">{ahaScore}</span>
          <div className="score-unit">Absolute Threshold Score</div>
        </div>

        {/* Mini bar chart */}
        <div className="score-chart">
          <div className="bar" style={{ height: '45%' }} title="Mon"></div>
          <div className="bar" style={{ height: '60%' }} title="Tue"></div>
          <div className="bar" style={{ height: '38%' }} title="Wed"></div>
          <div className="bar" style={{ height: '72%' }} title="Thu"></div>
          <div className="bar" style={{ height: '55%' }} title="Fri"></div>
          <div className="bar" style={{ height: '68%' }} title="Sat"></div>
          <div className="bar today" style={{ height: '82%' }} title="Today"></div>
        </div>

        <div className="divider"></div>

        <div className="sidebar-dims">
          <div className="sidebar-dim">
            <span className="dim-label">稀缺性</span>
            <span className="dim-val">{scarcity}</span>
            <div className="dim-bar-container"><div className="dim-bar-fill" style={{width: `${scarcity}%`}}></div></div>
          </div>
          <div className="sidebar-dim">
            <span className="dim-label">时效性</span>
            <span className="dim-val">{timeliness}</span>
            <div className="dim-bar-container"><div className="dim-bar-fill" style={{width: `${timeliness}%`}}></div></div>
          </div>
          <div className="sidebar-dim">
            <span className="dim-label">影响力</span>
            <span className="dim-val">{impact}</span>
            <div className="dim-bar-container"><div className="dim-bar-fill" style={{width: `${impact}%`}}></div></div>
          </div>
        </div>

        <div className="divider"></div>

        <p className="about-text">
          "AmazingIndex" 是一套基于多维度量化算法的评估系统，旨在发掘当下最具颠覆性与美学价值的创新成果。
        </p>

        <div className="version-info">
          <span>Version 1.2.0</span>
          <span style={{ textAlign: 'right' }}>© {new Date().getFullYear()} Index</span>
        </div>
      </div>
    </aside>
  );
}
