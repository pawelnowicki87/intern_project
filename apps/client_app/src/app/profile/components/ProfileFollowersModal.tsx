import { useEffect, useState } from 'react';
import { X, UserPlus, UserMinus } from 'lucide-react';
import { coreApi } from '@/client_app/lib/api';
import { useAuth } from '@/client_app/context/AuthContext';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  userId: number;
}

export default function ProfileFollowersModal({ isOpen, onClose, type, userId }: FollowersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<number, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const endpoint = type === 'followers'
          ? `/follows/${userId}/followers`
          : `/follows/${userId}/following`;

        const res = await coreApi.get(endpoint, {
          params: { viewerId: user?.id ?? 0 },
        });
        const follows = (res.data ?? []) as {
          followerId: number;
          followedId: number;
          followerFirstName: string;
          followerLastName: string;
          followedFirstName: string;
          followedLastName: string;
        }[];

        const usersList: User[] = follows.map((f) =>
          type === 'followers'
            ? {
                id: f.followerId,
                username: '',
                firstName: f.followerFirstName,
                lastName: f.followerLastName,
              }
            : {
                id: f.followedId,
                username: '',
                firstName: f.followedFirstName,
                lastName: f.followedLastName,
              },
        );
        setUsers(usersList);

        // Check follow status for each user
        if (user?.id) {
          const statusChecks = await Promise.all(
            usersList.map(async (u) => {
              try {
                const follow = await coreApi.get(`/follows/${user.id}/${u.id}`);
                const status = follow.data?.status as 'pending' | 'accepted' | 'rejected' | undefined;
                return [u.id, status === 'accepted'];
              } catch {
                return [u.id, false];
              }
            })
          );
          const statusMap = Object.fromEntries(statusChecks);
          setFollowingStatus(statusMap);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, type, userId, user?.id]);

  const handleFollow = async (targetUserId: number) => {
    if (!user?.id) return;
    try {
      await coreApi.post('/follows', { 
        followerId: user.id, 
        followedId: targetUserId 
      });
      setFollowingStatus(prev => ({ ...prev, [targetUserId]: true }));
    } catch (err) {
      console.error('Failed to follow', err);
    }
  };

  const handleUnfollow = async (targetUserId: number) => {
    if (!user?.id) return;
    try {
      await coreApi.delete(`/follows/${user.id}/${targetUserId}`);
      setFollowingStatus(prev => ({ ...prev, [targetUserId]: false }));
    } catch (err) {
      console.error('Failed to unfollow', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No {type === 'followers' ? 'followers' : 'following'} yet
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((targetUser) => {
                const isCurrentUser = user?.id === targetUser.id;
                const isFollowing = followingStatus[targetUser.id];
                const displayName = targetUser.username || 
                  [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') || 
                  'User';

                return (
                  <div key={targetUser.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                    <Link 
                      href={`/profile/${targetUser.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden border border-gray-200">
                        {targetUser.avatarUrl ? (
                          <img
                            src={targetUser.avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {displayName[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{displayName}</div>
                        {targetUser.firstName && targetUser.lastName && (
                          <div className="text-xs text-gray-500 truncate">
                            {targetUser.firstName} {targetUser.lastName}
                          </div>
                        )}
                      </div>
                    </Link>

                    {!isCurrentUser && (
                      <div className="shrink-0">
                        {isFollowing ? (
                          <button
                            onClick={() => handleUnfollow(targetUser.id)}
                            className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1.5"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            Unfollow
                          </button>
                        ) : (
                          <button
                            onClick={() => handleFollow(targetUser.id)}
                            className="px-4 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Follow
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
