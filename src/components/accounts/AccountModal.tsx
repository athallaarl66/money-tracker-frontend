// money-tracker-fe/src/components/accounts/AccountModal.tsx

"use client";

import { useState, useEffect } from "react";
import { Account, AccountRequest } from "@/types";

interface Props {
  // account diisi waktu edit, kosong waktu tambah baru
  account: Account | null;
  onClose: () => void;
  onSave: (data: AccountRequest) => void;
  isSaving: boolean;
}

// Nilai awal form waktu modal pertama dibuka
const emptyForm: AccountRequest = {
  name: "",
  type: "BANK",
  initialBalance: 0,
};

export default function AccountModal({
  account,
  onClose,
  onSave,
  isSaving,
}: Props) {
  const [form, setForm] = useState<AccountRequest>(emptyForm);

  // Kalau mode edit: isi form dengan data account yang mau diedit
  // Kalau mode tambah: reset form ke kosong
  // useEffect jalan tiap kali props "account" berubah
  useEffect(() => {
    if (account) {
      setForm({
        name: account.name,
        type: account.type,
        initialBalance: account.initialBalance,
      });
    } else {
      setForm(emptyForm);
    }
  }, [account]);

  const isEditMode = account !== null;

  return (
    // Overlay gelap di belakang modal
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          {isEditMode ? "Edit Account" : "Add Account"}
        </h2>

        <div className="space-y-3">
          {/* Nama account */}
          <input
            type="text"
            placeholder="Account name (e.g. BCA, Cash, GoPay)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          {/* Tipe account: CASH, BANK, atau E-WALLET */}
          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value as AccountRequest["type"],
              })
            }
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="BANK">Bank</option>
            <option value="CASH">Cash</option>
            <option value="E-WALLET">E-Wallet</option>
          </select>

          {/* Initial balance hanya bisa diubah waktu CREATE, bukan edit */}
          {/* Karena balance sudah terpengaruh transaksi setelah dibuat */}
          <input
            type="number"
            placeholder="Initial balance"
            value={form.initialBalance || ""}
            onChange={(e) =>
              setForm({ ...form, initialBalance: Number(e.target.value) })
            }
            disabled={isEditMode}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
          />
          {isEditMode && (
            <p className="text-xs text-slate-400">
              Initial balance can't be changed after creation.
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.name.trim()}
            className="flex-1 bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-700 disabled:bg-slate-300"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
