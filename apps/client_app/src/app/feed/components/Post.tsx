'use client';

import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/client_app/context/AuthContext';
import { coreApi } from '@/client_app/lib/api';
import CommentsList from './CommentsList';
import Link from 'next/link';

interface PostAsset {
  id: number;
  url: string;
  type?: string;
}

interface PostProps {
  post: {
    id: number;
    body: string;
    assets: PostAsset[];
    user: {
      id: number;
      username: string;
      avatarUrl?: string | null;
    };
    createdAt: string;
    likes: number;
    comments: number;
    timeAgo: string;
  };
  onChanged?: () => void;
  onEdit?: (post: PostProps['post']) => void;
}

export default function Post({ post, onChanged, onEdit }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [likesCount, setLikesCount] = useState<number>(post.likes ?? 0);
  const { user } = useAuth();

  const canManage = user?.id === post.user.id;

  useEffect(() => {
    let mounted = true;
    const loadLiked = async () => {
      if (!user?.id || !post?.id) return;
      try {
        await coreApi.get(`/likes-posts/${user.id}/${post.id}`);
        if (mounted) setIsLiked(true);
      } catch {
        if (mounted) setIsLiked(false);
      }
    };
    loadLiked();
    return () => {
      mounted = false;
    };
  }, [user?.id, post?.id]);

  const toggleLike = async () => {
    if (!user?.id) return;
    const prev = isLiked;
    try {
      const res = await coreApi.post('/likes-posts/toggle', {
        userId: user.id,
        postId: post.id,
      });
      const liked = !!res.data?.liked;
      setIsLiked(liked);
      if (!prev && liked) {
        setLikesCount((c) => c + 1);
      } else if (prev && !liked) {
        setLikesCount((c) => Math.max(0, c - 1));
      }
    } catch (e) {
      console.error('Toggle like failed', e);
    }
  };

  const handleDelete = async () => {
    try {
      await coreApi.delete(`/posts/${post.id}`);
      if (onChanged) onChanged();
    } catch (e) {
      console.error('Delete post failed', e);
    } finally {
      setShowMenu(false);
    }
  };

  return (
    <article className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6">
      <div className="flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-3">
          {post.user?.avatarUrl ? (
            <img
              src={post.user.avatarUrl || undefined}
              alt="User avatar"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {post.user.username?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <Link href={`/profile/${post.user.id}`}>
            <span className="font-semibold text-sm md:text-base hover:underline cursor-pointer">
              {post.user.username}
            </span>
          </Link>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu((v) => !v)}>
            <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded shadow text-sm z-10">
              {canManage && (
                <>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                    onClick={() => {
                      setShowMenu(false);
                      if (onEdit) onEdit(post);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </>
              )}
              {!canManage && (
                <div className="px-4 py-2 text-gray-500">No actions available</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full aspect-square bg-gradient-to-br from-teal-600 to-teal-400 relative overflow-hidden">
        <img 
          src={post.assets?.[0]?.url}
          alt="Post" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-4 md:gap-5">
            <button type="button" onClick={toggleLike}>
              <Heart className={`w-6 h-6 md:w-7 md:h-7 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button type="button">
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button type="button">
              <Send className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>
          <button type="button" onClick={() => setIsSaved(!isSaved)}>
            <Bookmark className={`w-6 h-6 md:w-7 md:h-7 ${isSaved ? 'fill-black' : ''}`} />
          </button>
        </div>

        <div className="mb-2">
          <span className="font-semibold text-sm md:text-base">
            {(!isLiked && likesCount === 0) && '0 people liked this post'}
            {(!isLiked && likesCount === 1) && '1 person liked this post'}
            {(!isLiked && likesCount > 1) && `${likesCount.toLocaleString()} people liked this post`}
            {(isLiked && likesCount <= 1) && 'You liked this post'}
            {(isLiked && likesCount > 1) && `You and ${(likesCount - 1).toLocaleString()} people liked this post`}
          </span>
        </div>

        <div className="mb-1 md:mb-2">
          <span className="font-semibold text-sm md:text-base mr-2">{post.user.username}</span>
          <span className="text-sm md:text-base">{post.body}</span>
        </div>

        <div className="mb-2">
          <div className="text-sm md:text-base text-gray-500 mb-2">
            Comments: {(commentCount ?? post.comments).toLocaleString()}
          </div>
          <CommentsList
            postId={post.id}
            refreshKey={refreshKey}
            onCountChange={(cnt) => setCommentCount(cnt)}
          />
        </div>

        <div className="text-xs text-gray-400 uppercase">
          {new Date(post.timeAgo).toLocaleDateString()}
        </div>
      </div>

      <div className="hidden md:flex border-t border-gray-300 p-3 md:p-4 items-center gap-3">
        <button className="text-xl md:text-2xl">😊</button>
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 text-sm md:text-base outline-none"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          className="text-blue-500 font-semibold text-sm md:text-base"
          onClick={async () => {
            const text = commentText.trim();
            if (!text || !user?.id) return;
            try {
              await coreApi.post('/comments', {
                userId: user.id,
                postId: post.id,
                body: text,
              });
              setCommentText('');
              setRefreshKey((k) => k + 1);
            } catch (e) {
              console.error('Publish comment failed', e);
            }
          }}
        >
          Publish
        </button>
      </div>
    </article>
  );
}
