import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface StoryControlsProps {
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export default function StoryControls({ isPaused, isMuted, onTogglePause, onToggleMute }: StoryControlsProps) {
  return (
    <div className="absolute top-16 right-3 md:right-4 flex flex-col gap-2 z-10">
      <button
        onClick={onTogglePause}
        className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
      >
        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
      </button>
      <button
        onClick={onToggleMute}
        className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}