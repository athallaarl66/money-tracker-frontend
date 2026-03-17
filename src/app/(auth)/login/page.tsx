// money-tracker-fe/src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import { AuthResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Shared login handler (reusable)
   */
  const login = async (payload: { email: string; password: string }) => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post<AuthResponse>("/api/auth/login", payload);

      setAuth(res.data.token, {
        email: res.data.email,
        name: res.data.name,
      });

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  /**
   * Demo login (clean, no duplicate logic)
   */
  const handleDemoLogin = async () => {
    await login({
      email: "johndoe@gmail.com",
      password: "johndoe123",
    });
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #f8f9fb 0%, #eef0f4 100%)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">MT</span>
          </div>
          <span className="text-zinc-900 font-semibold text-sm">
            MoneyTracker
          </span>
        </div>

        <p className="text-zinc-500 text-sm italic max-w-xs">
          "Knowing where your money goes is the first step to controlling it."
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 py-12">
        <div className="max-w-[360px] w-full mx-auto">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Sign in</h1>
          <p className="text-sm text-zinc-400 mb-6">Enter your details below</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-400 outline-none"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-medium bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* DEMO BUTTON */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-3 py-3 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition"
          >
            Continue as demo user
          </button>

          <p className="text-sm text-zinc-400 mt-6 text-center">
            Don't have an account?{" "}
            <Link href="/register" className="text-zinc-900 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
