"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import Header from "@/components/Header";
import Post from "./components/Post";
import Stories from "./components/Stories";
import Suggestions from "./components/Suggestions";
import FeedFilterBar from "./components/FeedFilterBar";
import CreatePostModal from "@/components/CreatePostModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { coreApi } from "@/lib/api";

function FeedContent() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editPost, setEditPost] = useState<any | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "likes">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      if (search) {
        res = await coreApi.get("/posts/search", {
          params: { query: search },
        });
      } else {
        res =
          sortBy === "likes"
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
      }
      setPosts(res.data ?? []);
    } catch (e) {
      setError("Failed to load feed");
      console.error("Feed load error", e);
    } finally {
      setLoading(false);
    }
  }, [user, sortBy, sortOrder, search]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const processedPosts = (() => {
    const list = posts.slice();
    if (sortBy === "likes") {
      list.sort((a, b) => {
        const diff = (a.likes ?? 0) - (b.likes ?? 0);
        return sortOrder === "asc" ? diff : -diff;
      });
    } else {
      list.sort((a, b) => {
        const ad = new Date(a.createdAt).getTime();
        const bd = new Date(b.createdAt).getTime();
        const diff = ad - bd;
        return sortOrder === "asc" ? diff : -diff;
      });
    }
    return list;
  })();

  return (
    <ProtectedRoute>
      <Header onCreatePost={() => setIsCreatePostOpen(true)} />

      <main className="w-full pt-4 pb-20 md:pb-6">
        <div className="max-w-[935px] mx-auto px-4 lg:px-0">
          <div className="flex gap-8 justify-center lg:justify-between">
            <div className="w-full max-w-[615px]">
              <Stories />

              <FeedFilterBar
                sortBy={sortBy}
                sortOrder={sortOrder}
                onChangeSortBy={(v) => setSortBy(v)}
                onChangeSortOrder={(v) => setSortOrder(v)}
              />

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
              {!loading &&
                !error &&
                processedPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    onChanged={fetchFeed}
                    onEdit={(p) => setEditPost(p)}
                  />
                ))}
            </div>

            <div className="hidden lg:block">
              <Suggestions />
            </div>
          </div>
        </div>
      </main>

      <BottomNav onCreatePost={() => setIsCreatePostOpen(true)} />

      <CreatePostModal
        isOpen={isCreatePostOpen || !!editPost}
        onClose={() => {
          setIsCreatePostOpen(false);
          setEditPost(null);
        }}
        onCreated={fetchFeed}
        mode={editPost ? "edit" : "create"}
        initialPost={editPost}
      />
    </ProtectedRoute>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center p-8">Loading...</div>}
    >
      <FeedContent />
    </Suspense>
  );
}
