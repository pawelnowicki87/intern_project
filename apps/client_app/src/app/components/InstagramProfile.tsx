"use client";

import { useAuth } from "@/client_app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function InstagramProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My profile</h1>

      <div className="space-y-2 mb-6">
        <div><strong>Username:</strong> {user.username}</div>
        <div><strong>First name:</strong> {user.firstName}</div>
        <div><strong>Last name:</strong> {user.lastName}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Phone:</strong> {user.phone ?? "—"}</div>
        <div>
          <strong>Private profile:</strong>{" "}
          {user.isPrivate ? "Yes" : "No"}
        </div>
      </div>

      <button
        onClick={() => router.push("/profile/edit")}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Edit profile
      </button>
    </div>
  );
}
