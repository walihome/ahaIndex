import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  showArchiveBanner?: boolean;
}

export function Footer({ showArchiveBanner = false }: FooterProps) {
  const today = new Date();
  const dateStr = today.getFullYear() + '.' + 
                  String(today.getMonth() + 1).padStart(2, '0') + '.' + 
                  String(today.getDate()).padStart(2, '0');

  return (
    <footer className="footer">
      {showArchiveBanner && (
        <div style={{ maxWidth: '1088px', margin: '0 auto', padding: '32px 32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--fs)', fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
              Explore the Archive
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink2)', lineHeight: 1.4 }}>
              Dive into our comprehensive database of past AI industry shifts.
            </div>
          </div>
          <Link to="/daily" style={{ flexShrink: 0, display: 'inline-block', padding: '8px 16px', background: 'var(--ink)', color: 'var(--paper)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', transition: 'opacity 0.2s' }}>
            Browse History
          </Link>
        </div>
      )}
      <div className="footer-inner">
        <span>© {today.getFullYear()} AmazingIndex · The Absolute Threshold</span>
        <span>Vol. {today.getMonth() + 1} · Issue {dateStr}</span>
        <span>版权所有 · All rights reserved</span>
      </div>
    </footer>
  );
}
