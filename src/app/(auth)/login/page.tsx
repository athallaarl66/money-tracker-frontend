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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });

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

  return (
    <div className="min-h-screen bg-white flex">
      {/* ─── Panel kiri: branding ─── */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #f8f9fb 0%, #eef0f4 100%)",
        }}
      >
        {/* Decorative blobs biar ga polos */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, #e2e8f0 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, #cbd5e1 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div
            className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
          >
            <span className="text-white text-[10px] font-bold tracking-wider">
              MT
            </span>
          </div>
          <span className="text-zinc-900 font-semibold text-sm tracking-tight">
            MoneyTracker
          </span>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <div className="w-8 h-0.5 bg-zinc-300 mb-4" />
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-light italic">
            "Knowing where your money goes is the first step to controlling it."
          </p>
        </div>
      </div>

      {/* ─── Panel kanan: form ─── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 py-12">
        {/* Logo — mobile only */}
        <div className="flex items-center gap-2 mb-12 lg:hidden">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">MT</span>
          </div>
          <span className="text-zinc-900 font-semibold text-sm">
            MoneyTracker
          </span>
        </div>

        <div className="max-w-[360px] w-full mx-auto lg:mx-0">
          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">
              Sign in
            </h1>
            <p className="text-zinc-400 text-sm mt-1.5">
              Welcome back. Enter your details below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 text-sm bg-red-50 border border-red-100
                              text-red-600 px-4 py-3 rounded-xl"
              >
                <AlertIcon />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 text-sm text-zinc-900 rounded-xl outline-none
                           border border-zinc-200 bg-zinc-50/80 placeholder:text-zinc-300
                           focus:bg-white focus:border-zinc-400 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]
                           transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 text-sm text-zinc-900 rounded-xl outline-none pr-12
                             border border-zinc-200 bg-zinc-50/80 placeholder:text-zinc-300
                             focus:bg-white focus:border-zinc-400 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400
                             hover:text-zinc-700 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
            </div>

            {/* Submit button — gradient biar ada depth */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white mt-1
                         transition-all duration-200 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{
                background: loading
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)",
                boxShadow: loading ? "none" : "0 4px 14px rgba(0,0,0,0.22)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-sm text-zinc-400 mt-7 text-center">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-zinc-900 font-semibold hover:underline underline-offset-2"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Inline SVG icons — biar ga perlu import lucide ───

function EyeOn() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="w-4 h-4 mt-0.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
