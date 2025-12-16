"use client";

import { useState } from "react";
import BottomNavigation from "./BottomNavigation";
import ProfileHeader from "./ProfileHeader";
import ProfileHighlights from "./ProfileHighlights";
import ProfileInfo from "./ProfileInfo";
import ProfilePostsGrid from "./ProfilePostsGrid";
import ProfileTabs from "./ProfileTabs";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "tagged">("posts");

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-16">
      <ProfileHeader />
      <ProfileInfo />
      <ProfileHighlights />
      <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />
      <ProfilePostsGrid />
      <BottomNavigation />
    </div>
  );
}
