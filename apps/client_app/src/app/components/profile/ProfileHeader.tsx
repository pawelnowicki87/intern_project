import { useAuth } from '@/client_app/context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function ProfileHeader() {
const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-300 py-2 px-4 md:py-3 md:px-8">
      <div className="lg:max-w-5xl lg:mx-auto flex items-center justify-between">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between w-full">
          <button className="p-2">←</button>
          <h2 className="font-semibold">{user?.username}</h2>
          <button className="p-2">⋮</button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between w-full">
          <h1 className="text-2xl font-serif italic">Instagram</h1>
          <div className="flex items-center gap-6">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-2 bg-gray-100 rounded-lg w-64"
            />
            <div className="flex gap-5">
              <button onClick={logout}>Wyloguj</button>
              <button>🏠</button>
              <button>✉️</button>
              <button>➕</button>
              <button>🧭</button>
              <button>❤️</button>
              <button className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-pink-500"></button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}