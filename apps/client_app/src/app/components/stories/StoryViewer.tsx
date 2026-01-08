'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StoryContent from './StoryContent';
import StoryControls from './StoryControls';
import StoryHeader from './StoryHeader';
import StoryNavigation from './StoryNavigation';
import StoryInput from './StoryInput';
import { useRouter } from 'next/navigation';

interface Story {
  id: number;
  username: string;
  avatar: string;
  image: string;
  timestamp: string;
}

interface StoryViewerProps {
  username: string;
  onClose: () => void;
}

export default function StoryViewer({ username, onClose }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const router = useRouter();

  // Mock data - replace with real data
  const allStories = [
    {
      username: 'leon_tu',
      stories: [
        { id: 1, username: 'leon_tu', avatar: 'L', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', timestamp: '2h' }
      ] 
    },
    {
      username: 'katarina',
      stories: [
        { id: 2, username: 'katarina', avatar: 'K', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', timestamp: '3h' }
      ]
    },
    {
      username: 'mediamodifier',
      stories: [
        { id: 3, username: 'mediamodifier', avatar: 'm', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', timestamp: '25min' }
      ]
    },
    {
      username: 'brandon',
      stories: [
        { id: 4, username: 'brandon', avatar: 'B', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', timestamp: '5h' }
      ]
    },
    {
      username: 'maniscus',
      stories: [
        { id: 5, username: 'maniscus', avatar: 'M', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', timestamp: '6h' }
      ]
    }
  ];

  const currentUserIndex = allStories.findIndex(u => u.username === username);
  const currentUser = allStories[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];

  useEffect(() => {
    if (currentUserIndex === -1) {
      onClose();
    }
  }, [currentUserIndex, onClose]);

  if (currentUserIndex === -1) {
    return null;
  }

  // Auto-advance timer
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 5000); // 5 seconds per story

    return () => clearTimeout(timer);
  }, [currentStoryIndex, isPaused, currentStory]);

  const handleNext = () => {
    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Move to next user
      if (currentUserIndex < allStories.length - 1) {
        const nextUser = allStories[currentUserIndex + 1];
        router.push('/stories/${nextUser.username}');
      } else {
        onClose();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Move to previous user
      if (currentUserIndex > 0) {
        const prevUser = allStories[currentUserIndex - 1];
        router.push(`/stories/${prevUser.username}`);
      }
    }
  };

  const handleNextUser = () => {
    if (currentUserIndex < allStories.length - 1) {
      const nextUser = allStories[currentUserIndex + 1];
      router.push(`/stories/${nextUser.username}`);
    } else {
      onClose();
    }
  };

  const handlePreviousUser = () => {
    if (currentUserIndex > 0) {
      const prevUser = allStories[currentUserIndex - 1];
      router.push(`/stories/${prevUser.username}`);
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button - Desktop */}
      <button
        onClick={onClose}
        className="hidden md:block absolute top-4 right-4 text-white hover:opacity-80 z-50"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Instagram logo - Desktop */}
      <div className="hidden md:block absolute top-4 left-4 text-white text-2xl font-serif italic z-50">
        Instagram
      </div>

      {/* Story Navigation - Desktop */}
      <StoryNavigation
        onPrevious={handlePreviousUser}
        onNext={handleNextUser}
        hasPrevious={currentUserIndex > 0}
        hasNext={currentUserIndex < allStories.length - 1}
        previousUser={currentUserIndex > 0 ? allStories[currentUserIndex - 1] : null}
        nextUser={currentUserIndex < allStories.length - 1 ? allStories[currentUserIndex + 1] : null}
      />

      {/* Main story container */}
      <div className="relative w-full h-full md:w-auto md:h-auto md:max-w-[500px] md:max-h-[90vh] md:aspect-[9/16] bg-gray-900">
        <StoryHeader
          story={currentStory}
          totalStories={currentUser.stories.length}
          currentIndex={currentStoryIndex}
          isPaused={isPaused}
          onClose={onClose}
        />

        <StoryContent
          story={currentStory}
          onTapLeft={handlePrevious}
          onTapRight={handleNext}
          onHold={() => setIsPaused(true)}
          onRelease={() => setIsPaused(false)}
        />

        <StoryControls
          isPaused={isPaused}
          isMuted={isMuted}
          onTogglePause={() => setIsPaused(!isPaused)}
          onToggleMute={() => setIsMuted(!isMuted)}
        />

        <StoryInput story={currentStory} />
        
      </div>
    </div>
  );
}