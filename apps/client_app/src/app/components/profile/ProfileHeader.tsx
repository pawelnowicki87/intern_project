import { useAuth } from '@/client_app/context/AuthContext';
import Link from 'next/link';
import { Home, Send, PlusSquare, Compass, Heart, ArrowLeft, MoreVertical } from 'lucide-react';

export default function ProfileHeader() {
const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-300 py-2 px-4 md:py-3 md:px-8">
      <div className="lg:max-w-5xl lg:mx-auto flex items-center justify-between">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between w-full">
          <button className="p-2"><ArrowLeft className="w-6 h-6" /></button>
          <h2 className="font-semibold">{user?.username}</h2>
          <button className="p-2"><MoreVertical className="w-6 h-6" /></button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between w-full">
          <Link href="/feed">
            <h1 className="text-2xl font-serif italic cursor-pointer">Instagram</h1>
          </Link>
          <div className="flex gap-5 items-center">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-2 bg-gray-100 rounded-lg w-64"
            />
            <div className="flex gap-5 items-center">
              <button onClick={logout} className="text-sm font-semibold">Logout</button>
              <button><Home className="w-6 h-6" /></button>
              <Link href="/chat"><Send className="w-6 h-6" /></Link>
              <button><PlusSquare className="w-6 h-6" /></button>
              <button><Compass className="w-6 h-6" /></button>
              <button><Heart className="w-6 h-6" /></button>
              <button className="w-7 h-7 rounded-full overflow-hidden border border-gray-200">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="block w-full h-full bg-gradient-to-br from-blue-500 to-pink-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
