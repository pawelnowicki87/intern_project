interface ProfilePhotoSectionProps {
  username: string;
}

export default function ProfilePhotoSection({ username }: ProfilePhotoSectionProps) {
  const handlePhotoChange = () => {
    // Tu będzie logika uploadu zdjęcia
    console.log('Change photo clicked');
  };

  return (
    <div className="px-4 py-6 md:px-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 border-b border-gray-200">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-pink-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-pink-600 flex items-center justify-center">
                <span className="text-white text-2xl md:text-3xl font-bold uppercase">
                  {username.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-semibold text-base">{username}</h3>
          <button 
            onClick={handlePhotoChange}
            className="text-blue-500 font-semibold text-sm mt-1 hover:text-blue-600"
          >
            Change profile photo
          </button>
        </div>
      </div>
    </div>
  );
}