'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, MoreHorizontal } from 'lucide-react';
import type { ChatItem } from './ChatSidebar';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/client_app/lib/auth';
import { useAuth } from '@/client_app/context/AuthContext';
import { coreApi } from '@/client_app/lib/api';

type Message = {
  id?: number;
  clientId?: string;
  senderId: number;
  receiverId: number;
  chatId?: number;
  body: string;
  createdAt?: string;
};

function makeClientId() {
  return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ChatWindow({ chat }: { chat?: ChatItem | null }) {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const receiverId = useMemo(() => {
    if (!user) return null;
    if (chat?.type === 'direct') {
      const other = participantIds.find((id) => id !== user.id);
      return other ?? null;
    }
    return null;
  }, [participantIds, chat?.type, user]);

  const canSend = Boolean(user && chat?.id && text.trim());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
  if (!chat?.id || !user) return;

  setMessages([]); // reset przy zmianie chatu

  let alive = true;

  const load = async () => {
    try {
      const res = await coreApi.get(`/chats/${chat.id}`);
      if (!alive) return;

      const mapped = (res.data?.messages ?? []).map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        body: m.body,
        createdAt: m.createdAt,
      }));

      setMessages(mapped);

      const parts = res.data?.participants ?? [];
      setParticipantIds(parts.map((p: any) => p.userId));
    } catch {}
  };

  load();

    const token = getAccessToken() ?? '';
    const endpoint = process.env.NEXT_PUBLIC_CORE_SERVICE_URL ?? 'http://localhost:3001';

    const s = io(endpoint, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = s;

    const chatIdNum = Number(chat.id);

    s.on('connect', () => {
      s.emit('join_room', { chatId: chatIdNum });
    });

    s.on('new_message', (msg: any) => {
      if (Number(msg.chatId) !== Number(chatIdNum)) {
        return;
      }
      setMessages(prev => {
        const incoming: Message = {
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          chatId: msg.chatId,
          body: msg.body,
          createdAt: msg.createdAt,
        };

        const optimisticIdx = prev.findIndex(
          m =>
            m.clientId &&
            m.senderId === incoming.senderId &&
            m.body === incoming.body
        );

        if (optimisticIdx !== -1) {
          const next = [...prev];
          next[optimisticIdx] = { ...next[optimisticIdx], ...incoming };
          return next;
        }

        return [...prev, incoming];
      });
    });

    return () => {
      alive = false;
      s.disconnect();
      socketRef.current = null;
    };
  }, [chat?.id, user?.id]);

  const handleSend = () => {
    if (!canSend || !socketRef.current || !user || !chat?.id) return;

    const body = text.trim();
    const clientId = makeClientId();

    setMessages(prev => [
      ...prev,
      {
        clientId,
        senderId: user.id,
        receiverId: receiverId ?? 0,
        body,
        createdAt: new Date().toISOString(),
      },
    ]);

    setText('');

    const payload: any = {
      chatId: Number(chat.id),
      text: body,
      ...(receiverId ? { receiverId } : {}),
      clientId,
    };

    socketRef.current.emit('send_message', payload);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[935px] mx-auto px-4 py-4">

        <div className="h-[70vh] overflow-y-auto space-y-3 bg-gray-50 p-4">
          {messages.map((m, idx) => {
            const mine = user ? m.senderId === user.id : false;
            return (
              <div key={m.id ?? m.clientId ?? idx} className={mine ? 'flex justify-end' : 'flex'}>
                <div className={mine
                  ? 'bg-blue-600 text-white px-3 py-2 rounded-xl'
                  : 'bg-white border px-3 py-2 rounded-xl'}>
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 p-3 border-t">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="bg-blue-600 text-white px-4 rounded"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
