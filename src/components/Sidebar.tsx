import React from 'react';

export function Sidebar() {
  return (
    <aside className="side-col">
      <div className="aha-score-card">
        <div className="score-header">Daily AHA Index</div>

        <div className="score-display">
          <span className="score-number">82.4</span>
          <div className="score-unit">Absolute Threshold Score</div>
          <div className="score-delta">2.3% VS YESTERDAY</div>
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

        <p className="about-text">
          "aha指数" 是一套基于多维度量化算法的评估系统，旨在发掘当下最具颠覆性与美学价值的创新成果。
        </p>

        <div className="version-info">
          <span>Version 1.2.0</span>
          <span style={{ textAlign: 'right' }}>© {new Date().getFullYear()} Index</span>
        </div>
      </div>
    </aside>
  );
}
