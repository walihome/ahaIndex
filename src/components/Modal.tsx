import React, { useState } from 'react';
import { ProcessedItem } from '../types';
import { useTracking } from '../hooks/useTracking';

interface ModalProps {
  item: ProcessedItem;
  onClose: () => void;
}

export function Modal({ item, onClose }: ModalProps) {
  const { trackEvent } = useTracking();
  const [showCover, setShowCover] = useState(true);
  const [showStarHistory, setShowStarHistory] = useState(true);

  const handleReadOriginal = () => {
    if (item.original_url) {
      trackEvent(item.processed_item_id, item.snapshot_date, 'click_original');
      window.open(item.original_url, '_blank', 'noopener,noreferrer');
    }
  };

  const title = item.processed_title || '无标题';
  const summary = item.summary || '';
  
  // Parse extra and raw_metrics
  let extra: any = {};
  if (typeof item.extra === 'string') {
    try { extra = JSON.parse(item.extra); } catch (e) {}
  } else if (item.extra) {
    extra = item.extra;
  }

  let rawMetrics: any = {};
  if (typeof item.raw_metrics === 'string') {
    try { rawMetrics = JSON.parse(item.raw_metrics); } catch (e) {}
  } else if (item.raw_metrics) {
    rawMetrics = item.raw_metrics;
  }

  const paragraphs = (item.expert_insight || '').split('\n').filter(p => p.trim());

  // Format stars
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return String(num);
  };

  const renderMetrics = () => {
    if (!rawMetrics || Object.keys(rawMetrics).length === 0) return null;

    if (item.source_name?.includes('GitHub')) {
      return (
        <>
          {rawMetrics.stars !== undefined && (
            <span className="meta-text"><span className="meta-star-icon">★</span> {formatNumber(rawMetrics.stars)}</span>
          )}
          {rawMetrics.forks !== undefined && (
            <span className="meta-text">Fork {formatNumber(rawMetrics.forks)}</span>
          )}
          {extra.language && (
            <span className="meta-text">{extra.language}</span>
          )}
        </>
      );
    } else if (item.source_name?.includes('HackerNews')) {
      return (
        <>
          {rawMetrics.score !== undefined && (
            <span className="meta-text">▲ {formatNumber(rawMetrics.score)}</span>
          )}
          {rawMetrics.comments !== undefined && (
            <span className="meta-text">💬 {formatNumber(rawMetrics.comments)}</span>
          )}
        </>
      );
    } else if (item.source_name?.includes('Twitter') || item.source_name?.includes('X')) {
      return (
        <>
          {rawMetrics.tweet_count !== undefined && (
            <span className="meta-text">{formatNumber(rawMetrics.tweet_count)} tweets</span>
          )}
        </>
      );
    }
    return null;
  };

  // Format date
  const dateStr = item.snapshot_date ? item.snapshot_date.replace(/-/g, '.') : '';

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="drag-handle"></div>
        
        <div className="modal-header">
          <div className="modal-topbar">
            <div className="tag-row">
              {/* Add tags if available, currently hardcoded or empty if none */}
              {item.content_type && <span className="tag">#{item.content_type.toUpperCase()}</span>}
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <h2 className="modal-title">{title}</h2>
          
          <div className="modal-meta">
            {item.source_name && <span className="meta-text">{item.source_name.toUpperCase()}</span>}
            {renderMetrics()}
            {dateStr && <span className="meta-date">{dateStr}</span>}
          </div>
        </div>

        <div className="modal-body">
          {summary && (
            <p className="summary">{summary}</p>
          )}
          
          {extra?.description && (
            <p className="modal-description-en">
              {extra.description}
            </p>
          )}

          {item.content_type === 'repo' && extra?.readme_images?.length > 0 && showCover && (
            <div style={{ marginBottom: '24px' }}>
              <img
                src={extra.readme_images[0]}
                alt="封面图"
                style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border)' }}
                onError={() => setShowCover(false)}
              />
            </div>
          )}

          <div className="insight-block">
            <div className="insight-text">
              <em style={{ display: 'block', marginBottom: '8px' }}>Editor's Note:</em>
              {paragraphs.length > 0 ? (
                paragraphs.map((p, i) => <p key={i} className="insight-paragraph">{p}</p>)
              ) : (
                <p className="insight-paragraph">暂无专家洞察</p>
              )}
            </div>
          </div>

          {item.content_type === 'repo' && extra?.star_history_url && showStarHistory && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600 }}>STAR HISTORY</div>
              <img
                src={extra.star_history_url}
                alt="Star History"
                style={{ width: '100%', borderRadius: '6px', border: '1px solid var(--border)' }}
                onError={() => setShowStarHistory(false)}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-footer-btn" onClick={onClose}>×</button>
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
