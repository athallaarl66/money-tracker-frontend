// money-tracker-fe/src/components/shared/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  BarChart2,
  LogOut,
  X,
  Clock,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: CreditCard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Budget", href: "/budgets", icon: Wallet },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Recurring", href: "/recurring", icon: RefreshCw },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)" }}
          >
            <Clock size={14} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">
            MoneyTracker
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={onClose}
          >
            <X size={16} />
          </Button>
        )}
      </div>

      <div className="mx-4 h-px bg-slate-100" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 font-semibold",
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-900",
                )}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
                        boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
                      }
                    : {}
                }
              >
                <Icon size={17} />
                {label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4">
        <div className="h-px bg-slate-100 mx-1 mb-3" />

        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 mb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)" }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut size={16} />
          Sign out
        </Button>
      </div>
    </div>
  );
}
