'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/client_app/context/AuthContext';
import { coreApi } from '@/client_app/lib/api';
import CommentsList from './CommentsList';

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
  const { user } = useAuth();

  const canManage = user?.id === post.user.id;

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

  const handleSaveEdit = async () => {};

  return (
    <article className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">m</span>
          </div>
          <span className="font-semibold text-sm md:text-base">{post.user.username}</span>
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

      {/* Post Image */}
      <div className="w-full aspect-square bg-gradient-to-br from-teal-600 to-teal-400 relative overflow-hidden">
        <img 
          src={post.assets?.[0]?.url}
          alt="Post" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Post Actions */}
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-4 md:gap-5">
            <button onClick={() => setIsLiked(!isLiked)}>
              <Heart className={`w-6 h-6 md:w-7 md:h-7 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button>
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button>
              <Send className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>
          <button onClick={() => setIsSaved(!isSaved)}>
            <Bookmark className={`w-6 h-6 md:w-7 md:h-7 ${isSaved ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Likes */}
        <div className="mb-2">
          <span className="font-semibold text-sm md:text-base">
            Liked by <span className="font-semibold">you</span> and{' '}
            <span className="font-semibold">{post.likes.toLocaleString()} others</span>
          </span>
        </div>

        {/* Caption */}
        <div className="mb-1 md:mb-2">
          <span className="font-semibold text-sm md:text-base mr-2">{post.user.username}</span>
          <span className="text-sm md:text-base">{post.body}</span>
        </div>

        {/* View Comments */}
        <div className="mb-2">
          <div className="text-sm md:text-base text-gray-500 mb-2">
            Comments: {post.comments}
          </div>
          <CommentsList postId={post.id} refreshKey={refreshKey} />
        </div>

        {/* Time */}
        <div className="text-xs text-gray-400 uppercase">
          {new Date(post.timeAgo).toLocaleDateString()}
        </div>
      </div>

      {/* Add Comment - Desktop */}
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
