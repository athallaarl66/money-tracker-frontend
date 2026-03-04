// money-tracker-fe/src/app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import useAuthStore from "@/store/authStore";
import Sidebar from "@/components/shared/Sidebar";

const navLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/accounts": "Accounts",
  "/transactions": "Transactions",
  "/analytics": "Analytics",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/login");
  }, [mounted, isAuthenticated, router]);
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  if (!mounted || !isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F0F2F8" }}
      >
        <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#F0F2F8" }}>
      {/* Sidebar desktop */}
      <aside
        className="hidden md:flex w-56 flex-col fixed h-full z-20 border-r border-slate-100"
        style={{ boxShadow: "4px 0 24px rgba(0,0,0,0.04)" }}
      >
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className="fixed top-0 left-0 h-full w-64 z-40 md:hidden transition-transform duration-300 ease-in-out"
        style={{
          boxShadow: "8px 0 32px rgba(0,0,0,0.12)",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <Sidebar onClose={() => setDrawerOpen(false)} />
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-56 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 px-4 md:px-6 py-3.5 flex items-center justify-between bg-[#F0F2F8]/90 backdrop-blur-md border-b border-black/5">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-8 h-8"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={18} />
            </Button>
            <p className="text-sm font-extrabold text-slate-800 tracking-tight">
              {navLabels[pathname] ?? "Dashboard"}
            </p>
          </div>
          <p className="text-xs font-medium text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-xs font-medium text-slate-400 sm:hidden">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </header>

        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
