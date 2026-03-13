import React from 'react';
import Markdown from 'react-markdown';
import { ProcessedItem } from '../types';
import { useTracking } from '../hooks/useTracking';

interface ModalProps {
  item: ProcessedItem;
  onClose: () => void;
}

export function Modal({ item, onClose }: ModalProps) {
  const { trackEvent } = useTracking();

  // Format date
  const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, ' / ') : '未知时间';

  const title = item.processed_title || '无标题';
  const description = item.summary || '无摘要';
  const category = item.tags && item.tags.length > 0 ? item.tags[0] : '综合';
  const tags = item.tags ? item.tags.slice(1) : [];
  const score = item.aha_index !== null ? (item.aha_index * 100).toFixed(1) : 'N/A';

  const handleReadOriginal = () => {
    if (item.original_url) {
      // 触发点击原文埋点
      trackEvent(item.processed_item_id, item.snapshot_date, 'click_original');
      window.open(item.original_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="drag-handle"></div>

        <div className="modal-header">
          <div className="modal-topbar">
            <div className="tag-row">
              <span className="tag primary">{category}</span>
              {tags.slice(0, 1).map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
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
            <div className="close-btn" onClick={onClose}>✕</div>
          </div>

          <h1 className="modal-title">{title}</h1>

          <div className="modal-meta">
            <span className="meta-text">{item.original_url ? new URL(item.original_url).hostname : '未知来源'}</span>
            <span className="meta-date">{dateStr}</span>
          </div>
        </div>

        <div className="aha-strip">
          <div>
            <div className="aha-label">AHA Score</div>
            <div className="aha-score">{score}</div>
          </div>
          <div className="aha-bars">
            <div className="s-bar" style={{ height: '35%' }}></div>
            <div className="s-bar" style={{ height: '55%' }}></div>
            <div className="s-bar" style={{ height: '45%' }}></div>
            <div className="s-bar" style={{ height: '65%' }}></div>
            <div className="s-bar" style={{ height: '50%' }}></div>
            <div className="s-bar hi" style={{ height: `${item.aha_index ? item.aha_index * 100 : 78}%` }}></div>
          </div>
        </div>

        <div className="modal-body">
          <p className="summary">
            {description}
          </p>

          <div className="section-label">Expert Insight</div>
          <div className="insight-block">
            <div className="insight-text">
              <Markdown>{item.expert_insight || '*暂无专家洞察*'}</Markdown>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="close-footer-btn" onClick={onClose}>✕</div>
          {item.original_url && (
            <button 
              className="btn-primary"
              onClick={handleReadOriginal}
            >
              查看原文 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
