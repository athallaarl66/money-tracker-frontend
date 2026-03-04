// money-tracker-fe/src/app/(dashboard)/accounts/page.tsx
// Halaman utama manage accounts: list + add + edit + delete

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Account, AccountRequest } from "@/types";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "@/lib/accountApi";
import AccountModal from "@/components/accounts/AccountModal";

// Label badge per tipe account
const TYPE_LABEL: Record<string, string> = {
  BANK: "🏦 Bank",
  CASH: "💵 Cash",
  "E-WALLET": "📱 E-Wallet",
};

export default function AccountsPage() {
  const queryClient = useQueryClient();

  // null = modal tutup, "new" = mode tambah, Account object = mode edit
  const [modalTarget, setModalTarget] = useState<Account | null | "new">(null);

  // Fetch semua accounts
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  // Mutation: create account baru
  const { mutate: saveCreate, isPending: isCreating } = useMutation({
    mutationFn: (data: AccountRequest) => createAccount(data),
    onSuccess: () => {
      // Setelah berhasil, refresh list accounts
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setModalTarget(null);
    },
  });

  // Mutation: update account yang sudah ada
  const { mutate: saveUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountRequest }) =>
      updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setModalTarget(null);
    },
  });

  // Mutation: hapus account
  const { mutate: removeAccount } = useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      // Juga refresh summary di dashboard karena balance berubah
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });

  // Dipanggil waktu user klik Save di modal
  // Bedain mode create vs edit dari tipe modalTarget
  const handleSave = (data: AccountRequest) => {
    if (modalTarget === "new") {
      saveCreate(data);
    } else if (modalTarget !== null) {
      saveUpdate({ id: modalTarget.id, data });
    }
  };

  const handleDeleteWithConfirm = (account: Account) => {
    // window.confirm = popup bawaan browser, simple dan cukup
    const confirmed = window.confirm(
      `Delete "${account.name}"? All transactions in this account will also be deleted.`,
    );
    if (confirmed) removeAccount(account.id);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your bank accounts, cash, and e-wallets.
          </p>
        </div>
        <button
          onClick={() => setModalTarget("new")}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
        >
          + Add Account
        </button>
      </div>

      {/* Loading state */}
      {isLoading && <div className="text-slate-500">Loading accounts...</div>}

      {/* Empty state */}
      {!isLoading && accounts?.length === 0 && (
        <div className="text-center text-slate-500 py-16">
          <p className="text-4xl mb-3">🏦</p>
          <p className="font-medium">No accounts yet</p>
          <p className="text-sm mt-1">
            Add your first account to start tracking.
          </p>
        </div>
      )}

      {/* Account Cards — satu card per account */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts?.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            {/* Baris atas: nama + badge tipe */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">{account.name}</p>
                <span className="text-xs text-slate-500 mt-0.5 inline-block">
                  {TYPE_LABEL[account.type] ?? account.type}
                </span>
              </div>
            </div>

            {/* Balance */}
            <p className="text-2xl font-bold text-slate-900 mt-4">
              Rp {account.balance.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Initial: Rp {account.initialBalance.toLocaleString("id-ID")}
            </p>

            {/* Tombol Edit & Delete */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setModalTarget(account)}
                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteWithConfirm(account)}
                className="flex-1 text-sm px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: muncul kalau modalTarget bukan null */}
      {modalTarget !== null && (
        <AccountModal
          // Kalau "new" → kirim null ke modal (mode tambah)
          // Kalau Account object → kirim data account (mode edit)
          account={modalTarget === "new" ? null : modalTarget}
          onClose={() => setModalTarget(null)}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
