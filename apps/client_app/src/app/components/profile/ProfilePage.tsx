'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/client_app/context/AuthContext';
import { coreApi } from '@/client_app/lib/api';

import BottomNavigation from './BottomNavigation';
import ProfileHeader from './ProfileHeader';
import ProfileHighlights from './ProfileHighlights';
import ProfileInfo from './ProfileInfo';
import ProfileTabs from './ProfileTabs';
import ProfilePostsGrid from './ProfilePostsGrid';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await coreApi.get(`/users/${user.id}`, {
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
  }, [user]);

  if (!user || loading || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProfileHeader />

      <main className="lg:max-w-5xl lg:mx-auto pb-16 md:pb-0">
        <ProfileInfo profile={profile} />
        <ProfileHighlights />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'posts' && <ProfilePostsGrid />}
      </main>

      <BottomNavigation />
    </div>
  );
}
