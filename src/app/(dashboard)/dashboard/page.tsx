// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { getAllTransactions } from "@/lib/transactionApi";
import { getAccounts } from "@/lib/accountApi";
import { SummaryResponse, Transaction, Account } from "@/types";
import useAuthStore from "@/store/authStore";

// ─── API fetchers ────────────────────────────────────────────────

async function getSummary(
  year: number,
  month: number,
): Promise<SummaryResponse> {
  const res = await api.get(
    `/api/analytics/summary?year=${year}&month=${month}`,
  );
  return res.data;
}

// ─── Helpers ─────────────────────────────────────────────────────

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

// Hitung % perubahan — null kalau previous 0 (ga bisa dibagi)
function calcChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// ─── Count-up animation hook ──────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setCurrent(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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

// ─── ChangeBadge ──────────────────────────────────────────────────
// invertColor: true untuk expense — naik expense = buruk = merah

function ChangeBadge({
  change,
  invertColor = false,
}: {
  change: number | null;
  invertColor?: boolean;
}) {
  if (change === null) return null;

  const isGood = invertColor ? change <= 0 : change >= 0;
  const absChange = Math.abs(change);

  return (
    <div
      className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
        isGood ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
      }`}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        {change >= 0 ? (
          <path d="M12 19V5M5 12l7-7 7 7" />
        ) : (
          <path d="M12 5v14M5 12l7 7 7-7" />
        )}
      </svg>
      {absChange.toFixed(1)}%
    </div>
  );
}

// ─── TransactionRow ───────────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.transactionType === "INCOME";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
        style={{
          background: isIncome
            ? "linear-gradient(135deg, #D1FAE5, #6EE7B7)"
            : "linear-gradient(135deg, #FEE2E2, #FECACA)",
          color: isIncome ? "#059669" : "#DC2626",
        }}
      >
        {isIncome ? "↑" : "↓"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {tx.description || "No description"}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {tx.category} · {tx.accountName}
        </p>
      </div>

      <p
        className="text-sm font-bold shrink-0"
        style={{ color: isIncome ? "#059669" : "#DC2626" }}
      >
        {isIncome ? "+" : "-"}
        {formatRupiah(tx.amount)}
      </p>
    </div>
  );
}

// ─── AccountRow ───────────────────────────────────────────────────

function AccountRow({ acc }: { acc: Account }) {
  const emoji =
    acc.type === "CASH" ? "💵" : acc.type === "E-WALLET" ? "📱" : "🏦";
  const bg =
    acc.type === "CASH"
      ? "linear-gradient(135deg, #D1FAE5, #6EE7B7)"
      : acc.type === "E-WALLET"
        ? "linear-gradient(135deg, #EDE9FE, #C4B5FD)"
        : "linear-gradient(135deg, #DBEAFE, #93C5FD)";

  return (
    <div
      className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
      style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
          style={{ background: bg }}
        >
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">
            {acc.name}
          </p>
          <p className="text-xs text-slate-400">{acc.type}</p>
        </div>
      </div>
      <p
        className="font-extrabold text-sm shrink-0 ml-2"
        style={{
          letterSpacing: "-0.3px",
          color: acc.balance < 0 ? "#EF4444" : "#0F172A",
        }}
      >
        {formatRupiah(acc.balance)}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  // Bulan lalu — handle edge case Januari
  const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1;
  const prevYear = thisMonth === 1 ? thisYear - 1 : thisYear;

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["summary", thisYear, thisMonth],
    queryFn: () => getSummary(thisYear, thisMonth),
  });

  // Query bulan lalu untuk hitung perbandingan — staleTime panjang karena data historis
  const { data: prevSummary } = useQuery({
    queryKey: ["summary", prevYear, prevMonth],
    queryFn: () => getSummary(prevYear, prevMonth),
    staleTime: 10 * 60 * 1000, // 10 menit
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: allTransactions, isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getAllTransactions,
  });

  // 5 transaksi terbaru — sort by date descending
  const recentTransactions =
    allTransactions
      ?.slice()
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      )
      .slice(0, 5) ?? [];

  const incomeChange = calcChange(
    summary?.totalIncome ?? 0,
    prevSummary?.totalIncome ?? 0,
  );
  const expenseChange = calcChange(
    summary?.totalExpense ?? 0,
    prevSummary?.totalExpense ?? 0,
  );

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const monthName = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-full" style={{ background: "#F0F2F8" }}>
      {/* ── HERO ────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden px-5 sm:px-8 pt-8 pb-20"
        style={{
          background:
            "linear-gradient(135deg, #060D20 0%, #0B1A3E 40%, #102260 70%, #0D2B7A 100%)",
        }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div
          className="absolute -right-20 top-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -left-10 bottom-0 w-72 h-72 rounded-full pointer-events-none"
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

        <div className="relative z-10 mt-6 animate-fade-up-delay-1">
          <p className="text-blue-300/70 text-xs font-semibold tracking-widest uppercase mb-2">
            Total Net Balance
          </p>
          {summaryLoading ? (
            <div className="h-12 w-48 skeleton rounded-xl" />
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
      </div>

      {/* ── STATS CARDS — nge-float di atas hero ────────────────── */}
      <div className="px-4 sm:px-6 -mt-8 relative z-10 animate-fade-up-delay-2">
        <div className="grid grid-cols-2 gap-3">
          {/* Income */}
          <div
            className="rounded-2xl p-4 sm:p-5"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
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
              <ChangeBadge change={incomeChange} />
            </div>

            {summaryLoading ? (
              <div className="h-6 w-24 skeleton" />
            ) : (
              <>
                <AnimatedAmount
                  amount={summary?.totalIncome ?? 0}
                  className="font-extrabold text-slate-900 block"
                  style={{
                    fontSize: "clamp(0.85rem, 3vw, 1.05rem)",
                    letterSpacing: "-0.5px",
                  }}
                />
                {incomeChange === null && (
                  <p className="text-xs text-slate-300 mt-1">
                    No data last month
                  </p>
                )}
              </>
            )}
          </div>

          {/* Expense */}
          <div
            className="rounded-2xl p-4 sm:p-5"
            style={{
              background: "rgba(255,255,255,0.97)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #FEE2E2, #FECACA)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
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
                  Expense
                </span>
              </div>
              {/* invertColor karena expense naik = buruk */}
              <ChangeBadge change={expenseChange} invertColor />
            </div>

            {summaryLoading ? (
              <div className="h-6 w-24 skeleton" />
            ) : (
              <>
                <AnimatedAmount
                  amount={summary?.totalExpense ?? 0}
                  className="font-extrabold text-slate-900 block"
                  style={{
                    fontSize: "clamp(0.85rem, 3vw, 1.05rem)",
                    letterSpacing: "-0.5px",
                  }}
                />
                {expenseChange === null && (
                  <p className="text-xs text-slate-300 mt-1">
                    No data last month
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── RECENT TRANSACTIONS ──────────────────────────────────── */}
      <div className="px-4 sm:px-6 mt-6 animate-fade-up-delay-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-500 tracking-widest uppercase">
            Recent Transactions
          </h2>
          <Link
            href="/transactions"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            See all
          </Link>
        </div>

        <div
          className="bg-white rounded-2xl px-4"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {txLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 skeleton rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 skeleton w-32" />
                    <div className="h-3 skeleton w-20" />
                  </div>
                  <div className="h-3.5 skeleton w-16" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-2xl mb-2">💸</p>
              <p className="text-sm font-semibold text-slate-400">
                No transactions yet
              </p>
              <Link
                href="/transactions"
                className="text-sm font-bold text-blue-600 mt-1 inline-block"
              >
                + Add your first transaction
              </Link>
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))
          )}
        </div>
      </div>

      {/* ── YOUR ACCOUNTS ────────────────────────────────────────── */}
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
          <div className="space-y-2">
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
            {accounts?.map((acc) => (
              <AccountRow key={acc.id} acc={acc} />
            ))}
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 mt-6 pb-10 animate-fade-up-delay-3">
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
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #DBEAFE, #BFDBFE)",
              }}
            >
              <svg
                width="14"
                height="14"
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
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)",
              }}
            >
              <svg
                width="14"
                height="14"
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
