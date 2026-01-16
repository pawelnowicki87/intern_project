// 'use client';
// import { useEffect, useMemo, useState } from 'react';
// import { notificationsApi, coreApi } from '@/client_app/lib/api';
// import { useAuth } from '@/client_app/context/AuthContext';
// import NotificationPreferences from './NotificationPreferences';

// interface Notification {
//   id: number;
//   recipientId: number;
//   senderId: number;
//   action: 'FOLLOW_REQUEST' | 'FOLLOW_ACCEPTED' | 'FOLLOW_REJECTED' | 'MENTION_COMMENT' | 'MENTION_POST';
//   targetId: number;
//   isRead: boolean;
//   createdAt: string;
// }

// export default function NotificationCenter() {
//   const { user } = useAuth();
//   const [items, setItems] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [prefs, setPrefs] = useState<Record<string, boolean>>({});
//   const [busy, setBusy] = useState<number | null>(null);

//   useEffect(() => {
//     const load = async () => {
//       if (!user?.id) return;
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await notificationsApi.get<Notification[]>(`/notifications/user/${user.id}`);
//         setItems(res.data ?? []);
//       } catch {
//         setError('Nie udało się wczytać powiadomień');
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [user?.id]);

//   const filtered = useMemo(() => {
//     if (!prefs) return items;
//     return items.filter((n) => prefs[n.action] !== false);
//   }, [items, prefs]);

//   const approveFollow = async (n: Notification) => {
//     if (!user?.id) return;
//     setBusy(n.id);
//     try {
//       await coreApi.patch(`/follows/${n.targetId}/${user.id}/accept`);
//       try {
//         await notificationsApi.put(`/notifications/${n.id}`, { isRead: true });
//       } catch {}
//       setItems((prev) =>
//         prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
//       );
//     } catch {
//       setError('Nie udało się zaakceptować prośby');
//     } finally {
//       setBusy(null);
//     }
//   };

//   const rejectFollow = async (n: Notification) => {
//     if (!user?.id) return;
//     setBusy(n.id);
//     try {
//       await coreApi.patch(`/follows/${n.targetId}/${user.id}/reject`);
//       try {
//         await notificationsApi.put(`/notifications/${n.id}`, { isRead: true });
//       } catch {}
//       setItems((prev) =>
//         prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
//       );
//     } catch {
//       setError('Nie udało się odrzucić prośby');
//     } finally {
//       setBusy(null);
//     }
//   };

//   const renderAction = (n: Notification) => {
//     switch (n.action) {
//       case 'FOLLOW_REQUEST':
//         return (
//           <div className="flex items-center gap-2">
//             <button
//               disabled={busy === n.id}
//               onClick={() => approveFollow(n)}
//               className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md"
//             >
//               Akceptuj
//             </button>
//             <button
//               disabled={busy === n.id}
//               onClick={() => rejectFollow(n)}
//               className="px-3 py-1 text-sm bg-gray-200 rounded-md"
//             >
//               Odrzuć
//             </button>
//           </div>
//         );
//       case 'FOLLOW_ACCEPTED':
//         return <span className="text-xs text-gray-600">Twoja prośba została zaakceptowana</span>;
//       case 'FOLLOW_REJECTED':
//         return <span className="text-xs text-gray-600">Twoja prośba została odrzucona</span>;
//       case 'MENTION_POST':
//         return <span className="text-xs text-gray-600">Wspomniano Cię w poście</span>;
//       case 'MENTION_COMMENT':
//         return <span className="text-xs text-gray-600">Wspomniano Cię w komentarzu</span>;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-[935px] mx-auto p-4">
//         <div className="mb-4">
//           <NotificationPreferences onChange={setPrefs as any} />
//         </div>
//         {loading && <div className="text-sm text-gray-500">Ładowanie…</div>}
//         {error && <div className="text-sm text-red-600">{error}</div>}
//         {!loading && !error && (
//           <div className="space-y-3">
//             {filtered.map((n) => (
//               <div
//                 key={n.id}
//                 className="p-3 border rounded-lg flex items-center justify-between"
//               >
//                 <div>
//                   <div className="text-sm font-semibold">{n.action}</div>
//                   <div className="text-xs text-gray-500">
//                     {new Date(n.createdAt).toLocaleString()}
//                   </div>
//                 </div>
//                 <div>{renderAction(n)}</div>
//               </div>
//             ))}
//             {filtered.length === 0 && (
//               <div className="text-sm text-gray-500">Brak powiadomień</div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
