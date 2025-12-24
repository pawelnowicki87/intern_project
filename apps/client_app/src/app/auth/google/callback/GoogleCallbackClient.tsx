"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, coreApi } from "@/client_app/lib/api";
import { setAccessToken } from "@/client_app/lib/auth";
import { useAuth } from "@/client_app/context/AuthContext";

export default function GoogleCallbackClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = params.get("accessToken");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setAccessToken(token);

    const load = async () => {
      const me = await authApi.get("/auth/me");
      const core = await coreApi.get("/users", {
        params: { email: me.data.email },
      });
      setUser(core.data);
      router.replace("/");
    };

    load().catch(() => router.replace("/auth/login"));
  }, []);

  return null;
}
