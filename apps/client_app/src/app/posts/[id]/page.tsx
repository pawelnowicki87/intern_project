'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { coreApi } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Post from '@/app/feed/components/Post';

export default function PostPage() {
  const params = useParams();
  const id = Number(params.id as string);
  const { user } = useAuth();
  const router = useRouter();
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
      } catch (e: any) {
        console.error('Failed to load post', e);
        router.replace('/feed');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-300 sticky top-0 z-10">
          <div className="max-w-[935px] mx-auto px-4 py-2 md:py-3 flex items-center justify-between">
            <Link href="/feed">
              <h1 className="text-2xl md:text-3xl font-serif italic cursor-pointer">Instagram</h1>
            </Link>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </header>
        <main className="lg:max-w-2xl lg:mx-auto px-2 md:px-0 py-4">
          {loading && (
            <div className="text-sm text-gray-500">Loading post...</div>
          )}
          {!loading && post && (
            <Post
              post={post}
              onChanged={() => {
                const targetUserId = post?.user?.id ?? user?.id;
                if (targetUserId) {
                  router.push(`/profile/${targetUserId}`);
                } else {
                  router.push('/profile');
                }
              }}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
