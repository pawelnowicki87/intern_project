import { useEffect, useState } from 'react';
import { coreApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Heart } from 'lucide-react';

interface CommentUser {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface CommentPostRef {
  id: number;
  title?: string;
}

interface CommentResponse {
  id: number;
  body?: string;
  createdAt: string;
  updatedAt: string;
  parentId?: number;
  children: CommentResponse[];
  user: CommentUser;
  post: CommentPostRef;
}

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 90) return 'now';
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} wk`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo`;
  const years = Math.floor(days / 365);
  return `${years} y`;
};

const flattenToOneLevel = (nodes: CommentResponse[]): CommentResponse[] => {
  const res: CommentResponse[] = [];
  const stack = [...nodes];
  while (stack.length) {
    const n = stack.shift()!;
    res.push({ ...n, children: [] });
    if (n.children?.length) stack.push(...n.children);
  }
  return res;
};

export default function CommentsList({
  postId,
  refreshKey = 0,
  onCountChange,
}: {
  postId: number;
  refreshKey?: number;
  onCountChange?: (count: number) => void;
}) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [replyOpen, setReplyOpen] = useState<Set<number>>(new Set());
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [commentLikes, setCommentLikes] = useState<Record<number, number>>({});
  const [likedByMe, setLikedByMe] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<Record<number, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    coreApi
      .get<CommentResponse[]>(`/comments/post/${postId}`)
      .then((res) => {
        if (!mounted) return;
        const roots = res.data ?? [];
        setComments(roots);
        if (onCountChange) {
          const total = roots.reduce((acc, r) => acc + 1 + flattenToOneLevel(r.children ?? []).length, 0);
          onCountChange(total);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load comments');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [postId, refreshKey]);

  useEffect(() => {
    if (!onCountChange) return;
    const total = comments.reduce((acc, r) => {
      const childCount = flattenToOneLevel(r.children ?? []).length;
      return acc + 1 + childCount;
    }, 0);
    onCountChange(total);
  }, [comments, onCountChange]);

  useEffect(() => {
    const fetchLikesInfo = async () => {
      const allIds: number[] = [];
      comments.forEach((root) => {
        allIds.push(root.id);
        const childIds = flattenToOneLevel(root.children ?? []).map((c) => c.id);
        allIds.push(...childIds);
      });
      if (allIds.length === 0) return;
      const countsEntries: Array<[number, number]> = [];
      const likedSet = new Set<number>();
      await Promise.all(
        allIds.map(async (id) => {
          try {
            const countRes = await coreApi.get<number>(`/likes-comments/comment/${id}/count`);
            countsEntries.push([id, countRes.data ?? 0]);
          } catch {
            countsEntries.push([id, 0]);
          }
        }),
      );
      if (user?.id) {
        try {
          const res = await coreApi.post('/likes-comments/check-liked', {
            userId: user.id,
            commentIds: allIds,
          });
          const likedIds: number[] = res.data?.likedIds ?? [];
          likedIds.forEach((id: number) => likedSet.add(id));
        } catch (err) {
          console.error('Failed to check liked comments', err);
        }
      }
      const countsObj: Record<number, number> = {};
      countsEntries.forEach(([id, cnt]) => {
        countsObj[id] = cnt;
      });
      setCommentLikes(countsObj);
      setLikedByMe(likedSet);
    };
    fetchLikesInfo();
  }, [comments, user?.id]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleReply = (id: number) => {
    setReplyOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onReplyChange = (id: number, value: string) => {
    setReplyText((prev) => ({ ...prev, [id]: value }));
  };

  const startEdit = (id: number, currentBody?: string) => {
    setEditingId(id);
    setEditText((prev) => ({ ...prev, [id]: currentBody ?? '' }));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const onEditChange = (id: number, value: string) => {
    setEditText((prev) => ({ ...prev, [id]: value }));
  };

  const submitEdit = async (id: number) => {
    const text = (editText[id] ?? '').trim();
    if (!text || !user?.id) return;
    try {
      await coreApi.patch(`/comments/${id}`, { body: text, userId: user.id });
      const res = await coreApi.get<CommentResponse[]>(`/comments/post/${postId}`);
      setComments(res.data ?? []);
      setEditingId(null);
    } catch {
      setError('Failed to update comment');
    }
  };

  const deleteComment = async (id: number) => {
    if (!user?.id) return;
    try {
      await coreApi.delete(`/comments/${id}`, { data: { userId: user.id } });
      const res = await coreApi.get<CommentResponse[]>(`/comments/post/${postId}`);
      setComments(res.data ?? []);
      if (editingId === id) setEditingId(null);
    } catch {
      setError('Failed to delete comment');
    }
  };

  const toggleLikeComment = async (id: number) => {
    if (!user?.id) return;
    try {
      const res = await coreApi.post<{ liked: boolean }>(
        '/likes-comments/toggle',
        { userId: user.id, commentId: id },
      );
      const liked = res.data?.liked === true;
      setLikedByMe((prev) => {
        const next = new Set(prev);
        if (liked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
      setCommentLikes((prev) => {
        const curr = prev[id] ?? 0;
        const nextCount = liked ? curr + 1 : Math.max(0, curr - 1);
        return { ...prev, [id]: nextCount };
      });
    } catch {
      console.debug('toggle like failed');
    }
  };

  const likeTextFor = (id: number) => {
    const count = commentLikes[id] ?? 0;
    const me = likedByMe.has(id);
    if (!me && count === 0) return '0 people like this comment';
    if (me && count === 1) return 'You like this comment';
    if (me && count > 1) return `You and ${(count - 1).toLocaleString()} people like this comment`;
    if (!me && count > 0) return `${count.toLocaleString()} people like this comment`;
    return '';
  };

  const renderReplyInput = (comment: CommentResponse) => {
    if (!replyOpen.has(comment.id)) return null;
    return (
      <div className="mt-3 flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <input
          className="flex-1 text-sm px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          placeholder="Add a reply…"
          value={replyText[comment.id] ?? ''}
          onChange={(e) => onReplyChange(comment.id, e.target.value)}
        />
        <button
          className="text-sm px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => submitReply(comment)}
        >
          Publish
        </button>
      </div>
    );
  };

  const submitReply = async (comment: CommentResponse) => {
    const text = (replyText[comment.id] ?? '').trim();
    if (!text || !user?.id) return;
    const parentId = comment.parentId ?? comment.id;
    const mentionPrefix = `@${comment.user.username}`;
    const hasMentionPrefix = text.startsWith(mentionPrefix)
      && (text.length === mentionPrefix.length || /\s/.test(text[mentionPrefix.length]));
    const body = hasMentionPrefix ? text : `${mentionPrefix} ${text}`;
    try {
      await coreApi.post('/comments', {
        userId: user.id,
        postId,
        parentId,
        body,
      });
      const res = await coreApi.get<CommentResponse[]>(`/comments/post/${postId}`);
      setComments(res.data ?? []);
      setReplyText((prev) => ({ ...prev, [comment.id]: '' }));
      setReplyOpen((prev) => {
        const next = new Set(prev);
        next.delete(comment.id);
        return next;
      });
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });
    } catch {
      setError('Failed to publish reply');
    }
  };

  const renderComment = (c: CommentResponse) => {
    const isExpanded = expanded.has(c.id);
    const likeText = likeTextFor(c.id);
    const isOwner = user?.id === c.user.id;
    const replyCount = flattenToOneLevel(c.children ?? []).length;
    const isRoot = !c.parentId;
    return (
      <div key={c.id} className="py-2">
        <div className="flex items-start gap-3">
          {c.user.avatarUrl ? (
            <img
              src={c.user.avatarUrl}
              alt={c.user.username}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {c.user.username[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm">
              <Link href={`/profile/${c.user.id}`} className="font-semibold hover:underline">
                {c.user.username}
              </Link>{' '}
              {c.body}
            </div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
              <span>{formatTimeAgo(c.createdAt)}</span>
              <button
                className="text-gray-600 hover:text-black transition-colors"
                onClick={() => toggleLikeComment(c.id)}
              >
                <Heart className={`inline w-3 h-3 ${likedByMe.has(c.id) ? 'fill-red-500 text-red-500' : ''}`} /> Like
              </button>
              <button className="hover:underline" onClick={() => toggleReply(c.id)}>Reply</button>
              {likeText && <span className="text-gray-700">{likeText}</span>}
              {isRoot && (
                <button className="hover:underline" onClick={() => toggleExpand(c.id)}>
                  {isExpanded ? 'Hide replies' : `${replyCount} replies`}
                </button>
              )}
              {isOwner && (
                <button className="text-red-600 hover:underline" onClick={() => deleteComment(c.id)}>Delete</button>
              )}
              {isOwner && (
                <button className="hover:underline" onClick={() => startEdit(c.id, c.body)}>Edit</button>
              )}
            </div>
            {renderReplyInput(c)}
            {editingId === c.id && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="flex-1 text-sm px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={editText[c.id] ?? ''}
                  onChange={(e) => onEditChange(c.id, e.target.value)}
                />
                <button
                  className="text-sm px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => submitEdit(c.id)}
                >
                  Save
                </button>
                <button className="text-sm px-3 py-2 text-gray-600" onClick={cancelEdit}>Cancel</button>
              </div>
            )}
            {isExpanded && c.children.length > 0 && (
              <div className="mt-2 pl-10 space-y-2">
                {flattenToOneLevel(c.children).map((child) => renderComment(child))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-3 md:p-4">
      {loading && <div className="text-sm text-gray-500">Loading comments...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && comments.length === 0 && (
        <div className="text-sm text-gray-500">No comments to display</div>
      )}
      {!loading && comments.map((c) => renderComment(c))}
    </div>
  );
}
