"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/client_app/lib/auth";
import { authApi, coreApi } from "@/client_app/lib/api";
import { useAuth } from "@/client_app/context/AuthContext";

export default function GoogleCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const accessToken = params.get("accessToken");

    if (!accessToken) {
      router.push("/auth/login");
      return;
    }

    setTokens(accessToken, "");

    async function loadUser() {
      try {
        const authMe = await authApi.get("/auth/me");

        const coreRes = await coreApi.get("/users", {
          params: { email: authMe.data.email },
        });

        setUser(coreRes.data);

        router.push("/");
      } catch (e) {
        router.push("/auth/login");
      }
    }

    loadUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Logging in with Google...
    </div>
  );
}
