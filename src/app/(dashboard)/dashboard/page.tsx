// money-tracker-fe/src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { SummaryResponse } from "@/types";

// Fungsi buat fetch data summary dari BE
// Ini yang dipanggil React Query tiap halaman dibuka
async function getSummary(): Promise<SummaryResponse> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() mulai dari 0
  const response = await api.get(
    `/api/analytics/summary?year=${year}&month=${month}`,
  );
  return response.data;
}

export default function DashboardPage() {
  // useQuery = minta data, sambil kasih status loading/error/data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["summary"], //  cache
    queryFn: getSummary, // fungsi yang dipanggil
  });

  // loading handler
  if (isLoading) return <div>Loading...</div>;

  // error handler
  if (isError) return <div>Gagal load data.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card Income */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Income</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">
            Rp {data?.totalIncome.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Card Expense */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Total Expense</p>
          <p className="text-2xl font-semibold text-red-500 mt-1">
            Rp {data?.totalExpense.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Card Net Balance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Net Balance</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            Rp {data?.netBalance.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
}
