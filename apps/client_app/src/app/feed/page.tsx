'use client';

import BottomNav from "../components/feed/BottomNav";
import FeedHeader from "../components/feed/FeedHeader";
import Post from "../components/feed/Post";
import Stories from "../components/feed/Stories";
import Suggestions from "../components/feed/Suggestions";

export default function FeedPage() {
  const posts = [
    {
      id: 1,
      username: 'mediamodifier',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop',
      likes: 905235,
      caption: '#mediamodifier #mockups #design #blackfriday #blackfridaysale #sale #cybermonday ...more',
      comments: 103,
      timeAgo: 'hour ago'
    },
    {
      id: 2,
      username: 'mediamodifier',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop',
      likes: 805432,
      caption: 'Another amazing post #design #creative',
      comments: 87,
      timeAgo: '2 hours ago'
    },
    {
      id: 3,
      username: 'mediamodifier',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop',
      likes: 654321,
      caption: 'Check out our new collection! #mockups',
      comments: 65,
      timeAgo: '5 hours ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <FeedHeader />
      
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

      <BottomNav />
    </div>
  );
}