'use client';
import React from 'react';

export type ChatItem = {
  id: number;
  name: string;
  avatar?: string | null;
  lastMessage?: string;
  time?: string;
  unread?: number;
  type: 'direct' | 'group';
  participants?: Array<{ name: string; avatar?: string | null }>;
  isTyping?: boolean;
  typingUsers?: string[];
};

export default function ChatSidebar({
  chats,
  selectedId,
  onSelect,
  onCreateGroup,
}: {
  chats: ChatItem[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  onCreateGroup?: () => void;
}) {
  const activeId = selectedId ?? (chats[0]?.id ?? null);

  const directChats = chats.filter((c) => c.type === 'direct');
  const groupChats = chats.filter((c) => c.type === 'group');

  const getTypingText = (chat: ChatItem) => {
    if (!chat.isTyping || !chat.typingUsers || chat.typingUsers.length === 0) return null;
    
    if (chat.type === 'direct') {
      return 'typing...';
    }
    
    // For groups
    if (chat.typingUsers.length === 1) {
      return `${chat.typingUsers[0]} is typing...`;
    }
    if (chat.typingUsers.length === 2) {
      return `${chat.typingUsers[0]} and ${chat.typingUsers[1]} are typing...`;
    }
    return `${chat.typingUsers.length} people are typing...`;
  };

  return (
    <aside className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="text-sm font-semibold">Messages</div>
        <button
          type="button"
          onClick={() => onCreateGroup?.()}
          className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          New Group
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Direct</div>
        {directChats.map((c) => {
          const typingText = getTypingText(c);
          
          return (
            <div
              key={c.id}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                c.id === activeId ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect?.(c.id)}
              role="button"
              tabIndex={0}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{c.name?.[0]?.toUpperCase() ?? 'U'}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  {c.time && <div className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{c.time}</div>}
                </div>
                {typingText ? (
                  <div className="text-xs text-blue-600 italic flex items-center gap-1">
                    <span className="inline-block animate-pulse text-[16px] leading-none">●</span>
                    <span>{typingText}</span>
                  </div>
                ) : c.lastMessage ? (
                  <div className="text-xs text-gray-600 truncate">{c.lastMessage}</div>
                ) : null}
              </div>

              {c.unread && c.unread > 0 ? (
                <span className="text-[10px] bg-blue-600 text-white rounded-full px-2 py-0.5 font-medium flex-shrink-0">
                  {c.unread}
                </span>
              ) : null}
            </div>
          );
        })}

        <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-gray-500 font-medium mt-2">Groups</div>
        {groupChats.map((c) => {
          const typingText = getTypingText(c);
          
          return (
            <div
              key={c.id}
              className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                c.id === activeId ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect?.(c.id)}
              role="button"
              tabIndex={0}
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center border-2 border-white">
                  <span className="text-white text-[10px] font-bold">
                    {(c.participants?.[0]?.name?.[0] ?? 'G').toUpperCase()}
                  </span>
                </div>
                <div className="absolute left-4 top-2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center border-2 border-white">
                  <span className="text-white text-[10px] font-bold">
                    {(c.participants?.[1]?.name?.[0] ?? 'R').toUpperCase()}
                  </span>
                </div>
                <div className="absolute left-2 top-4 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center border-2 border-white">
                  <span className="text-white text-[10px] font-bold">
                    {(c.participants?.[2]?.name?.[0] ?? 'P').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-sm font-semibold truncate">{c.name}</div>
                  {c.time && <div className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{c.time}</div>}
                </div>
                {typingText ? (
                  <div className="text-xs text-blue-600 italic flex items-center gap-1">
                    <span className="inline-block animate-pulse text-[16px] leading-none">●</span>
                    <span className="truncate">{typingText}</span>
                  </div>
                ) : c.lastMessage ? (
                  <div className="text-xs text-gray-600 truncate">{c.lastMessage}</div>
                ) : null}
              </div>

              {c.unread && c.unread > 0 ? (
                <span className="text-[10px] bg-blue-600 text-white rounded-full px-2 py-0.5 font-medium flex-shrink-0">
                  {c.unread}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}