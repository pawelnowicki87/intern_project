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

  return (
    <aside className="w-full md:w-80 border-r border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="text-sm font-semibold">Messages</div>
        <button
          type="button"
          onClick={() => onCreateGroup?.()}
          className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          New Group
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(70vh-96px)] md:h-[calc(80vh-96px)]">
        <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-gray-500">Direct</div>
        {directChats.map((c) => (
          <div
            key={c.id}
            className={`px-4 py-3 flex items-center gap-3 cursor-pointer ${
              c.id === activeId ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect?.(c.id)}
            role="button"
            tabIndex={0}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">{c.name?.[0]?.toUpperCase() ?? 'U'}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold truncate">{c.name}</div>
                <div className="text-[10px] text-gray-400">{c.time}</div>
              </div>
              <div className="text-xs text-gray-600 truncate">{c.lastMessage}</div>
            </div>

            {c.unread ? (
              <span className="text-[10px] bg-blue-600 text-white rounded-full px-2 py-0.5">{c.unread}</span>
            ) : null}
          </div>
        ))}

        <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-gray-500">Groups</div>
        {groupChats.map((c) => (
          <div
            key={c.id}
            className={`px-4 py-3 flex items-center gap-3 cursor-pointer ${
              c.id === activeId ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect?.(c.id)}
            role="button"
            tabIndex={0}
          >
            <div className="relative w-10 h-10">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {(c.participants?.[0]?.name?.[0] ?? 'G').toUpperCase()}
                </span>
              </div>
              <div className="absolute left-4 top-2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {(c.participants?.[1]?.name?.[0] ?? 'R').toUpperCase()}
                </span>
              </div>
              <div className="absolute left-2 top-4 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {(c.participants?.[2]?.name?.[0] ?? 'P').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold truncate">{c.name}</div>
                <div className="text-[10px] text-gray-400">{c.time}</div>
              </div>
              <div className="text-xs text-gray-600 truncate">{c.lastMessage}</div>
            </div>

            {c.unread ? (
              <span className="text-[10px] bg-blue-600 text-white rounded-full px-2 py-0.5">{c.unread}</span>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
