import EditProfile from './components/EditProfile';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  );
}
