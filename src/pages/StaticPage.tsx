import React from 'react';
import { Masthead } from '../components/Masthead';
import { Footer } from '../components/Footer';

export function StaticPage({ title, content }: { title: string, content: React.ReactNode }) {
  return (
    <div>
      <Masthead />
      <div className="layout" style={{ minHeight: 'calc(100vh - 164px)', display: 'block', padding: '40px 32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'var(--ink)' }}>{title}</h1>
        <div style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--ink2)' }}>
          {content}
        </div>
      </div>
      <Footer />
    </div>
  );
}
