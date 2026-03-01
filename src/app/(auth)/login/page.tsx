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

  // State untuk form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default supaya form tidak reload halaman
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });

      // Simpan token dan user info ke Zustand store
      setAuth(response.data.token, {
        email: response.data.email,
        name: response.data.name,
      });

      router.replace("/dashboard");
    } catch (err: any) {
      // Tangkap error dari BE
      setError(
        err.response?.data?.message || "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      {/* Card container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">MT</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">
              MoneyTracker
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg 
                           bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 
                           focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg 
                           bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 
                           focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 
                         text-white text-sm font-medium py-2.5 rounded-lg transition-colors
                         disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white 
                                   rounded-full animate-spin"
                  />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Link ke register */}
        <p className="text-center text-sm text-slate-500 mt-4">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-slate-900 font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
