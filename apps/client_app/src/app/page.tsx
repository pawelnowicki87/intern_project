"use client";

import { useAuth } from "@/client_app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/profile");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}
