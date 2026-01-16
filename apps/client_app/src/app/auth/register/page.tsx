"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/client_app/context/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import GoogleLoginButton from "../../../components/ui/GoogleLoginButton";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, loginWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      router.push("/profile");
    } catch (error) {
      setError("root", {
        message: "Registration failed. Please try again.",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        {/* Main Card */}
        <div className="bg-white border border-gray-300 rounded-none md:rounded-sm p-8 md:p-10 mb-3">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-4">Instagram</h1>
            <p className="text-gray-500 text-sm font-semibold px-8">
              Sign up to see photos and videos from your friends.
            </p>
          </div>

          <GoogleLoginButton
            onSuccess={async (credential) => {
              try {
                await loginWithGoogle(credential);
                router.push("/");
              } catch (error) {
                setError("root", {
                  message: "Google login failed. Please try again.",
                });
              }
            }}
          />

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-4 text-xs font-semibold text-gray-500">OR</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Error Message */}
          {errors.root && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-sm text-red-600 text-center">
                {errors.root.message}
              </p>
            </div>
          )}

          {/* Register Form */}
          <div className="space-y-2" onKeyPress={handleKeyPress}>
            <div>
              <input
                type="text"
                placeholder="Email"
                {...register("email")}
                className={`w-full px-2 py-2 text-xs border rounded-sm bg-gray-50 focus:bg-white focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:border-gray-400"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="First Name"
                {...register("firstName")}
                className={`w-full px-2 py-2 text-xs border rounded-sm bg-gray-50 focus:bg-white focus:outline-none ${
                  errors.firstName ? "border-red-500" : "border-gray-300 focus:border-gray-400"
                }`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Last Name"
                {...register("lastName")}
                className={`w-full px-2 py-2 text-xs border rounded-sm bg-gray-50 focus:bg-white focus:outline-none ${
                  errors.lastName ? "border-red-500" : "border-gray-300 focus:border-gray-400"
                }`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Username"
                {...register("username")}
                className={`w-full px-2 py-2 text-xs border rounded-sm bg-gray-50 focus:bg-white focus:outline-none ${
                  errors.username ? "border-red-500" : "border-gray-300 focus:border-gray-400"
                }`}
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone (optional)"
                {...register("phone")}
                className="w-full px-2 py-2 text-xs border rounded-sm bg-gray-50 focus:bg-white focus:outline-none border-gray-300 focus:border-gray-400"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`w-full px-2 py-2 text-xs border rounded-sm bg-gray-50 focus:bg-white focus:outline-none ${
                  errors.password ? "border-red-500" : "border-gray-300 focus:border-gray-400"
                }`}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-blue-900 hover:underline">
              Terms
            </Link>
            ,{" "}
            <Link href="/privacy" className="text-blue-900 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/cookies" className="text-blue-900 hover:underline">
              Cookies Policy
            </Link>
            .
          </p>
        </div>

        <div className="bg-white border border-gray-300 rounded-none md:rounded-sm p-6 text-center">
          <p className="text-sm">
            Have an account?{" "}
            <Link href="/auth/login" className="text-blue-500 font-semibold hover:text-blue-600">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}