"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/client_app/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password); // <- WOŁAMY AUTH CONTEXT
      router.push("/");            // <- PRZEKIEROWANIE
    } catch (err: any) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Log in</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded"
          >
            Log in
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-blue-600 underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
