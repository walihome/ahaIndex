import { useEffect, useRef, useCallback } from 'react';

// Cookie 工具函数
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  // 在 AI Studio iFrame 中必须使用 SameSite=None; Secure
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=None;Secure`;
};

const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const UID_KEY = 'aha_briefing_uid';

// 获取或生成匿名用户 ID
const getUserId = () => {
  let uid = getCookie(UID_KEY);
  if (!uid) {
    uid = crypto.randomUUID();
    setCookie(UID_KEY, uid, 365);
    console.log('Tracking: Generated new user_id:', uid);
  }
  return uid;
};

// 全局 Set，用于在单次页面加载生命周期内对曝光进行去重
const trackedImpressions = new Set<string>();

/**
 * 提供点击埋点功能的 Hook
 */
export function useTracking() {
  const trackEvent = useCallback((item_id: string, snapshot_date: string, event_type: 'click' | 'click_original') => {
    const user_id = getUserId();
    if (!user_id || !item_id || !snapshot_date) return;
    
    console.log(`Tracking: Sending ${event_type}...`, { item_id, user_id });

    // Fire and forget - 写入正式表 user_events
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('user_events').insert([{
        item_id,
        snapshot_date,
        user_id,
        event_type
      }]).then(({ error }) => {
        if (error) {
          console.error(`Tracking Error (${event_type}):`, error.message);
        } else {
          console.log(`Tracking Success: ${event_type} recorded.`);
        }
      });
    });
  }, []);

  return { trackEvent };
}


/**
 * 提供曝光埋点功能的 Hook
 */
export function useImpression(item_id: string, snapshot_date: string) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !item_id || !snapshot_date) return;

    const trackingKey = `${item_id}-${snapshot_date}`;
    if (trackedImpressions.has(trackingKey)) return;

    let timer: NodeJS.Timeout;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        timer = setTimeout(() => {
          const user_id = getUserId();
          if (user_id && !trackedImpressions.has(trackingKey)) {
            trackedImpressions.add(trackingKey);
            
            import('../lib/supabase').then(({ supabase }) => {
              supabase.from('user_events').insert([{
                item_id,
                snapshot_date,
                user_id,
                event_type: 'impression'
              }]).then(({ error }) => {
                if (error) console.warn('Silent fail: Impression tracking error', error.message);
              });
            });
          }
          observer.disconnect();
        }, 1000);
      } else {
        if (timer) clearTimeout(timer);
      }
    }, { threshold: 0.5 });

    observer.observe(element);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [item_id, snapshot_date]);

  return ref;
}

