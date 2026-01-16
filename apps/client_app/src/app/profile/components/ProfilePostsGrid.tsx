"use client";
import { useEffect, useState } from "react";
import { coreApi } from "@/client_app/lib/api";
import type { ProfileTab } from "./ProfileTabs";
import { useAuth } from "@/client_app/context/AuthContext";
import Link from "next/link";

interface PostAsset {
  id: number;
  url: string;
  type?: string;
}
interface PostItem {
  id: number;
  assets: PostAsset[];
  user?: { id: number };
}

export default function ProfilePostsGrid({ userId, tab }: { userId: number; tab: ProfileTab }) {
  const { user } = useAuth();
  const [items, setItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const postsRes = await coreApi.get(`/posts/user/${userId}`, {
          params: { viewerId: user?.id, sort: 'desc', page: 1, limit: 50 },
        });
        const ownPosts: PostItem[] = postsRes.data ?? [];

        if (tab === 'posts') {
          if (mounted) setItems(ownPosts);
        } else if (tab === 'reels') {
          const reels = ownPosts.filter((p: any) => p.contentType === 'REEL');
          if (mounted) setItems(reels);
        } else if (tab === 'saved') {
          const savesRes = await coreApi.get(`/saved-posts/${user?.id}`);
          const savedIds: number[] = (savesRes.data ?? []).map((sp: any) => sp.postId);
          const uniqueIds = Array.from(new Set(savedIds)).slice(0, 30);
          const posts = await Promise.all(
            uniqueIds.map((id) =>
              coreApi
                .get(`/posts/${id}`, { params: { viewerId: user?.id } })
                .then((r: any) => r.data)
                .catch(() => null),
            ),
          );
          const result = posts.filter(Boolean) as PostItem[];
          if (mounted) setItems(result);
        }
      } catch (e) {
        const status = (e as any)?.response?.status;
        if (status === 403) {
          if (mounted) setError('Ten profil jest prywatny');
        } else {
          if (mounted) setError('Nie udało się wczytać postów');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId, tab, user?.id]);

  if (loading) {
    return <div className="text-sm text-gray-500 px-4 py-3">Loading…</div>;
  }
  if (error) {
    return <div className="text-sm text-red-600 px-4 py-3">{error}</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 bg-gray-200">
      {items.map((post) => (
        tab === 'posts' ? (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <div className="aspect-square bg-gray-100 cursor-pointer">
              <img
                src={post.assets?.[0]?.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        ) : (
          <div key={post.id} className="aspect-square bg-gray-100">
            <img
              src={post.assets?.[0]?.url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )
      ))}
      {items.length === 0 && (
        <div className="col-span-3 px-4 py-6 text-center text-sm text-gray-500">No items</div>
      )}
    </div>
  );
}
