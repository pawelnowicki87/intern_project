import EditProfile from "../../components/profile/edit/EditProfile";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  );
}
