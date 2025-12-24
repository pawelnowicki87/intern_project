import { Grid3x3, Film, Bookmark } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <div className="border-t border-gray-300 flex justify-center">
      <button
        onClick={() => setActiveTab('posts')}
        className={`flex items-center gap-2 py-3 px-8 border-t-2 ${
          activeTab === 'posts' ? 'border-black' : 'border-transparent text-gray-400'
        }`}
      >
        <Grid3x3 className="w-5 h-5" />
        <span className="hidden md:inline text-xs font-semibold tracking-wide">PUBLICATIONS</span>
      </button>
      <button
        onClick={() => setActiveTab('reels')}
        className={`flex items-center gap-2 py-3 px-8 border-t-2 ${
          activeTab === 'reels' ? 'border-black' : 'border-transparent text-gray-400'
        }`}
      >
        <Film className="w-5 h-5" />
        <span className="hidden md:inline text-xs font-semibold tracking-wide">REELS</span>
      </button>
      <button
        onClick={() => setActiveTab('saved')}
        className={`flex items-center gap-2 py-3 px-8 border-t-2 ${
          activeTab === 'saved' ? 'border-black' : 'border-transparent text-gray-400'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span className="hidden md:inline text-xs font-semibold tracking-wide">MARKS</span>
      </button>
    </div>
  );
}