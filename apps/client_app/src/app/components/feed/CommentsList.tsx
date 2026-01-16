import { useEffect, useState } from 'react';
import { coreApi } from '@/client_app/lib/api';
import { useAuth } from '@/client_app/context/AuthContext';
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
          const res = await coreApi.post(`/likes-comments/check-liked`, {
            userId: user.id,
            commentIds: allIds,
          });
          const likedIds: number[] = res.data?.likedIds ?? [];
          likedIds.forEach((id: number) => likedSet.add(id));
        } catch {
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
    if (!text) return;
    try {
      await coreApi.patch(`/comments/${id}`, { body: text });
      const res = await coreApi.get<CommentResponse[]>(`/comments/post/${postId}`);
      setComments(res.data ?? []);
      setEditingId(null);
    } catch {
      setError('Failed to update comment');
    }
  };

  const deleteComment = async (id: number) => {
    try {
      await coreApi.delete(`/comments/${id}`);
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

  const renderReplyInput = (id: number) => {
    if (!replyOpen.has(id)) return null;
    return (
      <div className="mt-3 flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <input
          className="flex-1 text-sm px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          placeholder="Add a reply…"
          value={replyText[id] ?? ''}
          onChange={(e) => onReplyChange(id, e.target.value)}
        />
        <button
          className="text-sm px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => submitReply(id)}
        >
          Publish
        </button>
      </div>
    );
  };

  const submitReply = async (parentId: number) => {
    const text = (replyText[parentId] ?? '').trim();
    if (!text || !user?.id) return;
    try {
      await coreApi.post('/comments', {
        userId: user.id,
        postId,
        parentId,
        body: text,
      });
      setReplyText((prev) => ({ ...prev, [parentId]: '' }));
      setReplyOpen((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });
      const res = await coreApi.get<CommentResponse[]>(`/comments/post/${postId}`);
      setComments(res.data ?? []);
    } catch {
      setError('Failed to add reply');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading comments…</div>;
  }
  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((root) => {
        const replies = flattenToOneLevel(root.children ?? []);
        return (
          <div key={root.id} className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {root.user.avatarUrl ? (
                <img
                  src={root.user.avatarUrl}
                  alt="User avatar"
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-sm font-bold text-white">
                    {root.user.username?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/profile/${root.user.id}`}>
                    <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
                      {root.user.username}
                    </span>
                  </Link>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{formatTimeAgo(root.createdAt)}</span>
                </div>
                {editingId === root.id ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="flex-1 text-sm px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      value={editText[root.id] ?? root.body ?? ''}
                      onChange={(e) => onEditChange(root.id, e.target.value)}
                    />
                    <button
                      className="text-sm px-3 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => submitEdit(root.id)}
                    >
                      Save
                    </button>
                    <button
                      className="text-sm px-3 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-800 leading-relaxed break-words">
                    {root.body}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-3">
                  {editingId === root.id ? (
                    <>
                      <span className="text-xs text-gray-700 font-medium">{likeTextFor(root.id)}</span>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1"
                        onClick={() => toggleLikeComment(root.id)}
                      >
                        <Heart className={`w-4 h-4 ${likedByMe.has(root.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        Like
                      </button>
                      <span className="text-xs text-gray-700 font-medium">
                        {likeTextFor(root.id)}
                      </span>
                      {root.children?.length > 0 && (
                        <button
                          className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
                          onClick={() => toggleExpand(root.id)}
                        >
                          {expanded.has(root.id) ? '↑ Hide replies' : `↓ Show replies (${replies.length})`}
                        </button>
                      )}
                      <button
                        className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        onClick={() => toggleReply(root.id)}
                      >
                        💬 Reply
                      </button>
                      {user?.id === root.user.id && (
                        <>
                          <button
                            className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
                            onClick={() => startEdit(root.id, root.body)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                            onClick={() => deleteComment(root.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
                {renderReplyInput(root.id)}
              </div>
            </div>
            {replies.length > 0 && expanded.has(root.id) && (
              <div className="space-y-3 pl-12 border-l-2 border-gray-200 ml-5">
                {replies.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    {r.user.avatarUrl ? (
                      <img
                        src={r.user.avatarUrl}
                        alt="User avatar"
                        className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {r.user.username?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
                          Reply
                        </span>
                        <Link href={`/profile/${r.user.id}`}>
                          <span className="font-semibold text-sm text-gray-900 hover:underline cursor-pointer">
                            {r.user.username}
                          </span>
                        </Link>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(r.createdAt)}</span>
                      </div>
                      {editingId === r.id ? (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            className="flex-1 text-sm px-3 py-2 bg-white border border-gray-300 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={editText[r.id] ?? r.body ?? ''}
                            onChange={(e) => onEditChange(r.id, e.target.value)}
                          />
                          <button
                            className="text-sm px-3 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                            onClick={() => submitEdit(r.id)}
                          >
                            Save
                          </button>
                          <button
                            className="text-sm px-3 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-800 leading-relaxed break-words">
                          {r.body}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        {editingId === r.id ? (
                          <span className="text-xs text-gray-700 font-medium">
                            {likeTextFor(r.id)}
                          </span>
                        ) : (
                          <>
                            <button
                              className="text-xs font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1"
                              onClick={() => toggleLikeComment(r.id)}
                            >
                              <Heart className={`w-4 h-4 ${likedByMe.has(r.id) ? 'fill-red-500 text-red-500' : ''}`} />
                              Like
                            </button>
                            <span className="text-xs text-gray-700 font-medium">
                              {likeTextFor(r.id)}
                            </span>
                            <button
                              className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
                              onClick={() => toggleReply(r.id)}
                            >
                              💬 Reply
                            </button>
                            {user?.id === r.user.id && (
                              <>
                                <button
                                  className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
                                  onClick={() => startEdit(r.id, r.body)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                                  onClick={() => deleteComment(r.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                      {renderReplyInput(r.id)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
