import { ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  username: string;
  stories: any[];
}

interface StoryNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  previousUser: User | null;
  nextUser: User | null;
}

export default function StoryNavigation({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  previousUser,
  nextUser,
}: StoryNavigationProps) {
  return (
    <>
      {/* Previous user navigation - Desktop */}
      {hasPrevious && previousUser && (
        <div className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 -translate-x-24">
          <button
            onClick={onPrevious}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="mt-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center mb-2">
              <span className="text-white font-bold">{previousUser.username.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-white text-xs">{previousUser.username}</span>
          </div>
        </div>
      )}

      {/* Next user navigation - Desktop */}
      {hasNext && nextUser && (
        <div className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 translate-x-24">
          <button
            onClick={onNext}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="mt-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center mb-2">
              <span className="text-white font-bold">{nextUser.username.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-white text-xs">{nextUser.username}</span>
          </div>
        </div>
      )}
    </>
  );
}