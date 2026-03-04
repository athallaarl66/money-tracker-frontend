"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";
import { SummaryResponse } from "@/types";
import Link from "next/link";
import useAuthStore from "@/store/authStore";

async function getSummary(): Promise<SummaryResponse> {
  const now = new Date();
  const response = await api.get(
    `/api/analytics/summary?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
  );
  return response.data;
}

async function getAccounts() {
  const response = await api.get("/api/accounts");
  return response.data;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;
    startTime.current = null;
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return current;
}

function AnimatedAmount({
  amount,
  className,
  style,
}: {
  amount: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const animated = useCountUp(amount);
  return (
    <span className={className} style={style}>
      {formatRupiah(animated)}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary"],
    queryFn: getSummary,
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const monthName = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-full" style={{ background: "#F0F2F8" }}>
      {/* HERO */}
      <div
        className="relative overflow-hidden px-5 sm:px-8 pt-8 sm:pt-10 pb-20"
        style={{
          background:
            "linear-gradient(135deg, #060D20 0%, #0B1A3E 40%, #102260 70%, #0D2B7A 100%)",
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div
          className="absolute -right-20 top-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -left-10 bottom-0 w-48 sm:w-72 h-48 sm:h-72 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase">
              {getGreeting()}, {firstName}
            </p>
          </div>
          <h1
            className="text-white font-extrabold leading-tight mb-1"
            style={{
              fontSize: "clamp(1.4rem, 4vw, 1.75rem)",
              letterSpacing: "-0.5px",
            }}
          >
            Financial Overview
          </h1>
          <p className="text-blue-300/60 text-sm font-medium">{monthName}</p>
        </div>

        <div className="relative z-10 mt-6 sm:mt-8 animate-fade-up-delay-1">
          <p className="text-blue-300/70 text-xs font-semibold tracking-widest uppercase mb-2">
            Total Net Balance
          </p>
          {summaryLoading ? (
            <div className="h-12 w-48 rounded-xl skeleton" />
          ) : (
            <AnimatedAmount
              amount={summary?.netBalance ?? 0}
              className="text-white font-extrabold"
              style={{
                fontSize: "clamp(2rem, 6vw, 2.5rem)",
                letterSpacing: "-1.5px",
                lineHeight: "1",
              }}
            />
          )}
        </div>

        {/* Decorative cards */}
        <div
          className="absolute right-6 sm:right-8 bottom-6 sm:bottom-8 w-24 sm:w-32 h-16 sm:h-20 rounded-2xl border opacity-10"
          style={{
            borderColor: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.05)",
          }}
        />
      </div>

      {/* STATS CARDS — float over hero */}
      <div className="px-4 sm:px-6 -mt-8 relative z-10 animate-fade-up-delay-2">
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 sm:p-5"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                Income
              </span>
            </div>
            {summaryLoading ? (
              <div className="h-6 w-24 skeleton" />
            ) : (
              <AnimatedAmount
                amount={summary?.totalIncome ?? 0}
                className="font-extrabold text-slate-900 block"
                style={{
                  fontSize: "clamp(0.9rem, 3vw, 1.15rem)",
                  letterSpacing: "-0.5px",
                }}
              />
            )}
          </div>

          <div
            className="rounded-2xl p-4 sm:p-5"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #FEE2E2, #FECACA)",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                Expenses
              </span>
            </div>
            {summaryLoading ? (
              <div className="h-6 w-24 skeleton" />
            ) : (
              <AnimatedAmount
                amount={summary?.totalExpense ?? 0}
                className="font-extrabold text-slate-900 block"
                style={{
                  fontSize: "clamp(0.9rem, 3vw, 1.15rem)",
                  letterSpacing: "-0.5px",
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ACCOUNTS */}
      <div className="px-4 sm:px-6 mt-6 animate-fade-up-delay-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
            Your Accounts
          </h2>
          <Link
            href="/accounts"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Manage all
          </Link>
        </div>

        {accountsLoading ? (
          <div className="space-y-3">
            <div className="h-16 rounded-2xl skeleton" />
            <div className="h-16 rounded-2xl skeleton" />
          </div>
        ) : accounts?.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center border-2 border-dashed"
            style={{ borderColor: "#CBD5E1" }}
          >
            <p className="text-2xl mb-2">🏦</p>
            <p className="text-sm font-semibold text-slate-500">
              No accounts yet
            </p>
            <Link
              href="/accounts"
              className="text-sm font-bold text-blue-600 mt-1 inline-block"
            >
              + Add your first account
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts?.map(
              (acc: {
                id: number;
                name: string;
                type: string;
                balance: number;
              }) => (
                <div
                  key={acc.id}
                  className="rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between"
                  style={{
                    background: "white",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        background:
                          acc.type === "CASH"
                            ? "linear-gradient(135deg, #D1FAE5, #6EE7B7)"
                            : acc.type === "E-WALLET"
                              ? "linear-gradient(135deg, #EDE9FE, #C4B5FD)"
                              : "linear-gradient(135deg, #DBEAFE, #93C5FD)",
                      }}
                    >
                      {acc.type === "CASH"
                        ? "💵"
                        : acc.type === "E-WALLET"
                          ? "📱"
                          : "🏦"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {acc.type}
                      </p>
                    </div>
                  </div>
                  <p
                    className="font-extrabold text-sm flex-shrink-0 ml-2"
                    style={{
                      letterSpacing: "-0.3px",
                      color: acc.balance < 0 ? "#EF4444" : "#0F172A",
                    }}
                  >
                    {formatRupiah(acc.balance)}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-4 sm:px-6 mt-6 pb-10">
        <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/transactions"
            className="group rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-95"
            style={{
              background: "white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                Add Transaction
              </p>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Income or expense
              </p>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="group rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-95"
            style={{
              background: "white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6D28D9"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M3 18l6-6 4 4 8-8" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                Analytics
              </p>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Spending trends
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
