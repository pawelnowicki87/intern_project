'use client';

import { useCallback, useEffect, useState } from 'react';
import BottomNav from '../components/feed/BottomNav';
import CreatePostModal from '../components/feed/CreatePostModal';
import FeedHeader from '../components/feed/FeedHeader';
import Post from '../components/feed/Post';
import Stories from '../components/feed/Stories';
import Suggestions from '../components/feed/Suggestions';
import FeedFilterBar from '../components/feed/FeedFilterBar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '@/client_app/context/AuthContext';
import { coreApi } from '@/client_app/lib/api';


export default function FeedPage() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'CAROUSEL' | 'REEL'>('ALL');

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = sortBy === 'likes'
        ? await coreApi.get(`/posts/feed/${user.id}/most-liked`, {
            params: { page: 1, limit: 10 },
          })
        : await coreApi.get(`/posts/feed/${user.id}`, {
            params: {
              sort: sortOrder,
              page: 1,
              limit: 10,
            },
          });
      setPosts(res.data ?? []);
    } catch (e) {
      setError('Failed to load feed');
      console.error('Feed load error', e);
    } finally {
      setLoading(false);
    }
  }, [user, sortBy, sortOrder]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const processedPosts = (() => {
    let list = posts.slice();
    if (filterType !== 'ALL') {
      list = list.filter((p) => p.contentType === filterType);
    }
    if (sortBy === 'likes') {
      list.sort((a, b) => {
        const diff = (a.likes ?? 0) - (b.likes ?? 0);
        return sortOrder === 'asc' ? diff : -diff;
      });
    } else {
      list.sort((a, b) => {
        const ad = new Date(a.createdAt).getTime();
        const bd = new Date(b.createdAt).getTime();
        const diff = ad - bd;
        return sortOrder === 'asc' ? diff : -diff;
      });
    }
    return list;
  })();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <FeedHeader
          onCreatePost={() => setIsCreatePostOpen(true)}
        />
        
        {/* Main scrollable content */}
        <main className="w-full pt-4 pb-20 md:pb-6">
          {/* Centered container */}
          <div className="max-w-[935px] mx-auto px-4 lg:px-0">
            <div className="flex gap-8 justify-center lg:justify-between">
              {/* Feed - centered on tablet, left on desktop */}
              <div className="w-full max-w-[615px]">
                <Stories />
                
                <FeedFilterBar
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  filterType={filterType}
                  onChangeSortBy={(v) => setSortBy(v)}
                  onChangeSortOrder={(v) => setSortOrder(v)}
                  onChangeFilterType={(v) => setFilterType(v)}
                />
                
                {/* Posts list */}
                {loading && (
                  <div className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6 p-6 text-center text-sm text-gray-500">
                    Loading posts...
                  </div>
                )}
                {error && (
                  <div className="w-full bg-red-50 border border-red-300 rounded-none md:rounded-lg mb-4 md:mb-6 p-6 text-center text-sm text-red-700">
                    {error}
                  </div>
                )}
                {!loading && !error && processedPosts.length === 0 && (
                  <div className="w-full bg-white border border-gray-300 rounded-none md:rounded-lg mb-4 md:mb-6 p-6 text-center text-sm text-gray-500">
                    No posts to display
                  </div>
                )}
                {!loading && !error && processedPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    onChanged={fetchFeed}
                    onEdit={(p) => setEditPost(p)}
                  />
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
          isOpen={isCreatePostOpen || !!editPost} 
          onClose={() => {
            setIsCreatePostOpen(false);
            setEditPost(null);
          }} 
          onCreated={fetchFeed}
          mode={editPost ? 'edit' : 'create'}
          initialPost={editPost}
        />
      </div>
    </ProtectedRoute>
  );
}
