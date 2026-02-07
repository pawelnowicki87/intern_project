'use client';
import { UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import FollowersModal from './ProfileFollowersModal';
import { useAuth } from '@/context/AuthContext';
import { coreApi } from '@/lib/api';

interface ProfileInfoProps {
  profile: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    isPrivate?: boolean;
  };
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  const { user } = useAuth();

  const isOwner = user?.id === profile.id;

  const displayName =
    profile.username ||
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
    '';

  const firstLetter = (displayName?.charAt(0) || 'U').toUpperCase();

  const [followStatus, setFollowStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [followLoading, setFollowLoading] = useState(false);
  const [stats, setStats] = useState<{ posts: number; followers: number; following: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');

  const isHidden = !profile.username && !isOwner;

  useEffect(() => {
    const checkFollow = async () => {
      if (!user || !profile?.id) return;
      try {
        const res = await coreApi.get(`/follows/${user.id}/${profile.id}`);
        const status = res.data?.status as 'pending' | 'accepted' | 'rejected' | undefined;
        setFollowStatus(status === 'pending' ? 'pending' : status === 'accepted' ? 'accepted' : 'none');
      } catch {
        setFollowStatus('none');
      }
    };
    checkFollow();
  }, [user?.id, profile?.id]);

  useEffect(() => {
    const loadStats = async () => {
      if (!profile?.id) return;
      try {
        const res = await coreApi.get(`/users/${profile.id}/stats`);
        setStats(res.data ?? null);
      } catch {
        setStats({ posts: 0, followers: 0, following: 0 });
      }
    };
    loadStats();
  }, [profile?.id]);

  const handleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      const res = await coreApi.post('/follows', { followerId: user.id, followedId: profile.id });
      const status = res.data?.status as 'pending' | 'accepted' | 'rejected' | undefined;
      setFollowStatus(status === 'pending' ? 'pending' : 'accepted');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      await coreApi.delete(`/follows/${user.id}/${profile.id}`);
      setFollowStatus('none');
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowersModal = () => {
    setModalType('followers');
    setModalOpen(true);
  };

  const openFollowingModal = () => {
    setModalType('following');
    setModalOpen(true);
  };

  return (
    <>
      <div className="px-4 py-3 md:px-8 md:py-6">
        <div className="flex gap-4 md:gap-8 items-start">
          <div className="w-20 h-20 md:w-36 md:h-36 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-pink-600 flex items-center justify-center">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl md:text-4xl font-bold">{firstLetter}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {!isHidden && (
              <div className="flex justify-around mb-4 md:hidden">
                <div className="text-center">
                  <div className="font-semibold text-sm">{stats?.posts ?? 0}</div>
                  <div className="text-xs text-gray-600">Posts</div>
                </div>
                <button onClick={openFollowersModal} className="text-center hover:opacity-70 transition-opacity">
                  <div className="font-semibold text-sm">{stats?.followers ?? 0}</div>
                  <div className="text-xs text-gray-600">Followers</div>
                </button>
                <button onClick={openFollowingModal} className="text-center hover:opacity-70 transition-opacity">
                  <div className="font-semibold text-sm">{stats?.following ?? 0}</div>
                  <div className="text-xs text-gray-600">Following</div>
                </button>
              </div>
            )}

            <div className="hidden md:block">
              <div className="flex items-center gap-4 mb-5">
                <h1 className="text-xl font-light">{displayName || 'User'}</h1>

                {!isOwner && (
                  <>
                    {followStatus === 'accepted' ? (
                      <button
                        onClick={handleUnfollow}
                        disabled={followLoading}
                        className="px-6 py-1.5 bg-gray-200 text-black rounded-lg text-sm font-semibold hover:bg-gray-300 disabled:opacity-60"
                        type="button"
                      >
                        Unfollow
                      </button>
                    ) : followStatus === 'pending' ? (
                      <span className="px-4 py-1.5 bg-gray-200 text-black rounded-lg text-sm font-semibold">
                        Request sent
                      </span>
                    ) : (
                      <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className="px-6 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-60"
                        type="button"
                      >
                        Follow
                      </button>
                    )}

                    <Link
                      href={{
                        pathname: '/chat',
                        query: { username: profile.username, userId: String(profile.id) },
                      }}
                      className="px-6 py-1.5 bg-gray-200 text-black rounded-lg text-sm font-semibold hover:bg-gray-300"
                    >
                      Message
                    </Link>
                  </>
                )}
              </div>

              {!isHidden && (
                <div className="flex gap-10 mb-5">
                  <div>
                    <span className="font-semibold">{stats?.posts ?? 0}</span> posts
                  </div>
                  <button onClick={openFollowersModal} className="hover:opacity-70 transition-opacity">
                    <span className="font-semibold">{stats?.followers ?? 0}</span> followers
                  </button>
                  <button onClick={openFollowingModal} className="hover:opacity-70 transition-opacity">
                    <span className="font-semibold">{stats?.following ?? 0}</span> following
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-0 py-3 flex gap-2 md:hidden">
          {!isOwner && (
            <>
              {followStatus === 'accepted' ? (
                <button
                  onClick={handleUnfollow}
                  disabled={followLoading}
                  className="flex-1 bg-gray-200 text-black py-1.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                  type="button"
                >
                  Unfollow
                </button>
              ) : followStatus === 'pending' ? (
                <span className="flex-1 bg-gray-200 text-black py-1.5 rounded-lg text-sm font-semibold text-center">
                  Request sent
                </span>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="flex-1 bg-blue-500 text-white py-1.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                  type="button"
                >
                  Follow
                </button>
              )}

              <Link
                href={{
                  pathname: '/chat',
                  query: { username: profile.username, userId: String(profile.id) },
                }}
                className="flex-1 bg-gray-200 text-black py-1.5 rounded-lg text-sm font-semibold text-center"
              >
                Message
              </Link>
            </>
          )}

          <button className="px-3 bg-gray-200 rounded-lg" type="button">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        {isHidden && !isOwner && (
          <div className="mt-3 md:mt-4">
            <div className="text-sm text-gray-600">
              This profile is private. Send a follow request to view info and posts.
            </div>
          </div>
        )}

        {!isHidden && profile.bio && (
          <div className="mt-3 md:mt-4">
            <div className="font-semibold text-sm whitespace-pre-line">{profile.bio}</div>
          </div>
        )}
      </div>

      <FollowersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        userId={profile.id}
      />
    </>
  );
}
