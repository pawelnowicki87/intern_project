'use client';

import { useAuth } from '@/context/AuthContext';
import { Home, Search, Film, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface BottomNavProps {
  onCreatePost?: () => void;
}

export default function BottomNav({ onCreatePost }: BottomNavProps) {
  const { user } = useAuth();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around py-2 z-50">
      <Link href="/feed">
        <button className="p-2">
          <Home className="w-6 h-6" />
        </button>
      </Link>
      <button className="p-2">
        <Search className="w-6 h-6" />
      </button>
      <button onClick={onCreatePost} className="p-2">
        <Film className="w-6 h-6" />
      </button>
      <button className="p-2">
        <ShoppingBag className="w-6 h-6" />
      </button>
      <Link href="/profile">
        <button className="p-2">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="block w-full h-full bg-gradient-to-br from-blue-500 to-pink-500" />
            )}
          </div>
        </button>
      </Link>
    </nav>
  );
}
