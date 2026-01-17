import { Heart } from 'lucide-react';

export default function ProfileHighlights() {
  const highlights = [
    { name: 'Templates', color: 'from-pink-500 to-pink-600' },
    { name: 'Reviews', color: 'from-blue-500 to-blue-600' },
    { name: 'Mentions', color: 'from-pink-500 to-pink-600' },
    { name: 'Tips', color: 'from-blue-500 to-blue-600' },
    { name: 'Blog', color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <div className="px-4 py-3 flex gap-6 overflow-x-auto md:justify-center">
      {highlights.map((highlight, idx) => (
        <div key={idx} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${highlight.color} flex items-center justify-center`}>
            <Heart className="w-7 h-7 md:w-9 md:h-9 text-white fill-white" />
          </div>
          <span className="text-xs">{highlight.name}</span>
        </div>
      ))}
    </div>
  );
}