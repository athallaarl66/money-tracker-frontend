"use client";

import { useCallback, useEffect, useState } from "react";
import { Budget } from "@/types";
import { getBudgets, deleteBudget } from "@/lib/budgetApi";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import BudgetModal from "@/components/budgets/BudgetModal";

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function BudgetProgressBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 100 ? "#DC2626" : percentage >= 80 ? "#D97706" : "#059669";

  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(percentage, 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function BudgetStatusBadge({ percentage }: { percentage: number }) {
  if (percentage >= 100) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
        Over Budget
      </span>
    );
  }
  if (percentage >= 80) {
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
        Hampir Habis
      </span>
    );
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
      Aman
    </span>
  );
}

// ─── Budget Card ──────────────────────────────────────────────────────────────

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {budget.category}
          </p>
          <BudgetStatusBadge percentage={budget.percentage} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm"
            title="Edit budget"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
            title="Hapus budget"
          >
            🗑️
          </button>
        </div>
      </div>

      <BudgetProgressBar percentage={budget.percentage} />

      <div className="flex items-center justify-between mt-2.5">
        <div>
          <p className="text-xs text-gray-400">Terpakai</p>
          <p className="text-sm font-semibold" style={{ color: "#DC2626" }}>
            {formatCurrency(budget.spentAmount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">
            {budget.remainingAmount >= 0 ? "Sisa" : "Melebihi"}
          </p>
          <p
            className="text-sm font-semibold"
            style={{
              color: budget.remainingAmount >= 0 ? "#059669" : "#DC2626",
            }}
          >
            {formatCurrency(Math.abs(budget.remainingAmount))}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-400">
          Limit:{" "}
          <span className="text-gray-600 font-medium">
            {formatCurrency(budget.limitAmount)}
          </span>
        </p>
        <p
          className="text-xs font-semibold"
          style={{
            color:
              budget.percentage >= 100
                ? "#DC2626"
                : budget.percentage >= 80
                  ? "#D97706"
                  : "#6B7280",
          }}
        >
          {budget.percentage.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BudgetSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="skeleton h-4 w-1/3 rounded mb-2" />
          <div className="skeleton h-3 w-1/5 rounded mb-4" />
          <div className="skeleton h-2 w-full rounded-full mb-3" />
          <div className="flex justify-between">
            <div className="skeleton h-4 w-1/4 rounded" />
            <div className="skeleton h-4 w-1/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

interface DeleteDialogProps {
  budget: Budget | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteDialog({
  budget,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteDialogProps) {
  if (!budget) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fade-up"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          Hapus Budget?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Budget kategori{" "}
          <span className="font-medium text-gray-700">"{budget.category}"</span>{" "}
          akan dihapus permanen. Data transaksi tidak terpengaruh.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Month Selector ───────────────────────────────────────────────────────────

interface MonthSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

function MonthSelector({ value, onChange }: MonthSelectorProps) {
  function shift(direction: -1 | 1) {
    const [year, month] = value.split("-").map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    onChange(`${newYear}-${newMonth}`);
  }

  const label = new Date(value + "-01").toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => shift(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-sm"
      >
        ‹
      </button>
      <span className="text-sm font-semibold text-gray-800 min-w-[130px] text-center">
        {label}
      </span>
      <button
        onClick={() => shift(1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors text-sm"
      >
        ›
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Budget | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBudgets(selectedMonth);
      setBudgets(data);
    } catch {
      toast.error("Gagal memuat data budget");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  function handleEdit(budget: Budget) {
    setEditData(budget);
    setIsModalOpen(true);
  }

  function handleAddNew() {
    setEditData(null);
    setIsModalOpen(true);
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setEditData(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBudget(deleteTarget.id);
      toast.success("Budget berhasil dihapus");
      setDeleteTarget(null);
      loadBudgets();
    } catch {
      toast.error("Gagal menghapus budget");
    } finally {
      setIsDeleting(false);
    }
  }

  const overBudgetCount = budgets.filter((b) => b.percentage >= 100).length;
  const warningCount = budgets.filter(
    (b) => b.percentage >= 80 && b.percentage < 100,
  ).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Atur batas pengeluaran per kategori setiap bulan
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
            boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)",
          }}
        >
          <span>+</span>
          Tambah Budget
        </button>
      </div>

      {/* Month selector + alert badges */}
      <div className="flex items-center gap-4 flex-wrap">
        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />

        {!isLoading &&
          budgets.length > 0 &&
          (overBudgetCount > 0 || warningCount > 0) && (
            <div className="flex items-center gap-2 flex-wrap">
              {overBudgetCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-red-600">
                    {overBudgetCount} over budget
                  </span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-amber-600">
                    {warningCount} hampir habis
                  </span>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Content */}
      {isLoading ? (
        <BudgetSkeleton />
      ) : budgets.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <p className="text-4xl mb-3">💰</p>
          <p className="font-semibold text-gray-800 mb-1">Belum ada budget</p>
          <p className="text-sm text-gray-500 mb-5">
            Tambah budget untuk melacak pengeluaran per kategori bulan ini
          </p>
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
              boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)",
            }}
          >
            Tambah Budget Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={loadBudgets}
        editData={editData}
        selectedMonth={selectedMonth}
      />

      <DeleteDialog
        budget={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
