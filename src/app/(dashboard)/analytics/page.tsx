// money-tracker-fe/src/app/(dashboard)/transactions/page.tsx
"use client";

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

async function getMonthlyTrend(): Promise<MonthlyTrendResponse[]> {
  const res = await api.get("/api/analytics/monthly-trend?months=6");
  return res.data;
}

async function getCategoryBreakdown(): Promise<CategorySummaryResponse[]> {
  const now = new Date();
  const res = await api.get(
    `/api/analytics/categories?year=${now.getFullYear()}&month=${now.getMonth() + 1}`,
  );
  return res.data;
}

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

// Custom tooltip bar chart — pakai any karena recharts types agak ribet
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
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "income" ? "Income" : "Expense"}: {formatRupiah(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: trend = [], isLoading: trendLoading } = useQuery({
    queryKey: ["monthly-trend"],
    queryFn: getMonthlyTrend,
  });

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoryBreakdown,
  });

  const totalExpense = categories.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div
      className="p-4 sm:p-6"
      style={{ background: "#F0F2F8", minHeight: "100%" }}
    >
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-0.5 font-medium">
          Your spending insights
        </p>
      </div>

      {/* Monthly Trend Bar Chart */}
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
          <div
            className="h-48 rounded-xl animate-pulse"
            style={{ background: "#F1F5F9" }}
          />
        ) : trend.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No data yet
          </div>
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

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: "#1D4ED8" }}
            />
            <span className="text-xs font-semibold text-slate-500">Income</span>
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
      </div>

      {/* Category Breakdown Pie Chart */}
      <div
        className="bg-white rounded-2xl p-5"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
      >
        <div className="mb-4">
          <p className="font-extrabold text-slate-900 text-sm">
            Expense by Category
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            This month
          </p>
        </div>

        {catLoading ? (
          <div
            className="h-48 rounded-xl animate-pulse"
            style={{ background: "#F1F5F9" }}
          />
        ) : categories.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No expense data this month
          </div>
        ) : (
          <>
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

            <div className="space-y-3 mt-2">
              {categories.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
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
