'use client';

import ProtectedRoute from "../../components/ProtectedRoute";
import ProfileHeader from "../../components/profile/ProfileHeader";
import BottomNavigation from "../../components/profile/BottomNavigation";
import ProfileInfo from "../../components/profile/ProfileInfo";
import ProfileHighlights from "../../components/profile/ProfileHighlights";
import ProfileTabs from "../../components/profile/ProfileTabs";
import ProfilePostsGrid from "../../components/profile/ProfilePostsGrid";
import { useAuth } from "@/client_app/context/AuthContext";
import { coreApi } from "@/client_app/lib/api";
import { useEffect, useState } from "react";
import React from "react";

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
      <ProfileHeader />
      <main className="lg:max-w-5xl lg:mx-auto pb-16 md:pb-0">
        <ProfileInfo profile={profile} />
        <ProfileHighlights />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <ProfilePostsGrid userId={profile.id} tab={activeTab} />
      </main>
      <BottomNavigation />
    </div>
  );
}
