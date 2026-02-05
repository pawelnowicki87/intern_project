'use client';

import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { coreApi, notificationsApi } from '@/lib/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { navigateForNotification } from '@/components/nav';
import { useRouter } from 'next/navigation';
import { NotificationAction } from '@/lib/notification-action';

type NotificationItem = {
  id: number;
  recipientId: number;
  senderId: number;
  action: NotificationAction | string;
  targetId: number;
  isRead: boolean;
  createdAt: string | Date;
};

type UserLite = {
  id: number;
  username: string;
  avatarUrl?: string | null;
};

const formatAction = (action?: NotificationAction | string) => {
  switch (action) {
    case NotificationAction.FOLLOW_REQUEST:
      return 'sent a follow request';
    case NotificationAction.FOLLOW_ACCEPTED:
      return 'accepted your request';
    case NotificationAction.FOLLOW_REJECTED:
      return 'rejected your request';
    case NotificationAction.MENTION_POST:
      return 'mentioned you in a post';
    case NotificationAction.MENTION_COMMENT:
      return 'mentioned you in a comment';
    case NotificationAction.COMMENT_POST:
      return 'commented on your post';
    case NotificationAction.COMMENT_REPLY:
      return 'replied to your comment';
    case NotificationAction.MESSAGE_RECEIVED:
      return 'sent you a message';
    case NotificationAction.MESSAGE_GROUP_RECEIVED:
      return 'sent a message in a group';
    case NotificationAction.LIKE_POST:
      return 'liked your post';
    case NotificationAction.LIKE_COMMENT:
      return 'liked your comment';
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

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [usersById, setUsersById] = useState<Record<number, UserLite>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const usersByIdRef = useRef<Record<number, UserLite>>({});
  const inFlightRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    usersByIdRef.current = usersById;
  }, [usersById]);

  const ensureUsersLoaded = useCallback(async (notifs: NotificationItem[]) => {
    const ids = Array.from(new Set(notifs.map((n) => n.senderId))).filter(Boolean);
    const missing = ids.filter((id) => !usersByIdRef.current[id] && !inFlightRef.current.has(id));
    if (!missing.length) return;

    missing.forEach((id) => inFlightRef.current.add(id));

    const entries = await Promise.all(
      missing.map(async (id) => {
        try {
          const res = await coreApi.get(`/users/${id}`);
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
  }, []);

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

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const markAllAsRead = async () => {
    if (!user?.id) return;
    const unreadIds = items.filter((n) => !n.isRead).map((n) => n.id);
    if (!unreadIds.length) return;

    try {
      await Promise.all(unreadIds.map((id) => notificationsApi.put(`/notifications/${id}`, { isRead: true })));
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    } catch {
      await fetchNotifications();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header onCreatePost={() => void 0} />
        <main className="max-w-[935px] mx-auto px-4 py-6">
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-between">
              <h1 className="text-white font-bold text-lg">Notifications</h1>
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

            {loadError ? (
              <div className="p-6 text-sm text-gray-600">{loadError}</div>
            ) : items.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            ) : (
              <div>
                {items.map((n) => {
                  const sender = usersById[n.senderId];
                  const senderName = sender?.username ?? `user_${n.senderId}`;
                  const senderAvatar = sender?.avatarUrl ?? null;
                  return (
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
                              setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
                            } catch {
                              await fetchNotifications();
                            }
                          }
                          await navigateForNotification(router, n);
                        }}
                        className="w-full text-left p-4 hover:bg-gray-50/50 transition-colors duration-200"
                        type="button"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-gradient-to-br from-blue-500 to-pink-500">
                            {senderAvatar ? (
                              <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {senderName?.[0]?.toUpperCase() ?? 'U'}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-sm">
                              <span className="font-semibold">{senderName}</span>{' '}
                              <span className="text-gray-700">{formatAction(n.action)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(n.createdAt)}</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
