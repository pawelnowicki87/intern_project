import Link from 'next/link';
import { useAuth } from '@/client_app/context/AuthContext';

export default function Suggestions() {
  const { user } = useAuth();
  
  const suggestions = [
    { username: 'lucas', mutual: 'Followed by mark + 2 more' },
    { username: 'laura', mutual: 'Followed by brandon + 6 more' },
    { username: 'rikki', mutual: 'Followed by milk + 1 more' },
    { username: 'elrani', mutual: 'Followed by ednamans + 1 more' },
    { username: 'tomaska', mutual: 'Followed by katarinastring + 2 more' },
  ];

  return (
    <div className="w-80 pt-6">
      {/* User Profile */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/profile" className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {user?.username?.charAt(0).toUpperCase() || 'M'}
            </span>
          </div>
          <div>
            <div className="font-semibold text-sm">{user?.username || 'mediamodifier'}</div>
            <div className="text-xs text-gray-500">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : 'Mediamodifier-Building Brands'
              }
            </div>
          </div>
        </Link>
        <button className="text-blue-500 font-semibold text-xs hover:text-blue-600">
          Switch
        </button>
      </div>

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500">Suggestions For You</span>
        <button className="text-xs font-semibold hover:text-gray-600">See All</button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3 mb-6">
        {suggestions.map((userSuggestion, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {userSuggestion.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-sm">{userSuggestion.username}</div>
                <div className="text-xs text-gray-500">{userSuggestion.mutual}</div>
              </div>
            </div>
            <button className="text-blue-500 font-semibold text-xs hover:text-blue-600">
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* Footer Links */}
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