// 'use client';
// import { useEffect, useState } from 'react';

// type Prefs = {
//   FOLLOW_REQUEST: boolean;
//   FOLLOW_ACCEPTED: boolean;
//   FOLLOW_REJECTED: boolean;
//   MENTION_POST: boolean;
//   MENTION_COMMENT: boolean;
// };

// const DEFAULT_PREFS: Prefs = {
//   FOLLOW_REQUEST: true,
//   FOLLOW_ACCEPTED: true,
//   FOLLOW_REJECTED: true,
//   MENTION_POST: true,
//   MENTION_COMMENT: true,
// };

// export default function NotificationPreferences({
//   onChange,
// }: {
//   onChange?: (prefs: Prefs) => void;
// }) {
//   const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

//   useEffect(() => {
//     try {
//       const raw = localStorage.getItem('notifPrefs');
//       if (raw) {
//         const parsed = JSON.parse(raw);
//         setPrefs({ ...DEFAULT_PREFS, ...parsed });
//       }
//     } catch {}
//   }, []);

//   useEffect(() => {
//     try {
//       localStorage.setItem('notifPrefs', JSON.stringify(prefs));
//     } catch {}
//     onChange?.(prefs);
//   }, [prefs, onChange]);

//   const toggle = (key: keyof Prefs) => {
//     setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   return (
//     <div className="p-3 border rounded-lg bg-white">
//       <div className="font-semibold mb-2 text-sm">Notification Preferences</div>
//       {Object.keys(DEFAULT_PREFS).map((k) => (
//         <label key={k} className="flex items-center gap-2 py-1 text-sm">
//           <input
//             type="checkbox"
//             checked={prefs[k as keyof Prefs]}
//             onChange={() => toggle(k as keyof Prefs)}
//           />
//           <span>{k.replace('_', ' ')}</span>
//         </label>
//       ))}
//     </div>
//   );
// }
