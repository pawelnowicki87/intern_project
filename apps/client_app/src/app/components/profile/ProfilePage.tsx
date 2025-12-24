'use client';

import { useState } from 'react';
import BottomNavigation from './BottomNavigation';
import ProfileHeader from './ProfileHeader';
import ProfileHighlights from './ProfileHighlights';
import ProfileInfo from './ProfileInfo';
import ProfileTabs from './ProfileTabs';
import ProfilePostsGrid from './ProfilePostsGrid';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="min-h-screen bg-white">
      <ProfileHeader />
      
      <main className="lg:max-w-5xl lg:mx-auto pb-16 md:pb-0">
        <ProfileInfo />
        <ProfileHighlights />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'posts' && <ProfilePostsGrid />}
      </main>

      <BottomNavigation />
    </div>
  );
}