'use client';

import { useRef } from 'react';

interface Story {
  image: string;
}

interface StoryContentProps {
  story: Story;
  onTapLeft: () => void;
  onTapRight: () => void;
  onHold: () => void;
  onRelease: () => void;
}

export default function StoryContent({ story, onTapLeft, onTapRight, onHold, onRelease }: StoryContentProps) {
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (_e: React.TouchEvent, _side: 'left' | 'right') => {
    holdTimerRef.current = setTimeout(() => {
      onHold();
    }, 200);
  };

  const handleTouchEnd = (_e: React.TouchEvent, side: 'left' | 'right') => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    onRelease();
    
    if (side === 'left') {
      onTapLeft();
    } else {
      onTapRight();
    }
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={story.image}
        alt="Story"
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 flex">
        <div
          className="w-1/3 h-full cursor-pointer"
          onTouchStart={(e) => handleTouchStart(e, 'left')}
          onTouchEnd={(e) => handleTouchEnd(e, 'left')}
          onClick={onTapLeft}
        />
        <div className="w-1/3 h-full" />
        <div
          className="w-1/3 h-full cursor-pointer"
          onTouchStart={(e) => handleTouchStart(e, 'right')}
          onTouchEnd={(e) => handleTouchEnd(e, 'right')}
          onClick={onTapRight}
        />
      </div>
    </div>
  );
}
