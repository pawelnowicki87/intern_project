'use client';

import { useState } from "react";
import BottomNav from "../components/feed/BottomNav";
import CreatePostModal from "../components/feed/CreatePostModal";
import FeedHeader from "../components/feed/FeedHeader";
import Post from "../components/feed/Post";
import Stories from "../components/feed/Stories";
import Suggestions from "../components/feed/Suggestions";
import ProtectedRoute from "../components/ProtectedRoute";

const posts = [
  {
    id: 1,
    title: '',
    body: 'Test post from backend model',
    assets: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        type: 'image'
      }
    ],
    user: {
      username: 'mediamodifier'
    },
    createdAt: new Date().toISOString(),
    likes: 123,
    comments: 45,
    timeAgo: new Date().toISOString()
  }
];


export default function FeedPage() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <FeedHeader onCreatePost={() => setIsCreatePostOpen(true)} />
        
        {/* Main scrollable content */}
        <main className="w-full pt-4 pb-20 md:pb-6">
          {/* Centered container */}
          <div className="max-w-[935px] mx-auto px-4 lg:px-0">
            <div className="flex gap-8 justify-center lg:justify-between">
              {/* Feed - centered on tablet, left on desktop */}
              <div className="w-full max-w-[615px]">
                <Stories />
                
                {/* Posts list */}
                {posts.map(post => (
                  <Post key={post.id} post={post} />
                ))}
              </div>

              {/* Sidebar - Desktop only */}
              <div className="hidden lg:block">
                <Suggestions />
              </div>
            </div>
          </div>
        </main>

        <BottomNav onCreatePost={() => setIsCreatePostOpen(true)} />

        {/* Create Post Modal */}
        <CreatePostModal 
          isOpen={isCreatePostOpen} 
          onClose={() => setIsCreatePostOpen(false)} 
        />
      </div>
    </ProtectedRoute>
  );
}