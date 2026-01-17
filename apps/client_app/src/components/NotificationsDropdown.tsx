'use client';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { coreApi } from '@/lib/api';
import { navigateForNotification } from './nav';
import { useRouter } from 'next/navigation';

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && user?.id) {
      try {
        const res = await coreApi.get(`/notifications/user/${user.id}`);
        setItems(res.data ?? []);
      } catch {
      }
    }
  };
  return (
    <div className="relative">
      <button onClick={toggle} className="p-1">
        <Bell className="w-6 h-6" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="p-2 text-sm font-semibold border-b border-gray-200">Powiadomienia</div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">Brak powiadomień</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={async () => {
                    await navigateForNotification(router, n);
                    setOpen(false);
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100"
                >
                  <div className="text-sm">{n.action}</div>
                  <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
