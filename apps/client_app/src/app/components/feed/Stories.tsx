export default function Stories() {
  const stories = [
    { id: 1, username: 'Your story', avatar: 'm', isYourStory: true, hasStory: true },
    { id: 2, username: 'leon_tu', avatar: 'L', hasStory: true },
    { id: 3, username: 'katarina', avatar: 'K', hasStory: true },
    { id: 4, username: 'brandon', avatar: 'B', hasStory: true },
    { id: 5, username: 'marcus', avatar: 'M', hasStory: true },
    { id: 6, username: 'milk', avatar: 'M', hasStory: true },
  ];

  return (
    <div className="sticky top-[53px] md:top-[57px] z-10 w-full bg-white border-b md:border border-gray-300 rounded-none md:rounded-lg mb-0 md:mb-6">
      <div className="p-3 md:p-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 md:gap-4 lg:gap-6">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center flex-shrink-0">
              <div className={`relative ${story.hasStory ? 'p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full' : ''}`}>
                <div className="w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 bg-white p-0.5 rounded-full">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm md:text-base">{story.avatar}</span>
                  </div>
                </div>
                {story.isYourStory && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                )}
              </div>
              <span className="text-xs mt-1 text-center max-w-[60px] truncate">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}