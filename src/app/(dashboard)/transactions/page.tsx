// src/app/(dashboard)/transactions/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction, TransactionRequest } from "@/types";
import {
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/transactionApi";
import { getAccounts } from "@/lib/accountApi";
import TransactionModal from "@/components/transactions/TransactionModal";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  Download,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CATEGORY_EMOJI } from "@/components/transactions/TransactionModal";
import { exportTransactionsCsv } from "@/lib/exportApi";

// ─── Helpers ─────────────────────────────────────────────────────

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Kelompokkan transaksi berdasarkan tanggal (YYYY-MM-DD)
function groupByDate(
  transactions: Transaction[],
): Record<string, Transaction[]> {
  return transactions.reduce(
    (groups, tx) => {
      const date = tx.transactionDate.slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
      return groups;
    },
    {} as Record<string, Transaction[]>,
  );
}

// ─── Delete confirm dialog — gantiin window.confirm yang jelek ───

function DeleteConfirmDialog({
  tx,
  onConfirm,
  onCancel,
}: {
  tx: Transaction;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative bg-white rounded-2xl p-6 max-w-sm w-full"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
      >
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <h3 className="font-bold text-slate-900 text-base mb-1">
          Delete transaction?
        </h3>
        <p className="text-sm text-slate-400 mb-5">
          "{tx.description}" will be permanently removed.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1 text-white font-bold"
            onClick={onConfirm}
            style={{ background: "linear-gradient(135deg, #DC2626, #EF4444)" }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function TransactionsPage() {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL",
  );
  const [filterAccount, setFilterAccount] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getAllTransactions,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  // Ambil semua kategori unik dari data yang ada
  const availableCategories = Array.from(
    new Set(transactions.map((tx) => tx.category)),
  ).sort();

  // ── Mutations ──

  const { mutate: saveCreate, isPending: isCreating } = useMutation({
    mutationFn: (data: TransactionRequest) =>
      createTransaction(data.accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setModalOpen(false);
      toast.success("Transaction added", "Your transaction has been recorded.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error("Failed to save", msg ?? "Please try again.");
    },
  });

  const { mutate: saveUpdate, isPending: isUpdating } = useMutation({
    mutationFn: (data: TransactionRequest & { id: number }) =>
      updateTransaction(data.accountId, data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setEditTarget(null);
      setModalOpen(false);
      toast.success("Transaction updated", "Changes have been saved.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error("Failed to update", msg ?? "Please try again.");
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: ({ accountId, id }: { accountId: number; id: number }) =>
      deleteTransaction(accountId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setDeleteTarget(null);
      toast.success("Transaction deleted");
    },
    onError: () => {
      setDeleteTarget(null);
      toast.error("Failed to delete", "Please try again.");
    },
  });

  // ── Handlers ──

  const handleSave = (data: TransactionRequest) => {
    if (editTarget) {
      saveUpdate({ ...data, id: editTarget.id });
    } else {
      saveCreate(data);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditTarget(tx);
    setModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    remove({ accountId: deleteTarget.accountId, id: deleteTarget.id });
  };

  const handleAddNew = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportTransactionsCsv();
    setIsExporting(false);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("ALL");
    setFilterAccount(0);
    setFilterCategory("ALL");
  };

  // ── Filter logic ──

  const filtered = transactions.filter((tx) => {
    const matchType = filterType === "ALL" || tx.transactionType === filterType;
    const matchAccount = filterAccount === 0 || tx.accountId === filterAccount;
    const matchCategory =
      filterCategory === "ALL" || tx.category === filterCategory;
    // Search by description atau category — case insensitive
    const matchSearch =
      !search ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());

    return matchType && matchAccount && matchCategory && matchSearch;
  });

  const hasActiveFilter =
    search ||
    filterType !== "ALL" ||
    filterAccount !== 0 ||
    filterCategory !== "ALL";

  const grouped = groupByDate(filtered);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const totalIncome = filtered
    .filter((t) => t.transactionType === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filtered
    .filter((t) => t.transactionType === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div
      className="p-4 sm:p-6"
      style={{ background: "#F0F2F8", minHeight: "100%" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
            {hasActiveFilter && " (filtered)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export CSV button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || transactions.length === 0}
            variant="outline"
            className="gap-2 font-bold text-slate-600 border-slate-200"
          >
            <Download size={15} />
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Export CSV"}
            </span>
          </Button>

          <Button
            onClick={handleAddNew}
            className="gap-2 font-bold text-white shadow-md"
            style={{
              background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
              boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
            }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #D1FAE5, #6EE7B7)" }}
          >
            <TrendingUp size={14} color="#059669" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Income
            </p>
            <p
              className="font-extrabold text-sm text-slate-900"
              style={{ letterSpacing: "-0.3px" }}
            >
              {formatRupiah(totalIncome)}
            </p>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #FEE2E2, #FECACA)" }}
          >
            <TrendingDown size={14} color="#DC2626" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Expenses
            </p>
            <p
              className="font-extrabold text-sm text-slate-900"
              style={{ letterSpacing: "-0.3px" }}
            >
              {formatRupiah(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search by description or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
                     focus:outline-none focus:border-slate-400 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]
                     transition-all placeholder:text-slate-300"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {/* Type filter */}
        {(["ALL", "INCOME", "EXPENSE"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
            style={
              filterType === type
                ? {
                    background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
                    color: "white",
                    borderColor: "transparent",
                  }
                : {
                    background: "white",
                    color: "#64748B",
                    borderColor: "#E2E8F0",
                  }
            }
          >
            {type === "ALL"
              ? "All"
              : type === "INCOME"
                ? "💰 Income"
                : "💸 Expense"}
          </button>
        ))}

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white
                     text-slate-600 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_EMOJI[cat] ?? "📦"} {cat}
            </option>
          ))}
        </select>

        {/* Account filter */}
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(Number(e.target.value))}
          className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white
                     text-slate-600 focus:outline-none"
        >
          <option value={0}>All Accounts</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>

        {/* Clear filter button — muncul kalau ada filter aktif */}
        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs font-bold
                       text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl skeleton" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">{hasActiveFilter ? "🔍" : "📭"}</div>
          <p className="font-bold text-slate-700">
            {hasActiveFilter ? "No results found" : "No transactions yet"}
          </p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            {hasActiveFilter
              ? "Try adjusting your filters."
              : "Start by adding your first transaction."}
          </p>
          {!hasActiveFilter && (
            <Button
              onClick={handleAddNew}
              className="gap-2 text-white font-bold"
              style={{
                background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
              }}
            >
              <Plus size={16} />
              Add Transaction
            </Button>
          )}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="text-sm font-bold text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Grouped transactions */}
      <div className="space-y-5">
        {sortedDates.map((date) => (
          <div key={date}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
              {formatDate(date)}
            </p>

            <div className="space-y-2">
              {grouped[date].map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  {/* Category icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{
                      background:
                        tx.transactionType === "INCOME"
                          ? "linear-gradient(135deg, #D1FAE5, #6EE7B7)"
                          : "linear-gradient(135deg, #FEE2E2, #FECACA)",
                    }}
                  >
                    {CATEGORY_EMOJI[tx.category] ?? "📦"}
                  </div>

                  {/* Description + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {tx.category} · {tx.accountName}
                    </p>
                  </div>

                  {/* Amount */}
                  <p
                    className="font-extrabold text-sm shrink-0"
                    style={{
                      color:
                        tx.transactionType === "INCOME" ? "#059669" : "#DC2626",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {tx.transactionType === "INCOME" ? "+" : "-"}
                    {formatRupiah(tx.amount)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 hover:text-slate-700"
                      onClick={() => handleEdit(tx)}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-slate-400 hover:text-red-500"
                      onClick={() => setDeleteTarget(tx)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal add/edit */}
      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
        initial={
          editTarget
            ? {
                accountId: editTarget.accountId,
                description: editTarget.description,
                amount: editTarget.amount,
                transactionType: editTarget.transactionType,
                category: editTarget.category,
                transactionDate: editTarget.transactionDate.slice(0, 10),
              }
            : null
        }
      />

      {/* Delete confirmation dialog — gantiin window.confirm */}
      {deleteTarget && (
        <DeleteConfirmDialog
          tx={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
