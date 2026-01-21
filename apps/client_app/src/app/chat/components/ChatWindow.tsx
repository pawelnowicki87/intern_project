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
  isRead?: boolean;
};

function makeClientId() {
  return `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ChatWindow({ chat, onInteract, onOpenInfo }: { chat?: ChatItem | null; onInteract?: () => void; onOpenInfo?: () => void }) {
  const { user } = useAuth();

  const [participantIds, setParticipantIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [typingIds, setTypingIds] = useState<Set<number>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const typingTimeoutsRef = useRef<Map<number, number>>(new Map());

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('en-US', {
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
    const container = messagesContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [chat?.id, messages.length]);

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
          isRead: m.isRead || false,
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
          isRead: msg.isRead || false,
        };

        const optimisticIdx = prev.findIndex(
          (m) =>
            m.clientId &&
            m.senderId === incoming.senderId &&
            m.body === incoming.body,
        );

        if (optimisticIdx !== -1) {
          const next = [...prev];
          next[optimisticIdx] = { ...next[optimisticIdx], ...incoming };
          return next;
        }

        return [...prev, incoming];
      });
    });

    s.on('message_read_broadcast', (data: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, isRead: true } : m)),
      );
    });

    s.on('user_typing', (data: any) => {
      const otherId = Number(data?.userId);
      if (!user || otherId === user.id) return;
      setTypingIds((prev) => {
        const next = new Set(prev);
        next.add(otherId);
        return next;
      });
      const old = typingTimeoutsRef.current.get(otherId);
      if (old) window.clearTimeout(old);
      const to = window.setTimeout(() => {
        setTypingIds((prev) => {
          const next = new Set(prev);
          next.delete(otherId);
          return next;
        });
        typingTimeoutsRef.current.delete(otherId);
      }, 3000);
      typingTimeoutsRef.current.set(otherId, to);
    });

    s.on('user_stop_typing', (data: any) => {
      const otherId = Number(data?.userId);
      if (!user || otherId === user.id) return;
      const t = typingTimeoutsRef.current.get(otherId);
      if (t) window.clearTimeout(t);
      typingTimeoutsRef.current.delete(otherId);
      setTypingIds((prev) => {
        const next = new Set(prev);
        next.delete(otherId);
        return next;
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
            : m,
        ),
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
        isRead: true,
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
    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
    socketRef.current.emit('stop_typing', { chatId: Number(chat.id) });
  };

  useEffect(() => {
    if (!socketRef.current || !chat?.id || !user) return;
    const ids = new Set<number>();
    messages.forEach((m) => {
      if (m.id && m.senderId !== user.id && !m.isRead) {
        ids.add(m.id);
        socketRef.current!.emit('message_read', { messageId: m.id, chatId: Number(chat.id) });
      }
    });
    if (ids.size > 0) {
      setMessages((prev) =>
        prev.map((m) => (m.id && ids.has(m.id) ? { ...m, isRead: true } : m)),
      );
    }
  }, [messages, chat?.id, user?.id]);

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
          isRead: m.isRead || false,
        }));
        setMessages((prev) => {
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
      } catch {
        return;
      }
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
          m.id === editingId ? { ...m, body: editText.trim(), isEdited: true } : m,
        ),
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
    <div className="flex flex-col h-full bg-white" onClick={() => onInteract?.()}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="font-semibold text-sm truncate">{chat?.name ?? 'Chat'}</div>
        <div className="flex items-center gap-2">
          {typingIds.size > 0 && (
            <span className="text-xs text-gray-500">{typingIds.size === 1 ? 'Typing…' : 'Multiple typing…'}</span>
          )}
          {chat?.type === 'group' && (
            <button
              type="button"
              onClick={() => onOpenInfo?.()}
              className="text-xs px-2 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Info
            </button>
          )}
        </div>
      </div>
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
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

                      {mine && m.id && (
                        <button
                          onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id!)}
                          className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-full transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      )}

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

                    <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-gray-400">
                        {formatTime(m.createdAt)}
                      </span>
                      {mine && (
                        <span className="text-[10px]">
                          {m.isRead ? (
                            <span className="text-blue-500">✓✓</span>
                          ) : (
                            <span className="text-gray-400">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 p-4 border-t border-gray-200 bg-white">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Message..."
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            if (socketRef.current && chat?.id) {
              socketRef.current.emit('typing', { chatId: Number(chat.id) });
              if (typingStopTimerRef.current) window.clearTimeout(typingStopTimerRef.current);
              typingStopTimerRef.current = window.setTimeout(() => {
                if (socketRef.current && chat?.id) {
                  socketRef.current.emit('stop_typing', { chatId: Number(chat.id) });
                }
                typingStopTimerRef.current = null;
              }, 1200);
            }
          }}
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
