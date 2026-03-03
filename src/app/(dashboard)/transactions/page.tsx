"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Transaction, TransactionRequest } from "@/types";

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

async function getAccounts(): Promise<Account[]> {
  const response = await api.get("/api/accounts");
  return response.data;
}

async function getTransactions(accountId: number): Promise<Transaction[]> {
  const response = await api.get(`/api/accounts/${accountId}/transactions`);
  return response.data;
}

async function createTransaction(
  accountId: number,
  data: Omit<TransactionRequest, "accountId">,
): Promise<Transaction> {
  const response = await api.post(
    `/api/accounts/${accountId}/transactions`,
    data,
  );
  return response.data;
}

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );
  const [form, setForm] = useState({
    description: "",
    amount: 0,
    transactionType: "EXPENSE" as "INCOME" | "EXPENSE",
    category: "",
  });

  // Fetch accounts untuk dropdown
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  // Fetch transaksi berdasarkan account yang dipilih
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", selectedAccountId],
    queryFn: () => getTransactions(selectedAccountId!),
    enabled: !!selectedAccountId,
  });

  const { mutate: addTransaction, isPending } = useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: number;
      data: typeof form;
    }) => createTransaction(accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      setShowModal(false);
      setForm({
        description: "",
        amount: 0,
        transactionType: "EXPENSE",
        category: "",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedAccountId) return;
    addTransaction({ accountId: selectedAccountId, data: form });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            All your income and expenses.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      {/* Filter by Account */}
      <div className="mb-4">
        <select
          value={selectedAccountId ?? ""}
          onChange={(e) => setSelectedAccountId(Number(e.target.value))}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">All Accounts</option>
          {accounts?.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {!selectedAccountId ? (
        <div className="text-center text-slate-500 py-12">
          Select an account to view transactions.
        </div>
      ) : isLoading ? (
        <div>Loading...</div>
      ) : transactions?.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          No transactions yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {transactions?.map((trx) => (
            <div
              key={trx.id}
              className="flex items-center justify-between px-5 py-4 border-b border-slate-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {trx.description}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {trx.category} · {trx.accountName}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${trx.transactionType === "INCOME" ? "text-green-600" : "text-red-500"}`}
              >
                {trx.transactionType === "INCOME" ? "+" : "-"}Rp{" "}
                {trx.amount.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Add Transaction
            </h2>
            <div className="space-y-3">
              {/* Account dropdown di modal */}
              <select
                value={selectedAccountId ?? ""}
                onChange={(e) => setSelectedAccountId(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Select Account</option>
                {accounts?.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <input
                type="number"
                placeholder="Amount"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <input
                type="text"
                placeholder="Category (e.g. Food, Transport)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <select
                value={form.transactionType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    transactionType: e.target.value as "INCOME" | "EXPENSE",
                  })
                }
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !selectedAccountId}
                className="flex-1 bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-slate-700 disabled:bg-slate-300"
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
