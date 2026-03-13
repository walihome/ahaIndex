import React from 'react';
import { ProcessedItem } from '../types';

interface BriefingCardProps {
  item: ProcessedItem;
  index: number;
  onClick: (item: ProcessedItem) => void;
}

export function BriefingCard({ item, index, onClick }: BriefingCardProps) {
  const isFeatured = index === 0;
  const numStr = String(index + 1).padStart(3, '0');
  
  // Format date relative or simple
  const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : '未知时间';
  const title = item.processed_title || '无标题';
  const description = item.summary || '无摘要';
  const category = item.tags && item.tags.length > 0 ? item.tags[0] : '综合';
  const tags = item.tags ? item.tags.slice(1) : [];

  if (isFeatured) {
    return (
      <article className="article featured" style={{ position: 'relative' }} onClick={() => onClick(item)}>
        <div className="stamp">
          <div className="stamp-inner">aha<br/>INDEX</div>
        </div>
        <span className="article-num">NO. {numStr}</span>
        <div className="featured-accent"></div>
        <h2 className="article-title">
          {title}
        </h2>
        <p className="article-desc">{description}</p>
        <div className="article-meta">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="tag primary">{category}</span>
            {tags.map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
          
          <div className="article-extra">
            {item.source_name && (
              <span className="article-source-name">{item.source_name}</span>
            )}
            
            {item.display_metrics?.items?.filter(m => m.label !== '📖 来源').map((metric, i) => (
              <span key={i} className="article-metric">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}</span>
              </span>
            ))}
            
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="article" style={{ position: 'relative' }} onClick={() => onClick(item)}>
      <div className="article-num">{numStr}</div>
      <div className="article-body">
        <h2 className="article-title">
          {title}
        </h2>
        <p className="article-desc">{description}</p>
        <div className="article-meta">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="tag primary">{category}</span>
            {tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>

          <div className="article-extra">
            {item.source_name && (
              <span className="article-source-name">{item.source_name}</span>
            )}
            
            {item.display_metrics?.items?.filter(m => m.label !== '📖 来源').map((metric, i) => (
              <span key={i} className="article-metric">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}</span>
              </span>
            ))}

            
          </div>
        </div>
      </div>
    </article>
  );
}
