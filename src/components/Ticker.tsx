import React from 'react';
import { ProcessedItem } from '../types';

interface TickerProps {
  items: ProcessedItem[];
}

export function Ticker({ items }: TickerProps) {
  // Use mock or provided items, fallback to a default message if empty
  const displayList = items.length > 0 
    ? items.map(item => ({ type: '▲' as const, text: item.processed_title || '' }))
    : [
        { type: '▲', text: "正在加载今日精选动态..." },
        { type: '◆', text: "AHA指数今日 84.5 · +1.8% 较昨日" }
      ];

  // Double the items for seamless scrolling
  const displayItems = [...displayList, ...displayList];

  return (
    <div className="ticker">
      <div className="ticker-label">实时动态</div>
      <div style={{ overflow: 'hidden', flex: 1, display: 'flex' }}>
        <div className="ticker-track">
          {displayItems.map((item, index) => (
            <span key={index} className="ticker-item">
              <span>{item.type}</span> {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
