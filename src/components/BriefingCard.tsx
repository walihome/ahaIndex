import React from 'react';
import { ProcessedItem } from '../types';
import { useImpression, useTracking } from '../hooks/useTracking';

interface BriefingCardProps {
  item: ProcessedItem;
  index: number;
  onClick: (item: ProcessedItem) => void;
  showDate?: boolean;
}

export function BriefingCard({ item, index, onClick, showDate }: BriefingCardProps) {
  const { trackEvent } = useTracking();
  // 绑定曝光埋点
  const cardRef = useImpression(item.processed_item_id, item.snapshot_date);

  const handleCardClick = () => {
    // 记录点击埋点（点击卡片打开弹窗也视为一次点击行为）
    trackEvent(item.processed_item_id, item.snapshot_date, 'click');
    onClick(item);
  };

  const isFeatured = index === 0 && !showDate;
  const numStr = String(index + 1).padStart(3, '0');
  
  // Format date relative or simple
  const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() : '未知时间';
  
  let displayLeft = numStr;
  if (showDate && item.snapshot_date) {
    const parts = item.snapshot_date.split('-');
    if (parts.length === 3) {
      displayLeft = `${parts[1]}.${parts[2]}`;
    } else {
      displayLeft = item.snapshot_date;
    }
  }

  const title = item.processed_title || '无标题';
  const description = item.summary || '无摘要';
  const category = item.tags && item.tags.length > 0 ? item.tags[0] : '综合';
  const tags = item.tags ? item.tags.slice(1) : [];

  if (isFeatured) {
    return (
      <article ref={cardRef as any} className="article featured" style={{ position: 'relative' }} onClick={handleCardClick}>
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
    <article ref={cardRef as any} className="article" style={{ position: 'relative' }} onClick={handleCardClick}>
      <div className="article-num">{displayLeft}</div>
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
