// money-tracker-fe/src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Cek kekuatan password — simpel tapi informatif
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return null;
    if (pass.length < 6)
      return { label: "Too short", color: "bg-red-400", pct: "25%" };
    if (pass.length < 8)
      return { label: "Weak", color: "bg-orange-400", pct: "50%" };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass))
      return { label: "Strong", color: "bg-emerald-500", pct: "100%" };
    return { label: "Fair", color: "bg-yellow-400", pct: "75%" };
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/register", { name, email, password });
      router.replace("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
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

        <div className="relative z-10">
          <div className="w-8 h-0.5 bg-zinc-300 mb-4" />
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-light italic">
            "A budget is telling your money where to go instead of wondering
            where it went."
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
              Create account
            </h1>
            <p className="text-zinc-400 text-sm mt-1.5">
              Start tracking your finances today.
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

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoComplete="name"
                className="w-full px-4 py-3.5 text-sm text-zinc-900 rounded-xl outline-none
                           border border-zinc-200 bg-zinc-50/80 placeholder:text-zinc-300
                           focus:bg-white focus:border-zinc-400 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]
                           transition-all duration-200"
              />
            </div>

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

            {/* Password + strength bar */}
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
                  autoComplete="new-password"
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

              {/* Password strength indicator */}
              {strength && (
                <div className="space-y-1 pt-0.5">
                  <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.pct }}
                    />
                  </div>
                  <p className="text-xs text-zinc-400">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className={`w-full px-4 py-3.5 text-sm text-zinc-900 rounded-xl outline-none pr-12
                              border bg-zinc-50/80 placeholder:text-zinc-300 transition-all duration-200
                              focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]
                              ${
                                passwordsMismatch
                                  ? "border-red-300 focus:border-red-400"
                                  : passwordsMatch
                                    ? "border-emerald-300 focus:border-emerald-400"
                                    : "border-zinc-200 focus:border-zinc-400"
                              }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400
                             hover:text-zinc-700 transition-colors p-1"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff /> : <EyeOn />}
                </button>
              </div>

              {/* Match feedback */}
              {passwordsMismatch && (
                <p className="text-xs text-red-400">Passwords don't match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-emerald-500">Looks good ✓</p>
              )}
            </div>

            {/* Submit */}
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-sm text-zinc-400 mt-7 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-zinc-900 font-semibold hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Inline SVG icons ───

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
