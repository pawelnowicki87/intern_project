import { X } from 'lucide-react';

interface EditProfileHeaderProps {
  onCancel: () => void;
}

export default function EditProfileHeader({ onCancel }: EditProfileHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-300 py-2 px-4 md:py-3 md:px-8 sticky top-0 z-10">
      <div className="lg:max-w-3xl lg:mx-auto flex items-center justify-between">
        <div className="flex md:hidden items-center justify-between w-full">
          <button onClick={onCancel} className="p-2">
            <X className="w-6 h-6" />
          </button>
          <h2 className="font-semibold">Edit profile</h2>
          <button type="submit" form="edit-profile-form" className="text-blue-500 font-semibold text-sm">
            Done
          </button>
        </div>

        <div className="hidden md:block w-full">
          <h1 className="text-xl font-light">Edit Profile</h1>
        </div>
      </div>
    </header>
  );
}
