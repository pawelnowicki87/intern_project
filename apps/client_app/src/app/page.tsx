"use client";

import { useAuth } from "@/client_app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "./components/ui/Loader";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/feed");
      } else {
        router.replace("/auth/login");
      }
    }
  }, [user, loading]);

  return <Loader fullScreen />;
}
