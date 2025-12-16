"use client";

import { ChevronLeft, MoreVertical } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <ChevronLeft className="w-6 h-6" />
      <span className="font-semibold text-lg">Username</span>
      <MoreVertical className="w-6 h-6" />
    </div>
  );
}
