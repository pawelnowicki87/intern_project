'use client';

import Header from '@/components/Header';
import BottomNavigation from '../../../components/BottomNavigation';
import ProfileInfo from '../components/ProfileInfo';
import ProfileHighlights from '../components/ProfileHighlights';
import ProfileTabs from '../components/ProfileTabs';
import ProfilePostsGrid from '../components/ProfilePostsGrid';
import { useEffect, useState } from 'react';
import React from 'react';
import CreatePostModal from '../../../components/CreatePostModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { coreApi } from '@/lib/api';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const unwrapped = React.use(params);
  return (
    <ProtectedRoute>
      <ProfileById idParam={unwrapped.id} />
    </ProtectedRoute>
  );
}

function ProfileById({ idParam }: { idParam: string }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  useEffect(() => {
    const id = Number(idParam);
    if (!user || !id || Number.isNaN(id)) return;
    const fetchProfile = async () => {
      try {
        const res = await coreApi.get(`/users/${id}`, {
          params: { viewerId: user.id },
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, idParam]);

  if (!user || loading || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onCreatePost={() => setIsCreatePostOpen(true)} />
      <main className="lg:max-w-5xl lg:mx-auto pb-16 md:pb-0">
        <ProfileInfo profile={profile} />
        <ProfileHighlights />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <ProfilePostsGrid userId={profile.id} tab={activeTab} />
      </main>
      <BottomNavigation />
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onCreated={() => setIsCreatePostOpen(false)}
      />
    </div>
  );
}
