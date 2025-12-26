'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

interface PostProps {
  post: {
    id: number;
    username: string;
    image: string;
    likes: number;
    caption: string;
    comments: number;
    timeAgo: string;
  };
}

export default function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <article className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">m</span>
          </div>
          <span className="font-semibold text-sm md:text-base">{post.username}</span>
        </div>
        <button>
          <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Post Image */}
      <div className="w-full aspect-square bg-gradient-to-br from-teal-600 to-teal-400 relative overflow-hidden">
        <img 
          src={post.image} 
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
          <span className="font-semibold text-sm md:text-base mr-2">{post.username}</span>
          <span className="text-sm md:text-base">{post.caption}</span>
        </div>

        {/* View Comments */}
        <button className="text-sm md:text-base text-gray-500 mb-1">
          View all {post.comments} comments
        </button>

        {/* Time */}
        <div className="text-xs text-gray-400 uppercase">
          {post.timeAgo}
        </div>
      </div>

      {/* Add Comment - Desktop */}
      <div className="hidden md:flex border-t border-gray-300 p-3 md:p-4 items-center gap-3">
        <button className="text-xl md:text-2xl">😊</button>
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 text-sm md:text-base outline-none"
        />
        <button className="text-blue-500 font-semibold text-sm md:text-base">Publish</button>
      </div>
    </article>
  );
}
