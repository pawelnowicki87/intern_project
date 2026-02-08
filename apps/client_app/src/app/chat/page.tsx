"use client";
import React, { Suspense } from "react";
import Header from "@/components/Header";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import CreateGroupModal from "./components/CreateGroupModal";
import ChatInfoModal from "./components/ChatInfoModal";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CreatePostModal from "@/components/CreatePostModal";
import { coreApi } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <span className="text-sm text-gray-500">Loading chat...</span>
        </div>
      }
    >
      <ChatPageImpl />
    </Suspense>
  );
}

function ChatPageImpl() {
  type ChatItem = {
    id: number;
    name: string;
    avatar?: string | null;
    lastMessage?: string;
    time?: string;
    unread?: number;
    type: "direct" | "group";
    participants?: Array<{ name: string; avatar?: string | null }>;
    createdAt?: string;
    msgCount?: number;
    rawParticipants?: any[];
    isTyping?: boolean;
    typingUsers?: string[];
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Warsaw",
      }).format(d);
    } catch {
      return "";
    }
  };

  const { user } = useAuth();
  const ensuredRef = useRef<Set<number>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const groupNamesRef = useRef<Map<number, string>>(new Map());

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const activeChat = chats.find((c) => c.id === selectedId) ?? null;
  const searchParams = useSearchParams();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);

  const senderName = (parts: any[] | undefined, senderId?: number): string => {
    if (!senderId) return "";
    if (user && senderId === user.id) return "Ty";
    const p = (parts ?? []).find((x: any) => x.userId === senderId);
    if (!p) return "";
    return p.username ?? [p.firstName, p.lastName].filter(Boolean).join(" ");
  };

  const makePreview = (
    type: "direct" | "group",
    body?: string,
    senderId?: number,
    parts?: any[],
    fallbackSender?: { firstName?: string; lastName?: string },
  ): string => {
    const text = body ?? "";
    if (type !== "group") return text;
    const name =
      senderName(parts, senderId) ||
      [fallbackSender?.firstName, fallbackSender?.lastName]
        .filter(Boolean)
        .join(" ");
    return name ? `${name}: ${text}` : text;
  };

  const dedupe = (arr: ChatItem[], currentUserId: number): ChatItem[] => {
    const groups = new Map<string, ChatItem[]>();
    arr.forEach((c: any) => {
      const other = (c.rawParticipants ?? []).find(
        (p: any) => p.userId !== currentUserId,
      );
      const key =
        c.type === "direct" && other
          ? `direct:${other.userId}`
          : `chat:${c.id}`;
      const list = groups.get(key) ?? [];
      list.push(c);
      groups.set(key, list);
    });
    const pick = (items: ChatItem[]) => {
      return items.slice().sort((a, b) => {
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

  const loadChats = async () => {
    if (!user) return;
    try {
      const res = await coreApi.get(`/chats/user/${user.id}`);
      const listRaw: ChatItem[] = (res.data as any[])
        .filter((c: any) =>
          (c.participants ?? []).some((p: any) => p.userId === user.id),
        )
        .map((c: any) => {
          const others = (c.participants ?? []).filter(
            (p: any) => p.userId !== user.id,
          );
          const name =
            groupNamesRef.current.get(c.id) ||
            c.name ||
            (others.length > 0
              ? (others[0].username ??
                [others[0].firstName, others[0].lastName]
                  .filter(Boolean)
                  .join(" "))
              : "Group chat");
          const last = (c.messages ?? [])
            .slice()
            .sort((a: any, b: any) => {
              const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return ta - tb;
            })
            .slice(-1)[0];
          return {
            id: c.id,
            name,
            avatar: others[0]?.avatarUrl,
            lastMessage: makePreview(
              c.name || (c.participants ?? []).length !== 2
                ? "group"
                : "direct",
              last?.body,
              last?.senderId,
              c.participants,
              undefined,
            ),
            time: formatTime(last?.createdAt),
            unread: c.unread ?? 0,
            type:
              c.name || (c.participants ?? []).length !== 2
                ? "group"
                : "direct",
            participants: others.map((o: any) => ({
              name:
                o.username ??
                [o.firstName, o.lastName].filter(Boolean).join(" "),
              avatar: o.avatarUrl,
            })),
            rawParticipants: c.participants,
            createdAt: c.createdAt,
            msgCount: (c.messages ?? []).length,
            isTyping: false,
            typingUsers: [],
          } as ChatItem;
        });
      const list = dedupe(listRaw, user.id);
      setChats(list);
      const wantedId = searchParams.get("userId");
      if (list.length && selectedId == null && !wantedId) {
        setSelectedId(list[0].id);
      }
    } catch (e) {
      console.error("Failed to load chats", e);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadChats();
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || chats.length === 0) return;
    const token = getAccessToken() ?? "";
    const endpoint =
      process.env.NEXT_PUBLIC_CORE_SERVICE_URL ?? "http://localhost:3001";
    if (!socketRef.current) {
      const s = io(endpoint, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
      });
      socketRef.current = s;
      s.on("connect", () => {
        chats.forEach((c) => s.emit("join_room", { chatId: c.id }));
      });
      s.on("reconnect", () => {
        chats.forEach((c) => s.emit("join_room", { chatId: c.id }));
      });
      s.on("new_message", (msg: any) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== Number(msg.chatId)) return c;
            const inc =
              msg.senderId !== user.id && selectedId !== c.id
                ? (c.unread ?? 0) + 1
                : (c.unread ?? 0);
            return {
              ...c,
              lastMessage: makePreview(
                c.type,
                msg.body ?? c.lastMessage,
                msg.senderId,
                c.rawParticipants,
                msg.sender,
              ),
              time: msg.createdAt ? formatTime(msg.createdAt) : c.time,
              unread: inc,
              msgCount: (c.msgCount ?? 0) + 1,
            };
          }),
        );
      });
    } else {
      chats.forEach((c) =>
        socketRef.current!.emit("join_room", { chatId: c.id }),
      );
    }
    return () => {};
  }, [user, chats, selectedId]);

  useEffect(() => {
    if (selectedId == null) return;
    setChats((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread: 0 } : c)),
    );
  }, [selectedId]);

  useEffect(() => {
    const username = searchParams.get("username");
    const userIdParam = searchParams.get("userId");
    if (!user || (!username && !userIdParam)) return;
    const targetId = userIdParam ? Number(userIdParam) : null;

    if (targetId && ensuredRef.current.has(targetId)) {
      return;
    }

    const exists = chats.find((c) => {
      const parts = (c as any).rawParticipants as any[] | undefined;
      if (!parts || c.type !== "direct") return false;
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
        const found = (await coreApi.get("/chats")).data.find(
          (c: any) =>
            (c.participants ?? []).some((p: any) => p.userId === user.id) &&
            (c.participants ?? []).some((p: any) => p.userId === targetId),
        );
        if (found) {
          setSelectedId(found.id);
          setChats((prev) => {
            const last = (found.messages ?? [])
              .slice()
              .sort((a: any, b: any) => {
                const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return ta - tb;
              })
              .slice(-1)[0];
            const others = (found.participants ?? []).filter(
              (p: any) => p.userId !== user.id,
            );
            const name =
              others.length > 0
                ? (others[0].username ??
                  [others[0].firstName, others[0].lastName]
                    .filter(Boolean)
                    .join(" "))
                : "Direct chat";
            const mapped: any = {
              id: found.id,
              name,
              avatar: others[0]?.avatarUrl,
              lastMessage: makePreview(
                found.name || (found.participants ?? []).length !== 2
                  ? "group"
                  : "direct",
                last?.body,
                last?.senderId,
                found.participants,
                undefined,
              ),
              time: formatTime(last?.createdAt),
              unread: 0,
              type:
                found.name || (found.participants ?? []).length !== 2
                  ? "group"
                  : "direct",
              participants: others.map((o: any) => ({
                name:
                  o.username ??
                  [o.firstName, o.lastName].filter(Boolean).join(" "),
                avatar: o.avatarUrl,
              })),
              rawParticipants: found.participants,
              createdAt: found.createdAt,
              msgCount: (found.messages ?? []).length,
              isTyping: false,
              typingUsers: [],
            };
            return dedupe([mapped, ...prev], user.id);
          });
          if (targetId) ensuredRef.current.add(targetId);
          return;
        }
        if (targetId) {
          const created = await coreApi.post("/chats", {
            creatorId: user.id,
            participantIds: [user.id, targetId],
          });
          const c = created.data;
          try {
            await coreApi.post("/chat-participants", {
              chatId: c.id,
              userId: user.id,
            });
            await coreApi.post("/chat-participants", {
              chatId: c.id,
              userId: targetId,
            });
          } catch (err) {
            console.error("Failed to ensure chat participants", err);
          }
          let withParts = c;
          try {
            const ref = await coreApi.get(`/chats/${c.id}`);
            withParts = ref.data;
          } catch (err) {
            console.error("Failed to refetch chat details", err);
          }
          const last = (c.messages ?? [])
            .slice()
            .sort((a: any, b: any) => {
              const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return ta - tb;
            })
            .slice(-1)[0];
          const others = (withParts.participants ?? []).filter(
            (p: any) => p.userId !== user.id,
          );
          const name =
            others.length > 0
              ? (others[0].username ??
                [others[0].firstName, others[0].lastName]
                  .filter(Boolean)
                  .join(" "))
              : "Direct chat";
          const mapped: any = {
            id: c.id,
            name,
            avatar: others[0]?.avatarUrl,
            lastMessage: makePreview(
              withParts.name || (withParts.participants ?? []).length !== 2
                ? "group"
                : "direct",
              last?.body,
              last?.senderId,
              withParts.participants,
              undefined,
            ),
            time: formatTime(last?.createdAt),
            unread: 0,
            type:
              withParts.name || (withParts.participants ?? []).length !== 2
                ? "group"
                : "direct",
            participants: others.map((o: any) => ({
              name:
                o.username ??
                [o.firstName, o.lastName].filter(Boolean).join(" "),
              avatar: o.avatarUrl,
            })),
            rawParticipants: withParts.participants,
            createdAt: withParts.createdAt ?? c.createdAt,
            msgCount: (withParts.messages ?? c.messages ?? []).length,
            isTyping: false,
            typingUsers: [],
          };
          setChats((prev) => dedupe([mapped, ...prev], user.id));
          setSelectedId(mapped.id);
          ensuredRef.current.add(targetId);
        }
      } catch (err) {
        console.error("Failed to ensure chat", err);
      }
    };
    ensureChat();
  }, [searchParams, user, chats]);

  const handleGroupCreated = (chatId: number, name?: string) => {
    if (name) {
      groupNamesRef.current.set(chatId, name);
    }
    setSelectedId(chatId);
    loadChats();
  };

  const handleLeaveGroup = () => {
    setSelectedId(null);
    loadChats();
  };

  const handleTypingChange = useCallback(
    (chatId: number, isTyping: boolean, typingUsers: string[]) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                isTyping,
                typingUsers,
              }
            : chat,
        ),
      );
    },
    [],
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header onCreatePost={() => setIsCreatePostOpen(true)} />

        <div className="max-w-[935px] mx-auto">
          <div className="px-4 pb-4">
            <div className="border border-gray-300 rounded-lg overflow-hidden flex h-[calc(100vh-200px)]">
              <ChatSidebar
                chats={chats}
                selectedId={selectedId}
                onSelect={(id) => {
                  setSelectedId(id);
                  setChats((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
                  );
                }}
                onCreateGroup={() => setIsGroupModalOpen(true)}
              />
              <div className="flex-1">
                <ChatWindow
                  chat={activeChat as any}
                  onInteract={() =>
                    setChats((prev) =>
                      prev.map((c) =>
                        c.id === selectedId ? { ...c, unread: 0 } : c,
                      ),
                    )
                  }
                  onOpenInfo={() => setIsChatInfoOpen(true)}
                  onTypingChange={handleTypingChange}
                />
              </div>
            </div>
          </div>
        </div>

        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onCreated={() => setIsCreatePostOpen(false)}
        />

        <CreateGroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onCreated={handleGroupCreated}
        />

        {activeChat && (
          <ChatInfoModal
            isOpen={isChatInfoOpen}
            onClose={() => setIsChatInfoOpen(false)}
            chatId={activeChat.id}
            chatType={activeChat.type}
            chatName={activeChat.name}
            onNameUpdated={(name) => {
              groupNamesRef.current.set(activeChat.id, name);
              setChats((prev) =>
                prev.map((c) => (c.id === activeChat.id ? { ...c, name } : c)),
              );
            }}
            onLeave={handleLeaveGroup}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
