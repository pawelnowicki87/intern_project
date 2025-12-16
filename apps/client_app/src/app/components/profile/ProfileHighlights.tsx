"use client";

import { Heart } from "lucide-react";

const highlights = [
  { id: 1, name: "Templates" },
  { id: 2, name: "Reviews" },
  { id: 3, name: "Mentions" },
];

export default function ProfileHighlights() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-2">
      {highlights.map((h) => (
        <div key={h.id} className="flex flex-col items-center gap-1 min-w-fit">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <span className="text-xs">{h.name}</span>
        </div>
      ))}
    </div>
  );
}
