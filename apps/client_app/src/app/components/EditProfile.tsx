"use client";

import { useAuth } from "@/client_app/context/AuthContext";
import { coreApi } from "@/client_app/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phone: z.string().optional(),
  isPrivate: z.boolean(),
});

type FormState = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  isPrivate: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function EditProfile() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    isPrivate: false,
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      isPrivate: Boolean(user.isPrivate),
    });
  }, [user]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setError("");
  };

  const validate = () => {
    const result = schema.safeParse(form);

    if (result.success) {
      setFieldErrors({});
      return true;
    }

    const nextErrors: FormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FormState;
      if (key) nextErrors[key] = issue.message;
    }
    setFieldErrors(nextErrors);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const ok = validate();
    if (!ok) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        phone: form.phone.trim() === "" ? undefined : form.phone.trim(),
      };

      const res = await coreApi.patch(`/users/${user.id}`, payload);
      setUser(res.data);
      router.push("/profile");
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit profile</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First name"
            className="w-full border p-2 rounded"
          />
          {fieldErrors.firstName && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.firstName}</p>
          )}
        </div>

        <div>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last name"
            className="w-full border p-2 rounded"
          />
          {fieldErrors.lastName && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.lastName}</p>
          )}
        </div>

        <div>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full border p-2 rounded"
          />
          {fieldErrors.username && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.username}</p>
          )}
        </div>

        <div>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full border p-2 rounded"
          />
          {fieldErrors.phone && (
            <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>
          )}
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPrivate"
            checked={form.isPrivate}
            onChange={handleChange}
          />
          Private profile
        </label>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
