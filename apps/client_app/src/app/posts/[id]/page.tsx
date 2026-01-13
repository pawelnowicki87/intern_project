'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Post from '../../components/feed/Post';
import { useAuth } from '@/client_app/context/AuthContext';
import { coreApi } from '@/client_app/lib/api';

export default function PostPage() {
  const params = useParams();
  const id = Number(params.id as string);
  const { user } = useAuth();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      try {
        const res = await coreApi.get(`/posts/${id}`, {
          params: { viewerId: user.id },
        });
        setPost(res.data);
      } catch (e) {
        console.error('Failed to load post', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <main className="lg:max-w-2xl lg:mx-auto px-2 md:px-0 py-4">
          {loading && (
            <div className="text-sm text-gray-500">Loading post...</div>
          )}
          {!loading && post && <Post post={post} />}
        </main>
      </div>
    </ProtectedRoute>
  );
}
