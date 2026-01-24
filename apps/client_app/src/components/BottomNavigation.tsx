import { Heart, Film } from 'lucide-react';

export default function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around py-2 md:hidden">
      <button className="p-2"><div className="w-6 h-6 bg-black rounded-sm"></div></button>
      <button className="p-2"><div className="w-6 h-6 border-2 border-black rounded-full"></div></button>
      <button className="p-2"><Film className="w-6 h-6" /></button>
      <button className="p-2"><div className="w-6 h-6 border-2 border-black rounded"></div></button>
      <button className="p-2"><Heart className="w-6 h-6" /></button>
    </div>
  );
}