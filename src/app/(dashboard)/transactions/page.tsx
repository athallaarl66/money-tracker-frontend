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
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";

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

// Kelompokkan transaksi berdasarkan tanggal
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

const CATEGORY_ICONS: Record<string, string> = {
  "Food & Drink": "🍜",
  Transport: "🚗",
  Shopping: "🛍️",
  Health: "🏥",
  Entertainment: "🎬",
  Education: "📚",
  Bills: "🧾",
  Salary: "💼",
  Investment: "📈",
  Other: "💡",
};

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL",
  );
  const [filterAccount, setFilterAccount] = useState<number>(0);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getAllTransactions,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { mutate: saveCreate, isPending: isCreating } = useMutation({
    mutationFn: (data: TransactionRequest) =>
      createTransaction(data.accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setModalOpen(false);
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
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: ({ accountId, id }: { accountId: number; id: number }) =>
      deleteTransaction(accountId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });

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

  const handleDelete = (tx: Transaction) => {
    if (window.confirm(`Delete "${tx.description}"?`)) {
      remove({ accountId: tx.accountId, id: tx.id });
    }
  };

  const handleAddNew = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  // Filter transaksi sesuai pilihan user
  const filtered = transactions.filter((tx) => {
    const typeMatch = filterType === "ALL" || tx.transactionType === filterType;
    const accountMatch = filterAccount === 0 || tx.accountId === filterAccount;
    return typeMatch && accountMatch;
  });

  const grouped = groupByDate(filtered);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Hitung total income & expense dari filtered
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
          </p>
        </div>
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

      {/* Summary mini cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D1FAE5, #6EE7B7)" }}
          >
            <TrendingUp size={15} color="#059669" />
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
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #FEE2E2, #FECACA)" }}
          >
            <TrendingDown size={15} color="#DC2626" />
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

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {/* Filter by type */}
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

        {/* Filter by account */}
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(Number(e.target.value))}
          className="ml-auto px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none"
        >
          <option value={0}>All Accounts</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.7)" }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-bold text-slate-700">No transactions yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Start by adding your first transaction.
          </p>
          <Button
            onClick={handleAddNew}
            className="gap-2 text-white font-bold"
            style={{ background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)" }}
          >
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      )}

      {/* Grouped transactions */}
      <div className="space-y-5">
        {sortedDates.map((date) => (
          <div key={date}>
            {/* Date header */}
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
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background:
                        tx.transactionType === "INCOME"
                          ? "linear-gradient(135deg, #D1FAE5, #6EE7B7)"
                          : "linear-gradient(135deg, #FEE2E2, #FECACA)",
                    }}
                  >
                    {CATEGORY_ICONS[tx.category] ?? "💡"}
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
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-extrabold text-sm"
                      style={{
                        color:
                          tx.transactionType === "INCOME"
                            ? "#059669"
                            : "#DC2626",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {tx.transactionType === "INCOME" ? "+" : "-"}
                      {formatRupiah(tx.amount)}
                    </p>
                  </div>

                  {/* Edit & Delete */}
                  <div className="flex gap-1 flex-shrink-0">
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
                      onClick={() => handleDelete(tx)}
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

      {/* Modal */}
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
    </div>
  );
}
