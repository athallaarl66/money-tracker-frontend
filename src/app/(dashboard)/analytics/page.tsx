// money-tracker-fe/src/app/(dashboard)/transactions/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { MonthlyTrendResponse, CategorySummaryResponse } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── API fetchers ─────────────────────────────────────────────────

async function getMonthlyTrend(): Promise<MonthlyTrendResponse[]> {
  const res = await api.get("/api/analytics/monthly-trend?months=6");
  return res.data;
}

async function getCategoryBreakdown(
  year: number,
  month: number,
): Promise<CategorySummaryResponse[]> {
  const res = await api.get(
    `/api/analytics/categories?year=${year}&month=${month}`,
  );
  return res.data;
}

// ─── Helpers ─────────────────────────────────────────────────────

function formatRupiahShort(amount: number) {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return `Rp ${amount}`;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Warna konsisten per index — ga akan berubah-ubah
const PIE_COLORS = [
  "#1D4ED8",
  "#7C3AED",
  "#059669",
  "#DC2626",
  "#D97706",
  "#0891B2",
  "#DB2777",
  "#65A30D",
];

// ─── Custom tooltip bar chart ─────────────────────────────────────

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "income" ? "Income" : "Expense"}: {formatRupiah(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Month selector component ─────────────────────────────────────

function MonthSelector({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) {
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  const goPrev = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const goNext = () => {
    // Ga bisa ke masa depan
    if (isCurrentMonth) return;
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goPrev}
        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center
                   justify-center transition-colors"
        aria-label="Previous month"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <span className="text-sm font-bold text-slate-700 min-w-[90px] text-center">
        {MONTHS[month - 1]} {year}
      </span>

      <button
        onClick={goNext}
        disabled={isCurrentMonth}
        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center
                   justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next month"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

// ─── Empty state component ────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-14 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-400">{message}</p>
      <p className="text-xs text-slate-300 mt-1">
        Add some transactions to see insights here.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data: trend = [], isLoading: trendLoading } = useQuery({
    queryKey: ["monthly-trend"],
    queryFn: getMonthlyTrend,
    // Data trend 6 bulan — refresh tiap 5 menit cukup
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories", selectedYear, selectedMonth],
    queryFn: () => getCategoryBreakdown(selectedYear, selectedMonth),
  });

  const totalExpense = categories.reduce((sum, c) => sum + c.totalAmount, 0);

  // Insight otomatis — ambil kategori terbesar
  const topCategory = categories[0] ?? null;

  return (
    <div
      className="p-4 sm:p-6"
      style={{ background: "#F0F2F8", minHeight: "100%" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-0.5 font-medium">
          Your spending insights
        </p>
      </div>

      {/* ── Monthly Trend Bar Chart ── */}
      <div
        className="bg-white rounded-2xl p-5 mb-4"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
      >
        <div className="mb-4">
          <p className="font-extrabold text-slate-900 text-sm">
            Income vs Expense
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Last 6 months
          </p>
        </div>

        {trendLoading ? (
          <div className="h-52 skeleton" />
        ) : trend.length === 0 ? (
          <EmptyState message="No trend data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} barGap={4} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fontWeight: 600, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatRupiahShort}
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "#F8FAFC" }} />
              <Bar
                dataKey="income"
                name="income"
                fill="#1D4ED8"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="expense"
                fill="#FCA5A5"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        {!trendLoading && trend.length > 0 && (
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: "#1D4ED8" }}
              />
              <span className="text-xs font-semibold text-slate-500">
                Income
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ background: "#FCA5A5" }}
              />
              <span className="text-xs font-semibold text-slate-500">
                Expense
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Category Breakdown ── */}
      <div
        className="bg-white rounded-2xl p-5"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
      >
        {/* Header + month selector */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <p className="font-extrabold text-slate-900 text-sm">
              Expense by Category
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Breakdown per bulan
            </p>
          </div>
          <MonthSelector
            year={selectedYear}
            month={selectedMonth}
            onChange={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
          />
        </div>

        {catLoading ? (
          <div className="space-y-3">
            <div className="h-44 skeleton" />
            <div className="h-3 skeleton w-3/4" />
            <div className="h-3 skeleton w-1/2" />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState message="No expense data this month" />
        ) : (
          <>
            {/* Insight banner — muncul kalau ada data */}
            {topCategory && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                style={{ background: "#F8FAFF", border: "1px solid #E0E7FF" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: PIE_COLORS[0] }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-600">
                  <span className="font-bold">{topCategory.category}</span> is
                  your biggest expense this month at{" "}
                  <span className="font-bold text-slate-900">
                    {topCategory.percentage.toFixed(1)}%
                  </span>{" "}
                  of total spending.
                </p>
              </div>
            )}

            {/* Donut chart */}
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="totalAmount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => [
                    formatRupiah(Number(value)),
                    "",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #F1F5F9",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Category list dengan progress bar */}
            <div className="space-y-3 mt-2">
              {categories.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        {cat.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({cat.transactionCount}x)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">
                        {formatRupiah(cat.totalAmount)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        background: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Total Expense
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {formatRupiah(totalExpense)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
