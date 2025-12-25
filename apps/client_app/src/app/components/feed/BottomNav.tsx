import { Home, Search, Film, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around py-2 z-50 safe-area-inset-bottom">
      <Link href="/feed">
        <button className="p-2">
          <Home className="w-6 h-6" />
        </button>
      </Link>
      <button className="p-2">
        <Search className="w-6 h-6" />
      </button>
      <button className="p-2">
        <Film className="w-6 h-6" />
      </button>
      <button className="p-2">
        <ShoppingBag className="w-6 h-6" />
      </button>
      <Link href="/profile">
        <button className="p-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-pink-500"></div>
        </button>
      </Link>
    </nav>
  );
}