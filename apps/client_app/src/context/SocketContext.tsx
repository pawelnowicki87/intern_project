'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAccessToken } from '../lib/auth';
import { coreApi } from '../lib/api';

interface SocketContextType {
  socket: Socket | null;
  unreadCount: number;
  refreshUnreadCount: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await coreApi.get(`/messages/unread/count/${user.id}`);
      setUnreadCount(Number(res.data));
    } catch (e) {
      console.error('Failed to fetch unread count', e);
    }
  };

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    refreshUnreadCount();

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
    setSocket(s);

    s.on('connect', () => {
        // Fetch chats and join rooms to receive new_message events
        coreApi.get(`/chats/user/${user.id}`).then((res) => {
            const chats = res.data;
            if (Array.isArray(chats)) {
                chats.forEach((c: any) => {
                    s.emit('join_room', { chatId: c.id });
                });
            }
        }).catch(console.error);
    });

    s.on('new_message', (msg: any) => {
      if (msg.receiverId === user.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    s.on('message_read_broadcast', (data: any) => {
        if (data.userId === user.id) {
            refreshUnreadCount();
        }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, refreshUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
