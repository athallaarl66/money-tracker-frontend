// money-tracker-fe/src/components/shared/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

// Daftar menu navigasi
// href = url tujuan, label = teks yang ditampilkan, icon = emoji simple
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/accounts", label: "Accounts", icon: "🏦" },
  { href: "/transactions", label: "Transactions", icon: "💸" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
];

export default function Sidebar() {
  const pathname = usePathname(); // tau halaman mana yang lagi aktif
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside className="w-60 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      {/* Logo / App name */}
      <div className="px-6 py-5 border-b border-slate-100">
        <p className="text-base font-bold text-slate-900">💰 Money Tracker</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>
      </div>

      {/* Menu navigasi */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          // Active = kalau url sekarang sama dengan href menu ini
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-slate-900 text-white" // aktif: gelap
                    : "text-slate-600 hover:bg-slate-100" // tidak aktif: abu-abu
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tombol logout di bawah */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
