"use client";

import { Grid, Film, User } from "lucide-react";

interface Props {
  activeTab: "posts" | "reels" | "tagged";
  onChange: (tab: "posts" | "reels" | "tagged") => void;
}

export default function ProfileTabs({ activeTab, onChange }: Props) {
  return (
    <div className="flex border-t border-b">
      <button onClick={() => onChange("posts")} className="flex-1 py-3 flex justify-center">
        <Grid />
      </button>
      <button onClick={() => onChange("reels")} className="flex-1 py-3 flex justify-center">
        <Film />
      </button>
      <button onClick={() => onChange("tagged")} className="flex-1 py-3 flex justify-center">
        <User />
      </button>
    </div>
  );
}
