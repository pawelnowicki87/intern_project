'use client';

import { useCallback, useEffect, useState } from "react";
import BottomNav from "../components/feed/BottomNav";
import CreatePostModal from "../components/feed/CreatePostModal";
import FeedHeader from "../components/feed/FeedHeader";
import Post from "../components/feed/Post";
import Stories from "../components/feed/Stories";
import Suggestions from "../components/feed/Suggestions";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "@/client_app/context/AuthContext";
import { coreApi } from "@/client_app/lib/api";


export default function FeedPage() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await coreApi.get(`/posts/feed/${user.id}`, {
        params: {
          sort: 'desc',
          page: 1,
          limit: 10,
        },
      });
      setPosts(res.data ?? []);
    } catch (e) {
      setError('Nie udało się załadować feedu');
      console.error('Feed load error', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

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
                {loading && (
                  <div className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6 p-6 text-center text-sm text-gray-500">
                    Ładowanie postów...
                  </div>
                )}
                {error && (
                  <div className="w-full bg-red-50 border border-red-300 rounded-none md:rounded-lg mb-4 md:mb-6 p-6 text-center text-sm text-red-700">
                    {error}
                  </div>
                )}
                {!loading && !error && posts.length === 0 && (
                  <div className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6 p-6 text-center text-sm text-gray-500">
                    Brak postów do wyświetlenia
                  </div>
                )}
                {!loading && !error && posts.map((post) => (
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
          onCreated={fetchFeed}
        />
      </div>
    </ProtectedRoute>
  );
}
