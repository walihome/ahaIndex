import React, { useState, useLayoutEffect } from 'react';
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

  useLayoutEffect(() => {
    // Record current scroll position
    const scrollY = window.scrollY;
    
    // Save original body styles
    const originalStyle = window.getComputedStyle(document.body);
    const originalPosition = originalStyle.position;
    const originalTop = originalStyle.top;
    const originalLeft = originalStyle.left;
    const originalRight = originalStyle.right;
    const originalWidth = originalStyle.width;
    const originalOverflow = originalStyle.overflow;

    // Apply fixed positioning to lock body completely (fixes iOS Safari bypass)
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Prevent touchmove on non-scrollable areas (backdrop, header, footer)
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      // Allow scrolling if the touch is inside the modal body
      if (target.closest('.modal-body')) {
        // Stop propagation so it doesn't bubble up and trigger default behavior on document
        e.stopPropagation();
        return;
      }
      // Otherwise, prevent default to stop background scrolling/rubber-banding
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const modalBody = target.closest('.modal-body') as HTMLElement;
      if (modalBody) {
        // Prevent reaching the exact top or bottom to avoid iOS rubber-banding
        if (modalBody.scrollTop === 0) {
          modalBody.scrollTop = 1;
        } else if (modalBody.scrollTop + modalBody.clientHeight === modalBody.scrollHeight) {
          modalBody.scrollTop -= 1;
        }
      }
    };

    // Use capture phase to intercept events early
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true });

    return () => {
      // Restore original styles
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.left = originalLeft;
      document.body.style.right = originalRight;
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
      
      // Restore scroll position instantly
      window.scrollTo(0, scrollY);
      
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
    };
  }, []);

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
                loading="lazy"
                width="800"
                height="400"
                style={{ width: '100%', height: 'auto', aspectRatio: '2 / 1', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
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
                loading="lazy"
                width="800"
                height="400"
                style={{ width: '100%', height: 'auto', aspectRatio: '2 / 1', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
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
