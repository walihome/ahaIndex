import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  showArchiveBanner?: boolean;
  date?: string;
}

export function Footer({ showArchiveBanner = false, date }: FooterProps) {
  const today = date ? new Date(date) : new Date();
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
          <Link onClick={() => window.scrollTo(0, 0)} to="/daily" style={{ flexShrink: 0, display: 'inline-block', padding: '8px 16px', background: 'var(--ink)', color: 'var(--paper)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none', transition: 'opacity 0.2s' }}>
            Browse History
          </Link>
        </div>
      )}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        padding: '32px 32px 0',
        maxWidth: '1088px',
        margin: '0 auto',
        fontSize: '12px',
        color: 'var(--ink2)'
      }}>
        <Link to="/about" onClick={() => window.scrollTo(0, 0)} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink2)'}>关于我们</Link>
        <Link to="/contact" onClick={() => window.scrollTo(0, 0)} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink2)'}>联系方式</Link>
        <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink2)'}>隐私政策 (Privacy Policy)</Link>
        <Link to="/terms" onClick={() => window.scrollTo(0, 0)} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink2)'}>服务条款 (Terms)</Link>
      </div>
      <div className="footer-inner">
        <span>© {today.getFullYear()} AmazingIndex · The Absolute Threshold</span>
        <span>Vol. {today.getMonth() + 1} · Issue {dateStr}</span>
        <span>版权所有 · All rights reserved</span>
      </div>
    </footer>
  );
}
