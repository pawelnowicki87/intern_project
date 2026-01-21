'use client';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { coreApi, notificationsApi } from '@/lib/api';
import { navigateForNotification } from './nav';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type NotificationItem = {
  id: number;
  recipientId: number;
  senderId: number;
  action: string;
  targetId: number;
  isRead: boolean;
  createdAt: string | Date;
};

type UserLite = {
  id: number;
  username: string;
  avatarUrl?: string | null;
};

const formatAction = (action?: string) => {
  switch (action) {
    case 'FOLLOW_REQUEST':
      return 'sent a follow request';
    case 'FOLLOW_ACCEPTED':
      return 'accepted your request';
    case 'FOLLOW_REJECTED':
      return 'rejected your request';
    case 'MENTION_POST':
      return 'mentioned you in a post';
    case 'MENTION_COMMENT':
      return 'mentioned you in a comment';
    case 'COMMENT_POST':
      return 'commented on your post';
    case 'COMMENT_REPLY':
      return 'replied to your comment';
    case 'MESSAGE_RECEIVED':
      return 'sent you a message';
    default:
      return action ?? 'notification';
  }
};

const formatTimeAgo = (dateValue: string | Date) => {
  const date = typeof dateValue === 'string'
    ? (() => {
      const raw = dateValue.trim();
      const hasTZ = /Z|[+-]\d{2}:\d{2}$/.test(raw);
      const iso = raw.includes('T') ? raw : raw.replace(' ', 'T');
      const normalized = hasTZ ? iso : `${iso}Z`;
      return new Date(normalized);
    })()
    : dateValue;
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 90) return 'now';

  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;

  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [usersById, setUsersById] = useState<Record<number, UserLite>>({});
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);
  const usersByIdRef = useRef<Record<number, UserLite>>({});
  const inFlightRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    usersByIdRef.current = usersById;
  }, [usersById]);

  const ensureUsersLoaded = useCallback(
    async (notifications: NotificationItem[]) => {
      if (!user?.id) return;
      const ids = Array.from(new Set(notifications.map((n) => n.senderId).filter(Boolean)));
      const missing = ids.filter(
        (id) => !usersByIdRef.current[id] && !inFlightRef.current.has(id),
      );
      if (missing.length === 0) return;

      missing.forEach((id) => inFlightRef.current.add(id));
      const entries = await Promise.all(
        missing.map(async (id) => {
          try {
            const res = await coreApi.get<UserLite>(`/users/${id}?viewerId=${user.id}`);
            const u = res.data;
            const username = u?.username ?? `user_${id}`;
            const avatarUrl = (u as any)?.avatarUrl ?? null;
            return [id, { id, username, avatarUrl }] as const;
          } catch {
            return [id, { id, username: `user_${id}`, avatarUrl: null }] as const;
          } finally {
            inFlightRef.current.delete(id);
          }
        }),
      );

      const next: Record<number, UserLite> = {};
      entries.forEach(([id, u]) => {
        next[id] = u;
      });
      setUsersById((prev) => ({ ...prev, ...next }));
    },
    [user?.id],
  );

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await notificationsApi.get(`/notifications/user/${user.id}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setLoadError(null);
      await ensureUsersLoaded(data);
    } catch {
      setLoadError('Failed to fetch notifications. Make sure the notifications service is running.');
      setItems([]);
    }
  }, [ensureUsersLoaded, user?.id]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await fetchNotifications();
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    const run = async () => {
      await fetchNotifications();
    };
    run();
    const id = window.setInterval(() => {
      if (!alive) return;
      run();
    }, 20000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [fetchNotifications, user?.id]);

  const handleFollowRequest = async (
    e: React.MouseEvent,
    notificationId: number,
    senderId: number,
    accept: boolean,
  ) => {
    e.stopPropagation();
    setProcessingRequest(notificationId);
    
    try {
      await coreApi.patch(`/follows/${senderId}/${user?.id}/${accept ? 'accept' : 'reject'}`);

      // Mark notification as read
      await notificationsApi.put(`/notifications/${notificationId}`, { isRead: true });

      // Remove the notification from the list
      setItems((prev) => prev.filter((x) => x.id !== notificationId));
    } catch (error) {
      console.error('Error handling follow request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const unreadIds = items.filter((n) => !n.isRead).map((n) => n.id);
      
      await Promise.all(
        unreadIds.map((id) =>
          notificationsApi.put(`/notifications/${id}`, { isRead: true }),
        ),
      );

      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  return (
    <div className="relative">
      <button 
        onClick={toggle} 
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                <Link
                  href="/notifications"
                  onClick={() => setOpen(false)}
                  className="text-white text-xs hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors duration-200"
                >
                  See all
                </Link>
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-white text-xs hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  type="button"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              </div>
            </div>
            
            <div className="max-h-[32rem] overflow-y-auto">
              {loadError ? (
                <div className="p-6 text-sm text-gray-600">
                  {loadError}
                </div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No notifications</p>
                </div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={[
                      'relative border-b border-gray-100 transition-all duration-200',
                      n.isRead ? 'bg-white' : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50',
                    ].join(' ')}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500" />
                    )}
                    
                    <button
                      onClick={async () => {
                        if (!n.isRead) {
                          try {
                            await notificationsApi.put(`/notifications/${n.id}`, { isRead: true });
                            setItems((prev) =>
                              prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
                            );
                          } catch {
                            return;
                          }
                        }
                        await navigateForNotification(router, n);
                        setOpen(false);
                      }}
                      className="w-full text-left p-4 hover:bg-gray-50/50 transition-colors duration-200"
                      disabled={processingRequest === n.id}
                    >
                      <div className="flex items-start gap-3">
                        {usersById[n.senderId]?.avatarUrl ? (
                          <img
                            src={usersById[n.senderId]!.avatarUrl!}
                            alt={usersById[n.senderId]!.username}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {(usersById[n.senderId]?.username ?? `user_${n.senderId}`)[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-sm mb-1">
                            <span className="font-bold text-gray-900">
                              {usersById[n.senderId]?.username ?? `user_${n.senderId}`}
                            </span>{' '}
                            <span className="text-gray-600">
                              {formatAction(n.action)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>{formatTimeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {n.action === 'FOLLOW_REQUEST' && (
                      <div className="px-4 pb-3 flex gap-2">
                        <button
                          onClick={(e) => handleFollowRequest(e, n.id, n.senderId, true)}
                          disabled={processingRequest === n.id}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleFollowRequest(e, n.id, n.senderId, false)}
                          disabled={processingRequest === n.id}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
