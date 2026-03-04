"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TransactionRequest } from "@/types";
import { getAccounts } from "@/lib/accountApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransactionRequest) => void;
  isSaving: boolean;
  // Kalau edit, diisi data existing. Kalau tambah baru, null.
  initial?: TransactionRequest | null;
}

const CATEGORIES = [
  "Food & Drink",
  "Transport",
  "Shopping",
  "Health",
  "Entertainment",
  "Education",
  "Bills",
  "Salary",
  "Investment",
  "Other",
];

const emptyForm: TransactionRequest = {
  accountId: 0,
  description: "",
  amount: 0,
  transactionType: "EXPENSE",
  category: "Other",
  transactionDate: new Date().toISOString().slice(0, 10),
};

export default function TransactionModal({
  open,
  onClose,
  onSave,
  isSaving,
  initial,
}: Props) {
  const [form, setForm] = useState<TransactionRequest>(emptyForm);

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  useEffect(() => {
    setForm(initial ?? { ...emptyForm, accountId: accounts?.[0]?.id ?? 0 });
  }, [initial, accounts, open]);

  const isValid =
    form.accountId > 0 && form.amount > 0 && form.description.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-slate-900">
            {initial ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Tipe: Income / Expense — toggle button */}
          <div className="grid grid-cols-2 gap-2">
            {(["INCOME", "EXPENSE"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, transactionType: type })}
                className="py-2 rounded-xl text-sm font-bold border transition-all"
                style={
                  form.transactionType === type
                    ? {
                        background:
                          type === "INCOME"
                            ? "linear-gradient(135deg, #D1FAE5, #6EE7B7)"
                            : "linear-gradient(135deg, #FEE2E2, #FECACA)",
                        borderColor: type === "INCOME" ? "#059669" : "#DC2626",
                        color: type === "INCOME" ? "#065F46" : "#991B1B",
                      }
                    : { borderColor: "#E2E8F0", color: "#94A3B8" }
                }
              >
                {type === "INCOME" ? "💰 Income" : "💸 Expense"}
              </button>
            ))}
          </div>

          {/* Account */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Account
            </Label>
            <select
              value={form.accountId}
              onChange={(e) =>
                setForm({ ...form, accountId: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value={0} disabled>
                Select account
              </option>
              {accounts?.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Description
            </Label>
            <Input
              placeholder="e.g. Makan siang, Gaji bulanan"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Amount (Rp)
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={form.amount || ""}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Category
            </Label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Date
            </Label>
            <Input
              type="date"
              value={form.transactionDate}
              onChange={(e) =>
                setForm({ ...form, transactionDate: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 text-white font-bold"
            onClick={() => onSave(form)}
            disabled={isSaving || !isValid}
            style={{ background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)" }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
