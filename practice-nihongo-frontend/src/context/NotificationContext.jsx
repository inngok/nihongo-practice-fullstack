import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Per-user storage keys — prevents notifications from leaking between accounts
const storageKey = (userId) => `nihongo_notifications_history_${userId || 'guest'}`;
const dismissedKey = (userId) => `nihongo_notifications_dismissed_${userId || 'guest'}`;

// Parse timestamp from backend (LocalDateTime, no timezone) as UTC
const parseTs = (ts) => {
  if (!ts) return new Date();
  if (typeof ts === 'string' && !ts.endsWith('Z') && !ts.includes('+') && !ts.includes('-', 10)) {
    return new Date(ts + 'Z');
  }
  return new Date(ts);
};

// Stable unique key for a notification
const notifUid = (n) => {
  if (n.uid) return n.uid;
  return `${n.type}:${n.relatedId || n.referenceId || n.id || n.title}`;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;

  // Reset & reload notifications whenever userId changes (login/logout/switch user)
  useEffect(() => {
    const STORAGE_KEY = storageKey(userId);
    const DISMISSED_KEY = dismissedKey(userId);

    // Reset state immediately when user changes
    setNotifications([]);
    setUnreadCount(0);

    // If no user (logged out), don't fetch anything
    if (!userId) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    let localNotifs = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const uidsSeen = new Set();
        // Migrate old entries that lack uid and dedup
        localNotifs = parsed.map(n => ({
          ...n,
          uid: n.uid || notifUid({ type: n.type, relatedId: n.relatedId || n.id, title: n.title, id: n.id }),
        })).filter(n => {
          if (uidsSeen.has(n.uid)) return false;
          uidsSeen.add(n.uid);
          return true;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotifs));
      } catch (e) {}
    }
    setNotifications(localNotifs.filter(n => !n.hidden));
    setUnreadCount(localNotifs.filter(n => !n.read && !n.hidden).length);

    // Get dismissed UIDs so we don't re-show cleared notifications
    let dismissedUids = new Set();
    try {
      const d = localStorage.getItem(DISMISSED_KEY);
      if (d) dismissedUids = new Set(JSON.parse(d));
    } catch (e) {}


    // Fetch historical notifications from server
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(prev => {
          // Build a map of existing UIDs from local state (including hidden)
          const savedAll = (() => {
            try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
          })();
          const existingUids = new Set(savedAll.map(n => notifUid(n)));

          let updatedLocal = [...savedAll];
          let hasNew = false;

          data.forEach(serverNotif => {
            const uid = notifUid(serverNotif);
            // Skip if already known OR if user has dismissed it
            if (existingUids.has(uid) || dismissedUids.has(uid)) return;

            hasNew = true;
            existingUids.add(uid);
            updatedLocal.push({
              id: serverNotif.relatedId || serverNotif.id,
              relatedId: serverNotif.relatedId,
              uid,
              title: serverNotif.type === 'NEW_ARTICLE'
                ? serverNotif.title.replace(/^Bài báo mới:\s*/i, '')
                : serverNotif.title,
              type: serverNotif.type,
              timestamp: parseTs(serverNotif.createdAt).toISOString(),
              read: false,
              hidden: false,
              imageUrl: null,
            });
          });

          if (!hasNew) return prev;

          updatedLocal.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          updatedLocal = updatedLocal.slice(0, 30);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocal));

          const visible = updatedLocal.filter(n => !n.hidden);
          setUnreadCount(visible.filter(n => !n.read).length);
          return visible;
        });
      })
      .catch(err => console.warn('Failed to fetch historical notifications:', err));
  }, [userId]);

  const addNotification = useCallback((notif) => {
    const STORAGE_KEY = storageKey(userId);
    const DISMISSED_KEY = dismissedKey(userId);
    const uid = notifUid(notif);

    // Check if already dismissed
    try {
      const d = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
      if (d.includes(uid)) return;
    } catch (e) {}

    const newNotif = {
      ...notif,
      uid,
      timestamp: new Date().toISOString(),
      read: false,
      hidden: false,
    };

    setNotifications(prev => {
      if (prev.some(n => n.uid === uid)) return prev;

      const updated = [newNotif, ...prev.slice(0, 29)];
      setUnreadCount(updated.filter(n => !n.read).length);

      // Persist (include hidden) for dedup on next load
      const savedAll = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
      })();
      const merged = [newNotif, ...savedAll.filter(n => n.uid !== uid)].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return updated;
    });
  }, [userId]);

  const markAllAsRead = useCallback(() => {
    const STORAGE_KEY = storageKey(userId);
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      setUnreadCount(0);
      const savedAll = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
      })();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAll.map(n => ({ ...n, read: true }))));
      return updated;
    });
  }, [userId]);

  const markAsRead = useCallback((id) => {
    const STORAGE_KEY = storageKey(userId);
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setUnreadCount(updated.filter(n => !n.read).length);
      const savedAll = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
      })();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAll.map(n => n.id === id ? { ...n, read: true } : n)));
      return updated;
    });
  }, [userId]);

  const clearAll = useCallback(() => {
    const STORAGE_KEY = storageKey(userId);
    const DISMISSED_KEY = dismissedKey(userId);
    setNotifications(prev => {
      // Persist dismissed UIDs so server history doesn't resurrect them
      const uids = prev.map(n => n.uid || notifUid(n)).filter(Boolean);
      try {
        const existing = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
        const merged = [...new Set([...existing, ...uids])];
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(merged));
      } catch (e) {}

      // Mark all as hidden in storage
      const savedAll = (() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
      })();
      const updated = savedAll.map(n => ({ ...n, hidden: true, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setUnreadCount(0);
      return [];
    });
  }, [userId]);

  // SSE subscription
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/subscribe');

    eventSource.addEventListener('INIT', (event) => {
      console.log('SSE Connected:', event.data);
    });

    eventSource.addEventListener('NEW_ARTICLE', (event) => {
      try {
        const article = JSON.parse(event.data);

        addNotification({
          id: String(article.id),
          relatedId: String(article.id),
          title: article.title,
          imageUrl: article.imageUrl,
          type: 'NEW_ARTICLE',
        });

        notification.open({
          message: (
            <span className="font-black text-slate-950 dark:text-slate-50 uppercase tracking-widest text-[10px]">
              📰 TIN BÁO MỚI CẬP NHẬT
            </span>
          ),
          description: (
            <div className="flex gap-3.5 items-start mt-2">
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-14 h-14 object-cover rounded-xl shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm"
                />
              )}
              <div className="flex-grow min-w-0">
                <h4 className="font-kanji text-xs font-bold text-slate-950 dark:text-slate-50 line-clamp-2 leading-snug">
                  {article.title}
                </h4>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 mt-2 uppercase tracking-wider">
                  Chạm để đọc bài viết ngay →
                </p>
              </div>
            </div>
          ),
          placement: 'bottomRight',
          duration: 12,
          className: 'premium-sse-notification border border-slate-100/10 dark:border-slate-800/50 rounded-3xl shadow-2xl bg-white dark:bg-slate-900',
          onClick: () => {
            navigate(`/news/${article.id}`);
            notification.destroy();
          },
          style: { cursor: 'pointer', borderRadius: '1.5rem' },
        });
      } catch (err) {
        console.error('Error parsing SSE NEW_ARTICLE payload:', err);
      }
    });

    eventSource.addEventListener('SYSTEM', (event) => {
      addNotification({
        id: `system-${Date.now()}`,
        relatedId: null,
        title: event.data,
        type: 'SYSTEM',
      });

      notification.info({
        message: 'Thông báo hệ thống',
        description: event.data,
        placement: 'bottomRight',
        duration: 6,
      });
    });

    eventSource.addEventListener('DATA_CHANGED', (event) => {
      window.dispatchEvent(new CustomEvent('GLOBAL_DATA_CHANGED', { detail: event.data }));
      const channel = new BroadcastChannel('nihongo-sync-channel');
      channel.postMessage({ type: 'DATA_CHANGED', payload: event.data });
      channel.close();
    });

    eventSource.onerror = () => {
      // Silently retry — browser handles reconnect automatically
    };

    return () => eventSource.close();
  }, [navigate, addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
