import { coreApi } from '@/lib/api';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const navigateToChat = (router: AppRouterInstance, userId?: number) => {
  if (userId) {
    router.push(`/chat?userId=${userId}`);
  } else {
    router.push('/chat');
  }
};

export const navigateToPostFromComment = async (router: AppRouterInstance, commentId: number) => {
  try {
    const res = await coreApi.get(`/comments/${commentId}`);
    const postId = res.data?.post?.id;
    if (postId) {
      router.push(`/posts/${postId}`);
    }
  } catch (err) {
    console.error('Failed to navigate from comment', err);
  }
};

type NotificationFromApi = {
  id?: number;
  recipientId?: number;
  senderId?: number;
  action?:
    | 'FOLLOW_REQUEST'
    | 'FOLLOW_ACCEPTED'
    | 'FOLLOW_REJECTED'
    | 'MENTION_COMMENT'
    | 'MENTION_POST'
    | 'MESSAGE_RECEIVED'
    | 'FOLLOW_STARTED'
    | string;
  targetId?: number;
  isRead?: boolean;
  createdAt?: string | Date;
};

type NotificationLegacy = {
  action?: NotificationFromApi['action'];
  type?: 'like_post' | 'like_comment' | 'comment' | 'reply' | 'mention' | 'follow' | 'message';
  targetId?: number;
  user?: { id: number };
  post?: { id: number };
  comment?: { id: number };
};

export const navigateForNotification = async (
  router: AppRouterInstance,
  notif: NotificationFromApi | NotificationLegacy,
) => {
  const senderUserId =
    'user' in notif ? notif.user?.id : ('senderId' in notif ? notif.senderId : undefined);

  if (notif.action === 'MESSAGE_RECEIVED') {
    navigateToChat(router, senderUserId);
    return;
  }
  if (notif.action === 'MENTION_POST' && notif.targetId) {
    router.push(`/posts/${notif.targetId}`);
    return;
  }
  if (notif.action === 'MENTION_COMMENT' && notif.targetId) {
    await navigateToPostFromComment(router, notif.targetId);
    return;
  }
  if (notif.action && notif.action.startsWith('FOLLOW')) {
    const id = senderUserId ?? notif.targetId;
    if (id) router.push(`/profile/${id}`);
    return;
  }

  if ('type' in notif) {
    if (notif.type === 'follow' && senderUserId) {
      router.push(`/profile/${senderUserId}`);
      return;
    }
    if (notif.type === 'like_post' && notif.post?.id) {
      router.push(`/posts/${notif.post.id}`);
      return;
    }
    if (notif.type === 'like_comment' && notif.comment?.id) {
      await navigateToPostFromComment(router, notif.comment.id);
      return;
    }
  }
};
