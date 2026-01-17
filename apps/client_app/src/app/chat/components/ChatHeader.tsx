'use client';
import Link from 'next/link';
import { ArrowLeft, Plus, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatHeaderProps {
  chatName?: string;
  chatAvatar?: string | null;
  onCreateGroup?: () => void;
  onChatInfo?: () => void;
}

export default function ChatHeader({ chatName, chatAvatar, onCreateGroup, onChatInfo }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-10 shadow-sm">
      <div className="max-w-[935px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left - Back button */}
        <button 
          onClick={() => router.back()} 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors" 
          aria-label="Back" 
          type="button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center - Chat info or Logo */}
        {chatName ? (
          <div className="flex items-center gap-3 flex-1 mx-4 justify-center">
            {chatAvatar ? (
              <img
                src={chatAvatar}
                alt={chatName}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {chatName[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <span className="font-semibold text-sm md:text-base truncate max-w-[200px]">
              {chatName}
            </span>
          </div>
        ) : (
          <Link href="/feed" className="flex-1 mx-4 text-center">
            <h1 className="text-xl md:text-2xl font-serif italic cursor-pointer">Instagram</h1>
          </Link>
        )}

        {/* Right - Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateGroup}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Create group chat"
            type="button"
          >
            <Plus className="w-5 h-5" />
          </button>
          {chatName && (
            <button
              onClick={onChatInfo}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Chat info"
              type="button"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}