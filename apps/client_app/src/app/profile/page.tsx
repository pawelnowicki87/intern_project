import ProfilePage from "../components/profile/ProfilePage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
