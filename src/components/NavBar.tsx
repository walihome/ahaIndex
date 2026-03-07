import React from 'react';

export function NavBar() {
  return (
    <nav className="nav-bar">
      <div className="nav-inner">
        <div className="nav-tabs">
          <a className="nav-tab active" href="#">全部</a>
          <a className="nav-tab" href="#">人工智能</a>
          <a className="nav-tab" href="#">开发者</a>
          <a className="nav-tab" href="#">文化创意</a>
          <a className="nav-tab" href="#">金融</a>
        </div>
        <div className="nav-date">VOL. 2026.03 &nbsp;·&nbsp; 星期五</div>
      </div>
    </nav>
  );
}
