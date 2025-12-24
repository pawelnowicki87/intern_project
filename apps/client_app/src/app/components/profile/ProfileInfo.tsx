import { useAuth } from '@/client_app/context/AuthContext';
import { UserPlus } from 'lucide-react';

export default function ProfileInfo() {
  const { user } = useAuth();
  return (
    <div className="px-4 py-3 md:px-8 md:py-6">
      <div className="flex gap-4 md:gap-8 items-start">
        {/* Profile Image */}
        <div className="w-20 h-20 md:w-36 md:h-36 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-pink-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-pink-600 flex items-center justify-center">
                <span className="text-white text-2xl md:text-4xl font-bold">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex-1">
          {/* Mobile Stats */}
          <div className="flex justify-around mb-4 md:hidden">
            <div className="text-center">
              <div className="font-semibold text-sm">1,132</div>
              <div className="text-xs text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">60K</div>
              <div className="text-xs text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">4</div>
              <div className="text-xs text-gray-600">Following</div>
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="hidden md:block">
            <div className="flex items-center gap-4 mb-5">
              <h1 className="text-xl font-light">{ user?.username }</h1>
              <button className="px-6 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">
                Follow
              </button>
              <button className="px-6 py-1.5 bg-gray-200 text-black rounded-lg text-sm font-semibold hover:bg-gray-300">
                Message
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded">
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-10 mb-5">
              <div><span className="font-semibold">1,132</span> posts</div>
              <div><span className="font-semibold">60K</span> followers</div>
              <div><span className="font-semibold">4</span> following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="px-0 py-3 flex gap-2 md:hidden">
        <button className="flex-1 bg-blue-500 text-white py-1.5 rounded-lg text-sm font-semibold">
          Follow
        </button>
        <button className="flex-1 bg-gray-200 text-black py-1.5 rounded-lg text-sm font-semibold">
          Message
        </button>
        <button className="px-3 bg-gray-200 rounded-lg">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Bio Section */}
      <div className="mt-3 md:mt-4">
        <div className="font-semibold text-sm">Mediamodifier-Building Brands</div>
        <div className="text-sm text-gray-600">Product/service</div>
        <div className="text-sm mt-1">We provide essential tools to help entrepreneurs grow their businesses online.</div>
        <a href="#" className="text-sm text-blue-900 font-semibold">mediamodifier.com</a>
      </div>
    </div>
  );
}