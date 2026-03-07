// money-tracker-fe/src/components/recurring/page.tsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Account, RecurringTransaction } from "@/types";
import {
  getRecurringTransactions,
  deleteRecurringTransaction,
  toggleRecurringTransaction,
} from "@/lib/recurringApi";
import { getAccounts } from "@/lib/accountApi";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import RecurringModal from "@/components/recurring/RecurringModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FREQUENCY_LABEL: Record<string, string> = {
  DAILY: "Setiap Hari",
  WEEKLY: "Setiap Minggu",
  MONTHLY: "Setiap Bulan",
  YEARLY: "Setiap Tahun",
};

function formatNextRun(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Recurring Card ───────────────────────────────────────────────────────────

interface RecurringCardProps {
  item: RecurringTransaction;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
  onToggle: (item: RecurringTransaction) => void;
}

function RecurringCard({
  item,
  onEdit,
  onDelete,
  onToggle,
}: RecurringCardProps) {
  const isIncome = item.transactionType === "INCOME";

  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        opacity: item.active ? 1 : 0.6,
      }}
    >
      {/* Row atas */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {item.description}
            </p>
            {!item.active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                Paused
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{item.accountName}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onToggle(item)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors text-sm"
            title={item.active ? "Pause" : "Resume"}
          >
            {item.active ? "⏸" : "▶️"}
          </button>
          <button
            onClick={() => onEdit(item)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(item)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-sm"
            title="Hapus"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Amount + type */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-lg font-bold"
          style={{ color: isIncome ? "#059669" : "#DC2626" }}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(item.amount)}
        </p>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: isIncome ? "#ECFDF5" : "#FEF2F2",
            color: isIncome ? "#059669" : "#DC2626",
          }}
        >
          {isIncome ? "Pemasukan" : "Pengeluaran"}
        </span>
      </div>

      {/* Info bawah */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">🔄</span>
          <span className="text-xs font-medium text-gray-600">
            {FREQUENCY_LABEL[item.frequency]}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Eksekusi berikutnya</p>
          <p className="text-xs font-semibold text-gray-700">
            {formatNextRun(item.nextRunDate)}
          </p>
        </div>
      </div>

      {item.category && (
        <div className="mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            {item.category}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RecurringSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="skeleton h-4 w-1/2 rounded mb-2" />
          <div className="skeleton h-3 w-1/4 rounded mb-4" />
          <div className="skeleton h-6 w-1/3 rounded mb-3" />
          <div className="flex justify-between">
            <div className="skeleton h-3 w-1/4 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────

interface DeleteDialogProps {
  item: RecurringTransaction | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function DeleteDialog({
  item,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteDialogProps) {
  if (!item) return null;

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
          Hapus Transaksi Berulang?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-medium text-gray-700">
            "{item.description}"
          </span>{" "}
          akan dihapus permanen. Transaksi yang sudah terbuat tidak terpengaruh.
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<RecurringTransaction | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recurringData, accountsData] = await Promise.all([
        getRecurringTransactions(),
        getAccounts(),
      ]);
      setItems(recurringData);
      setAccounts(accountsData);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleEdit(item: RecurringTransaction) {
    setEditData(item);
    setIsModalOpen(true);
  }

  function handleAddNew() {
    setEditData(null);
    setIsModalOpen(true);
  }

  async function handleToggle(item: RecurringTransaction) {
    try {
      await toggleRecurringTransaction(item.id);
      toast.success(
        item.active
          ? "Transaksi berulang dijeda"
          : "Transaksi berulang dilanjutkan",
      );
      loadData();
    } catch {
      toast.error("Gagal mengubah status");
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRecurringTransaction(deleteTarget.id);
      toast.success("Transaksi berulang berhasil dihapus");
      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error("Gagal menghapus transaksi berulang");
    } finally {
      setIsDeleting(false);
    }
  }

  const activeCount = items.filter((i) => i.active).length;
  const pausedCount = items.filter((i) => !i.active).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaksi Berulang
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Transaksi otomatis yang berjalan sesuai jadwal
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
          Tambah
        </button>
      </div>

      {/* Summary badges */}
      {!isLoading && items.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-600">
              {activeCount} aktif
            </span>
          </div>
          {pausedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="text-xs font-medium text-gray-500">
                {pausedCount} dijeda
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <RecurringSkeleton />
      ) : items.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <p className="text-4xl mb-3">🔄</p>
          <p className="font-semibold text-gray-800 mb-1">
            Belum ada transaksi berulang
          </p>
          <p className="text-sm text-gray-500 mb-5">
            Tambahkan transaksi yang rutin terjadi seperti langganan, gaji, atau
            tagihan
          </p>
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
              boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)",
            }}
          >
            Tambah Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <RecurringCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        onSuccess={loadData}
        editData={editData}
        accounts={accounts}
      />

      <DeleteDialog
        item={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
