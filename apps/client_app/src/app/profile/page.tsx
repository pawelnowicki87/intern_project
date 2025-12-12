import InstagramProfile from "../components/InstagramProfile";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <InstagramProfile />
    </ProtectedRoute>
  );
}
