import { Heart, Send } from 'lucide-react';
import { useState } from 'react';

interface Story {
  username: string;
}

interface StoryInputProps {
  story: Story;
}

export default function StoryInput({ story }: StoryInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      console.log('Send message:', message);
      setMessage('');
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/50 to-transparent">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Envoyer message"
          className="flex-1 px-4 py-2 rounded-full border-2 border-white/50 bg-transparent text-white placeholder-white/70 text-sm focus:outline-none focus:border-white"
        />
        <button className="text-white">
          <Heart className="w-6 h-6" />
        </button>
        <button onClick={handleSend} className="text-white">
          <Send className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}