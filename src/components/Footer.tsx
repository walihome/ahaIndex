import React from 'react';

export function Footer() {
  const today = new Date();
  const dateStr = today.getFullYear() + '.' + 
                  String(today.getMonth() + 1).padStart(2, '0') + '.' + 
                  String(today.getDate()).padStart(2, '0');

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© {today.getFullYear()} aha指数 · The Absolute Threshold</span>
        <span>Vol. {today.getMonth() + 1} · Issue {dateStr}</span>
        <span>版权所有 · All rights reserved</span>
      </div>
    </footer>
  );
}
