'use client';
import React from 'react';
import FeedHeader from '../feed/components/FeedHeader';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import CreatePostModal from '@/components/CreatePostModal';
import { coreApi } from '@/lib/api';

export default function ChatPage() {
  type ChatItem = {
    id: number;
    name: string;
    avatar?: string | null;
    lastMessage?: string;
    time?: string;
    unread?: number;
    type: 'direct' | 'group';
    participants?: Array<{ name: string; avatar?: string | null }>;
    createdAt?: string;
    msgCount?: number;
    rawParticipants?: any[];
  };

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ensuredRef = useRef<Set<number>>(new Set());

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const activeChat = chats.find((c) => c.id === selectedId) ?? null;
  const searchParams = useSearchParams();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const dedupe = (arr: ChatItem[], currentUserId: number): ChatItem[] => {
    const groups = new Map<string, ChatItem[]>();
    arr.forEach((c: any) => {
      const other = (c.rawParticipants ?? []).find((p: any) => p.userId !== currentUserId);
      const key = c.type === 'direct' && other ? `direct:${other.userId}` : `chat:${c.id}`;
      const list = groups.get(key) ?? [];
      list.push(c);
      groups.set(key, list);
    });
    const pick = (items: ChatItem[]) => {
      return items
        .slice()
        .sort((a, b) => {
          const mc = (b.msgCount ?? 0) - (a.msgCount ?? 0);
          if (mc !== 0) return mc;
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          const ct = tb - ta;
          if (ct !== 0) return ct;
          return b.id - a.id;
        })[0];
    };
    const result: ChatItem[] = [];
    groups.forEach((items) => result.push(pick(items)));
    return result;
  };

  useEffect(() => {
    let mounted = true;
    const loadChats = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const res = await coreApi.get('/chats');
        const listRaw: ChatItem[] = (res.data as any[]).filter((c: any) =>
          (c.participants ?? []).some((p: any) => p.userId === user.id),
        ).map((c: any) => {
          const others = (c.participants ?? []).filter((p: any) => p.userId !== user.id);
          const name = others.length > 0
            ? (others[0].username ?? (([others[0].firstName, others[0].lastName].filter(Boolean).join(' ').trim()) || 'Direct chat'))
            : 'Group chat';
          const last = (c.messages ?? []).slice(-1)[0];
          return {
            id: c.id,
            name,
            lastMessage: last?.body ?? '',
            time: last?.createdAt ? new Date(last.createdAt).toLocaleTimeString() : '',
            unread: 0,
            type: (c.participants ?? []).length > 2 ? 'group' : 'direct',
            participants: others.map((o: any) => ({ name: o.username ?? [o.firstName, o.lastName].filter(Boolean).join(' ') })),
            rawParticipants: c.participants,
            createdAt: c.createdAt,
            msgCount: (c.messages ?? []).length,
          } as ChatItem;
        });
        const list = dedupe(listRaw, user.id);
        if (!mounted) return;
        setChats(list);
        const wantedId = searchParams.get('userId');
        if (list.length && selectedId == null && !wantedId) {
          setSelectedId(list[0].id);
        }
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load chats');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    loadChats();
    return () => { mounted = false; };
  }, [user]);

  useEffect(() => {
    const username = searchParams.get('username');
    const userIdParam = searchParams.get('userId');
    if (!user || (!username && !userIdParam)) return;
    const targetId = userIdParam ? Number(userIdParam) : null;

    if (targetId && ensuredRef.current.has(targetId)) {
      return;
    }

    const exists = chats.find((c) => {
      const parts = (c as any).rawParticipants as any[] | undefined;
      if (!parts || c.type !== 'direct') return false;
      const hasMe = parts.some((p) => p.userId === user.id);
      const hasTarget = parts.some((p) => p.userId === targetId);
      return hasMe && hasTarget;
    });
    if (exists) {
      setSelectedId(exists.id);
      if (targetId) ensuredRef.current.add(targetId);
      return;
    }
    const ensureChat = async () => {
      try {
        // try to find a chat by participants from freshly loaded /chats
        const found = (await coreApi.get('/chats')).data.find((c: any) =>
          (c.participants ?? []).some((p: any) => p.userId === user.id) &&
          (c.participants ?? []).some((p: any) => p.userId === targetId),
        );
        if (found) {
          setSelectedId(found.id);
          setChats((prev) => {
            const last = (found.messages ?? []).slice(-1)[0];
            const others = (found.participants ?? []).filter((p: any) => p.userId !== user.id);
            const name = others.length > 0
              ? (others[0].username ?? [others[0].firstName, others[0].lastName].filter(Boolean).join(' '))
              : 'Direct chat';
            const mapped: any = {
              id: found.id,
              name,
              lastMessage: last?.body ?? '',
              time: last?.createdAt ? new Date(last.createdAt).toLocaleTimeString() : '',
              unread: 0,
              type: (found.participants ?? []).length > 2 ? 'group' : 'direct',
              participants: others.map((o: any) => ({ name: o.username ?? [o.firstName, o.lastName].filter(Boolean).join(' ') })),
              rawParticipants: found.participants,
              createdAt: found.createdAt,
              msgCount: (found.messages ?? []).length,
            };
            return dedupe([mapped, ...prev], user.id);
          });
          if (targetId) ensuredRef.current.add(targetId);
          return;
        }
        // create new direct chat
        if (targetId) {
          const created = await coreApi.post('/chats', { creatorId: user.id, participantIds: [user.id, targetId] });
          const c = created.data;
          // ensure participants exist for websocket authorization
          try {
            await coreApi.post('/chat-participants', { chatId: c.id, userId: user.id });
            await coreApi.post('/chat-participants', { chatId: c.id, userId: targetId });
          } catch {}
          // refetch to get participants populated
          let withParts = c;
          try {
            const ref = await coreApi.get(`/chats/${c.id}`);
            withParts = ref.data;
          } catch {}
          const last = (c.messages ?? []).slice(-1)[0];
          const others = (withParts.participants ?? []).filter((p: any) => p.userId !== user.id);
          const name = others.length > 0
            ? (others[0].username ?? [others[0].firstName, others[0].lastName].filter(Boolean).join(' '))
            : 'Direct chat';
          const mapped: any = {
            id: c.id,
            name,
            lastMessage: last?.body ?? '',
            time: last?.createdAt ? new Date(last.createdAt).toLocaleTimeString() : '',
            unread: 0,
            type: (withParts.participants ?? []).length > 2 ? 'group' : 'direct',
            participants: others.map((o: any) => ({ name: o.username ?? [o.firstName, o.lastName].filter(Boolean).join(' ') })),
            rawParticipants: withParts.participants,
            createdAt: withParts.createdAt ?? c.createdAt,
            msgCount: (withParts.messages ?? c.messages ?? []).length,
          };
          setChats((prev) => dedupe([mapped, ...prev], user.id));
          setSelectedId(mapped.id);
          ensuredRef.current.add(targetId);
        }
      } catch {
        // noop
      }
    };
    ensureChat();
  }, [searchParams, user, chats]);

  return (
    <div className="min-h-screen bg-white">
      <FeedHeader onCreatePost={() => setIsCreatePostOpen(true)} />
      <div className="max-w-[935px] mx-auto px-4 py-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden flex">
          <ChatSidebar
            chats={chats}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
          />
          <div className="flex-1">
            <ChatWindow chat={activeChat as any} />
          </div>
        </div>
      </div>
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onCreated={() => setIsCreatePostOpen(false)}
      />
    </div>
  );
}
