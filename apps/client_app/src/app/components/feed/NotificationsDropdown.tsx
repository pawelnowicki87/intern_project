import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, Bell } from 'lucide-react';
import { useAuth } from '@/client_app/context/AuthContext';
import { notificationsApi, coreApi } from '@/client_app/lib/api';

interface Notification {
  id: number;
  type: 'like_post' | 'like_comment' | 'comment' | 'reply' | 'mention' | 'follow';
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  post?: {
    id: number;
    imageUrl: string;
  };
  comment?: {
    id: number;
    text: string;
    commentCount?: number;
  };
  createdAt: string;
  isRead: boolean;
}

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const [expandedNotifs, setExpandedNotifs] = useState<Set<number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;
      try {
        const res = await notificationsApi.get<{
          id: number;
          recipientId: number;
          senderId: number;
          action: 'FOLLOW_REQUEST' | 'FOLLOW_ACCEPTED' | 'FOLLOW_REJECTED' | 'MENTION_COMMENT' | 'MENTION_POST';
          targetId: number;
          isRead: boolean;
          createdAt: string;
        }[]>(`/notifications/user/${user.id}`);

        const items = res.data ?? [];

        const mapped = await Promise.all(
          items.map(async (n) => {
            try {
              const sender = await coreApi.get(`/users/${n.senderId}`, {
                params: { viewerId: user.id },
              });
              const senderUser = sender.data as {
                id: number;
                username: string;
                avatarUrl?: string | null;
              };

              const type: Notification['type'] =
                n.action === 'MENTION_COMMENT' || n.action === 'MENTION_POST'
                  ? 'mention'
                  : 'follow';

              return {
                id: n.id,
                type,
                user: {
                  id: senderUser.id,
                  username: senderUser.username,
                  avatarUrl: senderUser.avatarUrl ?? undefined,
                },
                createdAt: n.createdAt,
                isRead: n.isRead,
              } as Notification;
            } catch {
              return {
                id: n.id,
                type: n.action === 'MENTION_COMMENT' || n.action === 'MENTION_POST' ? 'mention' : 'follow',
                user: {
                  id: n.senderId,
                  username: `user_${n.senderId}`,
                },
                createdAt: n.createdAt,
                isRead: n.isRead,
              } as Notification;
            }
          }),
        );

        setNotifications(mapped);
      } catch {
        setNotifications([]);
      }
    };
    loadNotifications();
  }, [user?.id]);

  const handleAcceptFollow = async (notifId: number, followerId: number) => {
    if (!user?.id) return;
    try {
      await coreApi.patch(`/follows/${followerId}/${user.id}/accept`);
      try {
        await notificationsApi.put(`/notifications/${notifId}`, { isRead: true });
      } catch {}
      setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
    } catch {
      // noop
    }
  };

  const handleRejectFollow = async (notifId: number, followerId: number) => {
    if (!user?.id) return;
    try {
      await coreApi.patch(`/follows/${followerId}/${user.id}/reject`);
      try {
        await notificationsApi.put(`/notifications/${notifId}`, { isRead: true });
      } catch {}
      setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
    } catch {
      // noop
    }
  };

  const toggleExpand = (notifId: number) => {
    setExpandedNotifs((prev) => {
      const next = new Set(prev);
      if (next.has(notifId)) {
        next.delete(notifId);
      } else {
        next.add(notifId);
      }
      return next;
    });
  };

  const markAsRead = async (notifId: number) => {
    try {
      await notificationsApi.put(`/notifications/${notifId}`, { isRead: true });
    } catch {}
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 90) return 'now';
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
  };

  const getNotificationText = (notif: Notification) => {
    switch (notif.type) {
      case 'mention':
        return 'wspomniano Cię';
      case 'follow':
        return 'prośba o obserwowanie';
      default:
        return 'powiadomienie';
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return <AtSign className="w-3 h-3 text-purple-500" />;
      case 'follow':
        return <UserPlus className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const todayNotifs = notifications.filter((n) => {
    const diff = Date.now() - new Date(n.createdAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  });

  const olderNotifs = notifications.filter((n) => {
    const diff = Date.now() - new Date(n.createdAt).getTime();
    return diff >= 24 * 60 * 60 * 1000;
  });

  const renderNotification = (notif: Notification) => {
    const isExpanded = expandedNotifs.has(notif.id);
    const canExpand = notif.type === 'comment' || notif.type === 'reply' || notif.type === 'mention';

    return (
      <div
        key={notif.id}
        className={`flex items-start gap-2 p-2 md:p-3 rounded-lg transition-all cursor-pointer ${
          !notif.isRead ? 'bg-blue-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => {
          if (!notif.isRead) markAsRead(notif.id);
          if (canExpand) toggleExpand(notif.id);
        }}
      >
        <div className="relative shrink-0">
          {notif.user.avatarUrl ? (
            <img
              src={notif.user.avatarUrl}
              alt={notif.user.username}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">
                {notif.user.username[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
            {getNotificationIcon(notif.type)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm">
                <span className="font-semibold">{notif.user.username}</span>{' '}
                <span className="text-gray-700">{getNotificationText(notif)}</span>
              </p>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                {formatTimeAgo(notif.createdAt)}
              </p>

              {isExpanded && notif.comment && (
                <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs md:text-sm text-gray-800">{notif.comment.text}</p>
                  {notif.comment.commentCount && notif.comment.commentCount > 0 && (
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                      {notif.comment.commentCount} {notif.comment.commentCount === 1 ? 'comment' : 'comments'}
                    </p>
                  )}
                </div>
              )}

              {notif.type === 'follow' && !notif.isRead && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptFollow(notif.id, notif.user.id);
                    }}
                    className="px-3 md:px-4 py-1 md:py-1.5 bg-blue-500 text-white text-[10px] md:text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectFollow(notif.id, notif.user.id);
                    }}
                    className="px-3 md:px-4 py-1 md:py-1.5 bg-gray-200 text-gray-700 text-[10px] md:text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>

            {notif.post && (
              <div className="shrink-0">
                <img
                  src={notif.post.imageUrl}
                  alt="Post"
                  className="w-9 h-9 md:w-10 md:h-10 object-cover rounded border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        {!notif.isRead && (
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 mt-1.5"></div>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-screen max-w-[calc(100vw-2rem)] md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="text-base md:text-lg font-bold">Notifications</h2>
            <button
              onClick={() =>
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
              }
              className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Mark all as read
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {todayNotifs.length > 0 && (
              <div className="p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Today</h3>
                <div className="space-y-1">{todayNotifs.map(renderNotification)}</div>
              </div>
            )}

            {olderNotifs.length > 0 && (
              <div className="p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Earlier</h3>
                <div className="space-y-1">{olderNotifs.map(renderNotification)}</div>
              </div>
            )}

            {notifications.length === 0 && (
              <div className="text-center py-8 md:py-12 px-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Heart className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">No notifications yet</h3>
                <p className="text-xs md:text-sm text-gray-500">
                  When someone likes or comments on your posts, you'll see it here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
