import Link from 'next/link';
import { useAuth } from '@/client_app/context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { coreApi } from '@/client_app/lib/api';

type UserLite = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  isPrivate?: boolean;
};

type FollowDto = {
  followerId: number;
  followedId: number;
  status: 'accepted' | 'pending' | 'rejected';
};

type SuggestionItem = {
  user: UserLite;
  reason: string;
};

type FollowResponse = {
  followerId: number;
  followedId: number;
  status: 'accepted' | 'pending' | 'rejected';
  createdAt: string;
};

export default function Suggestions() {
  const { user } = useAuth();
  const avatarUrl = (user as any)?.avatarUrl as string | undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());
  const [followersIds, setFollowersIds] = useState<Set<number>>(new Set());
  const [followBusy, setFollowBusy] = useState<number | null>(null);
  const [followStatus, setFollowStatus] = useState<Record<number, 'accepted' | 'pending' | 'rejected'>>({});
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadBase = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const [followersRes, followingRes] = await Promise.all([
          coreApi.get<FollowDto[]>(`/follows/${user.id}/followers?viewerId=${user.id}`),
          coreApi.get<FollowDto[]>(`/follows/${user.id}/following?viewerId=${user.id}`),
        ]);
        const followers = new Set<number>((followersRes.data ?? []).map((f) => f.followerId));
        const following = new Set<number>((followingRes.data ?? []).map((f) => f.followedId));
        setFollowersIds(followers);
        setFollowingIds(following);
      } catch {
        // fallback: proceed with empty sets so suggestions can still load
        setFollowersIds(new Set());
        setFollowingIds(new Set());
      } finally {
        setLoading(false);
      }
    };
    loadBase();
  }, [user?.id]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user?.id) return;
      if (loading) return;
      setError(null);
      try {
        const mutualIds = [...followersIds].filter((id) => followingIds.has(id));
        const mutualUsers: UserLite[] = await Promise.all(
          mutualIds.slice(0, 7).map(async (id) => {
            try {
              const ures = await coreApi.get<UserLite>(`/users/${id}?viewerId=${user.id}`);
              return ures.data ?? { id, username: 'user' } as any;
            } catch {
              return { id, username: `user_${id}` } as any;
            }
          }),
        );

        const seedIds: number[] = [];
        const followingArr = [...followingIds].slice(0, 10);
        const followersArr = [...followersIds].slice(0, 10);

        const friendOfFriendsCounts: Record<number, number> = {};

        await Promise.all(
          followingArr.map(async (fid) => {
            try {
              const res = await coreApi.get<FollowDto[]>(`/follows/${fid}/following?viewerId=${user.id}`);
              (res.data ?? []).forEach((f) => {
                const id = f.followedId;
                if (id === user.id) return;
                if (followingIds.has(id)) return;
                friendOfFriendsCounts[id] = (friendOfFriendsCounts[id] ?? 0) + 1;
                seedIds.push(id);
              });
            } catch {}
          }),
        );

        await Promise.all(
          followersArr.map(async (fid) => {
            try {
              const res = await coreApi.get<FollowDto[]>(`/follows/${fid}/followers?viewerId=${user.id}`);
              (res.data ?? []).forEach((f) => {
                const id = f.followerId;
                if (id === user.id) return;
                if (followingIds.has(id)) return;
                friendOfFriendsCounts[id] = (friendOfFriendsCounts[id] ?? 0) + 1;
                seedIds.push(id);
              });
            } catch {}
          }),
        );

        const candidateIds = Array.from(new Set(seedIds)).filter((id) => !mutualIds.includes(id));

        const candidateUsers: UserLite[] = await Promise.all(
          candidateIds.slice(0, 30).map(async (id) => {
            try {
              const ures = await coreApi.get<UserLite>(`/users/${id}?viewerId=${user.id}`);
              return ures.data ?? { id, username: `user_${id}` } as any;
            } catch {
              return { id, username: `user_${id}` } as any;
            }
          }),
        );

        const mutualSuggestions: SuggestionItem[] = mutualUsers.map((u) => ({
          user: u,
          reason: 'Obserwujecie się nawzajem',
        }));

        const fofSuggestions: SuggestionItem[] = candidateUsers
          .map((u) => ({
            user: u,
            reason: `Wspólni znajomi: ${friendOfFriendsCounts[u.id] ?? 1}`,
          }))
          .sort((a, b) => {
            const ca = Number(String(a.reason).split(':')[1] ?? '0');
            const cb = Number(String(b.reason).split(':')[1] ?? '0');
            return cb - ca;
          });

        let final: SuggestionItem[] = [...mutualSuggestions, ...fofSuggestions];
        final = final.filter((s) => s.user.id !== user.id && !followingIds.has(s.user.id));

        if (final.length < 7) {
          try {
            const allRes = await coreApi.get<UserLite[]>('/users');
            const pool = (allRes.data ?? []).filter(
              (u) => u.id !== user.id && !followingIds.has(u.id),
            );
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            const needed = 7 - final.length;
            final.push(
              ...shuffled.slice(0, needed).map((u) => ({
                user: u,
                reason: 'Polecane',
              })),
            );
          } catch {}
        }

        setItems(final);
      } catch {
        setError('Nie udało się wczytać sugestii');
      }
    };
    loadSuggestions();
  }, [user?.id, followersIds, followingIds, loading]);

  const handleFollow = async (id: number) => {
    if (!user?.id) return;
    setFollowBusy(id);
    try {
      const res = await coreApi.post<FollowResponse>('/follows', { followerId: user.id, followedId: id });
      const status = (res.data?.status ?? 'accepted') as 'accepted' | 'pending' | 'rejected';
      setFollowStatus((prev) => ({ ...prev, [id]: status }));
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    } catch {
    } finally {
      setFollowBusy(null);
    }
  };

  const meUserName = user?.username || 'user';

  const header = useMemo(() => {
    return (
      <div className="flex items-center justify-between mb-4">
        <Link href="/profile" className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {meUserName.charAt(0).toUpperCase() || 'M'}
              </span>
            </div>
          )}
          <div>
            <div className="font-semibold text-sm">{meUserName}</div>
            <div className="text-xs text-gray-500">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : 'Instagram suggestions'
              }
            </div>
          </div>
        </Link>
        <button className="text-blue-500 font-semibold text-xs hover:text-blue-600">
          Switch
        </button>
      </div>
    );
  }, [avatarUrl, meUserName, user?.firstName, user?.lastName]);

  return (
    <div className="w-80 pt-6">
      {header}

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500">Suggestions For You</span>
        <button
          className="text-xs font-semibold hover:text-gray-600"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? 'See Less' : 'See All'}
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {loading && <div className="text-xs text-gray-500">Ładowanie…</div>}
        {error && <div className="text-xs text-red-600">{error}</div>}
        {!loading && !error && items.slice(0, showAll ? 15 : 7).map((s) => (
          <div key={s.user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {s.user.avatarUrl ? (
                <Link href={`/profile/${s.user.id}`}>
                  <img
                    src={s.user.avatarUrl}
                    alt={s.user.username}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                </Link>
              ) : (
                <Link href={`/profile/${s.user.id}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {s.user.username?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                </Link>
              )}
              <div>
                <Link href={`/profile/${s.user.id}`}>
                  <div className="font-semibold text-sm hover:underline cursor-pointer">
                    {s.user.username}
                  </div>
                </Link>
                <div className="text-xs text-gray-500">{s.reason}</div>
              </div>
            </div>
            {followStatus[s.user.id] === 'accepted' ? (
              <span className="text-gray-500 text-xs">Obserwujesz</span>
            ) : followStatus[s.user.id] === 'pending' ? (
              <span className="text-gray-500 text-xs">Wysłano prośbę</span>
            ) : (
              <button
                onClick={() => handleFollow(s.user.id)}
                disabled={followBusy === s.user.id}
                className="text-blue-500 font-semibold text-xs hover:text-blue-600"
              >
                Follow
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400 space-y-3">
        <div className="flex flex-wrap gap-x-2">
          <Link href="/about" className="hover:underline">About</Link>
          <span>·</span>
          <Link href="/press" className="hover:underline">Press</Link>
          <span>·</span>
          <Link href="/api" className="hover:underline">API</Link>
          <span>·</span>
          <Link href="/jobs" className="hover:underline">Jobs</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <Link href="/terms" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link href="/locations" className="hover:underline">Locations</Link>
          <span>·</span>
          <Link href="/language" className="hover:underline">Language</Link>
        </div>
        <div className="mt-4">
          © 2024 INSTAGRAM FROM META
        </div>
      </div>
    </div>
  );
}
