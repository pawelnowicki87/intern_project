'use client';

import { Send, Search, PlusSquare, Home, Compass } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/client_app/context/AuthContext';
import NotificationsDropdown from '../../../components/NotificationsDropdown';

interface FeedHeaderProps {
  onCreatePost?: () => void;
}

export default function FeedHeader({ onCreatePost }: FeedHeaderProps) {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-10">
      <div className="max-w-[935px] mx-auto px-4 py-2 md:py-3 flex items-center justify-between">
        <Link href="/feed">
          <h1 className="text-2xl md:text-3xl font-serif italic cursor-pointer">Instagram</h1>
        </Link>

        <div className="hidden md:block flex-1 max-w-xs mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-1.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-gray-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          <button onClick={onCreatePost} className="md:hidden">
            <PlusSquare className="w-6 h-6" />
          </button>
          <div className="md:hidden">
            <NotificationsDropdown />
          </div>
          <Link href="/chat" className="md:hidden">
            <Send className="w-6 h-6" />
          </Link>
          
          <Link href="/feed" className="hidden md:block">
            <Home className="w-6 h-6" />
          </Link>
          <Link href="/chat" className="hidden md:block">
            <Send className="w-6 h-6" />
          </Link>
          <button onClick={onCreatePost} className="hidden md:block">
            <PlusSquare className="w-6 h-6" />
          </button>
          <button className="hidden md:block">
            <Compass className="w-6 h-6" />
          </button>
          <div className="hidden md:block">
            <NotificationsDropdown />
          </div>
          <Link href="/profile">
            <button className="w-7 h-7 rounded-full overflow-hidden border border-gray-200">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="block w-full h-full bg-gradient-to-br from-blue-500 to-pink-500" />
              )}
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
