import { X, MoreHorizontal } from 'lucide-react';

interface Story {
  username: string;
  avatar: string;
  timestamp: string;
}

interface StoryHeaderProps {
  story: Story;
  totalStories: number;
  currentIndex: number;
  isPaused: boolean;
  onClose: () => void;
}

export default function StoryHeader({ story, totalStories, currentIndex, isPaused, onClose }: StoryHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-3 md:p-4">
      <div className="flex gap-1 mb-3">
        {Array.from({ length: totalStories }).map((_, idx) => (
          <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-white transition-all duration-100 ${
                idx < currentIndex
                  ? 'w-full'
                  : idx === currentIndex
                    ? isPaused
                      ? 'w-1/2'
                      : 'w-1/2 animate-progress'
                    : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{story.avatar}</span>
          </div>
          <span className="text-white font-semibold text-sm">{story.username}</span>
          <span className="text-white/70 text-xs">{story.timestamp}</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="md:hidden text-white">
            <MoreHorizontal className="w-6 h-6" />
          </button> 
          <button onClick={onClose} className="md:hidden text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
