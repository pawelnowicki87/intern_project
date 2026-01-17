'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import type { ChatItem } from './ChatSidebar';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { coreApi } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

type Message = {
  id?: number;
  clientId?: string;
  senderId: number;
  receiverId: number;
  chatId?: number;
  body: string;
  createdAt?: string;
  isEdited?: boolean;
};

function makeClientId() {
  return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ChatWindow({ chat }: { chat?: ChatItem | null }) {
  const { user } = useAuth();

  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('pl-PL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Warsaw',
      }).format(d);
    } catch {
      return '';
    }
  };

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

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };

    if (menuOpen !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!chat?.id || !user) return;

    setMessages([]);
    setEditingId(null);
    setMenuOpen(null);

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
          isEdited: m.isEdited || false,
        }));

        setMessages(mapped);

        const parts = res.data?.participants ?? [];
        setParticipantIds(parts.map((p: any) => p.userId));
      } catch (err) {
        console.error('Failed to load chat messages', err);
      }
    };

    load();

    const token = getAccessToken() ?? '';
    const endpoint = process.env.NEXT_PUBLIC_CORE_SERVICE_URL ?? 'http://localhost:3001';

    const s = io(endpoint, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
    });

    socketRef.current = s;

    const chatIdNum = Number(chat.id);

    s.on('connect', () => {
      s.emit('join_room', { chatId: chatIdNum }, (resp: any) => {
        if (!resp?.joined) {
          console.warn('join_room failed', resp);
        }
      });
    });

    s.on('reconnect', () => {
      s.emit('join_room', { chatId: chatIdNum }, (resp: any) => {
        if (!resp?.joined) {
          console.warn('rejoin failed', resp);
        }
      });
    });

    s.on('connect_error', (err) => {
      console.error('socket connect_error', err);
    });
    s.on('error', (err) => {
      console.error('socket error', err);
    });

    s.on('new_message', (msg: any) => {
      if (Number(msg.chatId) !== Number(chatIdNum)) {
        return;
      }
      setMessages((prev) => {
        const incoming: Message = {
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          chatId: msg.chatId,
          body: msg.body,
          createdAt: msg.createdAt,
          isEdited: msg.isEdited || false,
        };

        const optimisticIdx = prev.findIndex(
          (m) =>
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

    s.on('message_deleted', (data: any) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    });

    s.on('message_edited', (data: any) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, body: data.newBody, isEdited: true }
            : m
        )
      );
    });

    return () => {
      alive = false;
      s.disconnect();
      socketRef.current = null;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [chat?.id, user?.id]);

  const handleSend = () => {
    if (!canSend || !socketRef.current || !user || !chat?.id) return;

    const body = text.trim();
    const clientId = makeClientId();

    setMessages((prev) => [
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

  useEffect(() => {
    if (!chat?.id || !user) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    const id = window.setInterval(async () => {
      try {
        const res = await coreApi.get(`/chats/${chat.id}`);
        const mapped = (res.data?.messages ?? []).map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          body: m.body,
          createdAt: m.createdAt,
          isEdited: m.isEdited || false,
        }));
        setMessages(prev => {
          const byId = new Map<number | string, Message>();
          for (const m of prev) {
            byId.set(m.id ?? m.clientId ?? `${m.senderId}-${m.createdAt}`, m);
          }
          for (const m of mapped) {
            byId.set(m.id ?? `${m.senderId}-${m.createdAt}`, m);
          }
          return Array.from(byId.values()).sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return ta - tb;
          });
        });
      } catch {}
    }, 4000);
    pollRef.current = id;
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [chat?.id, user?.id]);

  const handleEdit = (messageId: number, currentBody: string) => {
    setEditingId(messageId);
    setEditText(currentBody);
    setMenuOpen(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim() || !socketRef.current) return;

    try {
      await coreApi.patch(`/messages/${editingId}`, { body: editText.trim() });
      
      socketRef.current.emit('edit_message', {
        messageId: editingId,
        newBody: editText.trim(),
        chatId: Number(chat?.id),
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingId ? { ...m, body: editText.trim(), isEdited: true } : m
        )
      );

      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to edit message', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (messageId: number) => {
    if (!socketRef.current) return;

    try {
      await coreApi.delete(`/messages/${messageId}`);
      
      socketRef.current.emit('delete_message', {
        messageId,
        chatId: Number(chat?.id),
      });

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setMenuOpen(null);
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((m, idx) => {
          const mine = user ? m.senderId === user.id : false;
          const isEditing = editingId === m.id;

          return (
            <div
              key={m.id ?? m.clientId ?? idx}
              className={mine ? 'flex justify-end' : 'flex'}
            >
              <div className="max-w-[70%] relative group">
                {isEditing ? (
                  <div className="bg-white border-2 border-blue-500 rounded-xl p-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full text-sm resize-none outline-none min-h-[60px]"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`relative ${
                        mine
                          ? 'bg-blue-600 text-white px-4 py-2 rounded-xl rounded-tr-sm'
                          : 'bg-white border border-gray-200 px-4 py-2 rounded-xl rounded-tl-sm'
                      }`}
                    >
                      <div className="break-words">{m.body}</div>
                      {m.isEdited && (
                        <span className={`text-[10px] italic ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {' '}(edited)
                        </span>
                      )}

                      {/* Message menu button */}
                      {mine && m.id && (
                        <button
                          onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id!)}
                          className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-full transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      )}

                      {/* Message menu */}
                      {menuOpen === m.id && m.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
                        >
                          <button
                            onClick={() => handleEdit(m.id!, m.body)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m.id!)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      className={
                        mine
                          ? 'text-[10px] text-gray-400 mt-1 text-right'
                          : 'text-[10px] text-gray-400 mt-1'
                      }
                    >
                      {formatTime(m.createdAt)}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-2 p-4 border-t border-gray-200 bg-white">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
