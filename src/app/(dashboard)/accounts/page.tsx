// money-tracker-fe/src/app/(dashboard)/accounts/page.tsx
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
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; icon: string }> =
  {
    BANK: {
      label: "Bank",
      bg: "linear-gradient(135deg, #DBEAFE, #93C5FD)",
      icon: "🏦",
    },
    CASH: {
      label: "Cash",
      bg: "linear-gradient(135deg, #D1FAE5, #6EE7B7)",
      icon: "💵",
    },
    "E-WALLET": {
      label: "E-Wallet",
      bg: "linear-gradient(135deg, #EDE9FE, #C4B5FD)",
      icon: "📱",
    },
  };

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [modalTarget, setModalTarget] = useState<Account | "new" | null>(null);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { mutate: saveCreate, isPending: isCreating } = useMutation({
    mutationFn: (data: AccountRequest) => createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setModalTarget(null);
    },
  });

  const { mutate: saveUpdate, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountRequest }) =>
      updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setModalTarget(null);
    },
  });

  const { mutate: removeAccount } = useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });

  const handleSave = (data: AccountRequest) => {
    if (modalTarget === "new") {
      saveCreate(data);
    } else if (modalTarget !== null) {
      saveUpdate({ id: modalTarget.id, data });
    }
  };

  const handleDelete = (account: Account) => {
    const confirmed = window.confirm(
      `Delete "${account.name}"? All transactions in this account will also be deleted.`,
    );
    if (confirmed) removeAccount(account.id);
  };

  return (
    <div
      className="p-4 sm:p-6"
      style={{ background: "#F0F2F8", minHeight: "100%" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Accounts
          </h1>
          <p className="text-sm text-slate-400 mt-0.5 font-medium">
            Manage your bank accounts, cash, and e-wallets.
          </p>
        </div>
        <Button
          onClick={() => setModalTarget("new")}
          className="gap-2 font-bold text-white shadow-md"
          style={{
            background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
            boxShadow: "0 4px 12px rgba(29,78,216,0.3)",
          }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Account</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.7)" }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && accounts?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{ background: "linear-gradient(135deg, #DBEAFE, #93C5FD)" }}
          >
            🏦
          </div>
          <p className="font-bold text-slate-700 text-lg">No accounts yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            Add your first account to start tracking.
          </p>
          <Button
            onClick={() => setModalTarget("new")}
            className="gap-2 text-white font-bold"
            style={{ background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)" }}
          >
            <Plus size={16} />
            Add Account
          </Button>
        </div>
      )}

      {/* Account cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts?.map((account: Account) => {
          const config = TYPE_CONFIG[account.type] ?? {
            label: account.type,
            bg: "#F1F5F9",
            icon: "💳",
          };
          return (
            <div
              key={account.id}
              className="bg-white rounded-2xl p-5 flex flex-col justify-between"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
            >
              {/* Top row: icon + name + type */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: config.bg }}
                >
                  {config.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm leading-tight truncate">
                    {account.name}
                  </p>
                  <span className="text-xs font-semibold text-slate-400">
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Balance */}
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Balance
                </p>
                <p
                  className="font-extrabold text-2xl tracking-tight"
                  style={{ color: account.balance < 0 ? "#EF4444" : "#0F172A" }}
                >
                  {formatRupiah(account.balance)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Initial: {formatRupiah(account.initialBalance)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 font-semibold text-slate-600"
                  onClick={() => setModalTarget(account)}
                >
                  <Pencil size={13} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 font-semibold text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(account)}
                >
                  <Trash2 size={13} />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <AccountModal
        account={modalTarget === "new" ? null : modalTarget}
        open={modalTarget !== null}
        onClose={() => setModalTarget(null)}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />
    </div>
  );
}
