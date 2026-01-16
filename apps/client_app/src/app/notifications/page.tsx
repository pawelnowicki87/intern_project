'use client';
import ProtectedRoute from '../components/ProtectedRoute';
import NotificationCenter from '../components/notifications/NotificationCenter';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationCenter />
    </ProtectedRoute>
  );
}
