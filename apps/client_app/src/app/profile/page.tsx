import { useState, useEffect } from 'react';
import ProfileHeader from './components/ProfileHeader';
import ProfileHighlights from './components/ProfileHighlights';
import ProfileInfo from './components/ProfileInfo';
import ProfileTabs from './components/ProfileTabs';
import ProfilePostsGrid from './components/ProfilePostsGrid';
import CreatePostModal from '@/components/CreatePostModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { coreApi } from '@/lib/api';

export default function Page() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

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

  return (
    <ProtectedRoute>
      {!user || loading || !profile ? (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      ) : (
        <div className="min-h-screen bg-white">
          <ProfileHeader onCreatePost={() => setIsCreatePostOpen(true)} />
          <main className="lg:max-w-5xl lg:mx-auto pb-16 md:pb-0">
            <ProfileInfo profile={profile} />
            <ProfileHighlights />
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <ProfilePostsGrid userId={profile.id} tab={activeTab} />
          </main>
          <CreatePostModal
            isOpen={isCreatePostOpen}
            onClose={() => setIsCreatePostOpen(false)}
            onCreated={() => setIsCreatePostOpen(false)}
          />
        </div>
      )}
    </ProtectedRoute>
  );
}
