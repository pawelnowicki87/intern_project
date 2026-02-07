"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader } from "../components/ui/Loader";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!loading && !didRedirect.current) {
      didRedirect.current = true;
      if (user) {
        router.replace('/feed');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [user, loading, router]);

  return <Loader fullScreen />;
}
