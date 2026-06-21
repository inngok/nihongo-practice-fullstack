import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Load notifications from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nihongo_notifications_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        console.error(e);
      }
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  const addNotification = useCallback((notif) => {
    const newNotif = {
      ...notif,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => {
      // Avoid duplicate notifications for the same article ID
      if (prev.some(n => n.id === notif.id && n.type === notif.type)) {
        return prev;
      }
      const updated = [newNotif, ...prev.slice(0, 19)];
      setUnreadCount(updated.filter(n => !n.read).length);
      localStorage.setItem('nihongo_notifications_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      setUnreadCount(0);
      localStorage.setItem('nihongo_notifications_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setUnreadCount(updated.filter(n => !n.read).length);
      localStorage.setItem('nihongo_notifications_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('nihongo_notifications_history');
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/subscribe');

    eventSource.addEventListener('INIT', (event) => {
      console.log('SSE Handshake:', event.data);
    });

    eventSource.addEventListener('NEW_ARTICLE', (event) => {
      try {
        const article = JSON.parse(event.data);
        
        // Add to history
        addNotification({
          id: article.id,
          title: article.title,
          imageUrl: article.imageUrl,
          type: 'NEW_ARTICLE'
        });

        // Trigger Toast Notification
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
          className: 'premium-sse-notification border border-slate-100/10 dark:border-slate-800/50 rounded-3xl p-5 shadow-2xl bg-white dark:bg-slate-900',
          onClick: () => {
            navigate(`/news/${article.id}`);
            notification.destroy();
          },
          style: {
            cursor: 'pointer',
            borderRadius: '1.5rem',
          }
        });
      } catch (err) {
        console.error('Error parsing SSE notification payload:', err);
      }
    });

    eventSource.addEventListener('SYSTEM', (event) => {
      addNotification({
        id: Date.now(),
        title: event.data,
        type: 'SYSTEM'
      });

      notification.info({
        message: 'Thông báo hệ thống',
        description: event.data,
        placement: 'bottomRight',
        duration: 6,
      });
    });

    eventSource.addEventListener('DATA_CHANGED', (event) => {
      // Fire a custom global event so any component can listen and refetch data
      window.dispatchEvent(new CustomEvent('GLOBAL_DATA_CHANGED', { detail: event.data }));
      // Optionally fire the BroadcastChannel if needed for multi-tab
      const channel = new BroadcastChannel('nihongo-sync-channel');
      channel.postMessage({ type: 'DATA_CHANGED', payload: event.data });
      channel.close();
    });

    eventSource.onerror = (err) => {
      console.warn('SSE connection interrupted, retrying...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [navigate, addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
