// money-tracker-fe/src/components/accounts/AccountModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Account, AccountRequest } from "@/types";
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
  account: Account | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: AccountRequest) => void;
  isSaving: boolean;
}

const emptyForm: AccountRequest = { name: "", type: "BANK", initialBalance: 0 };

export default function AccountModal({
  account,
  open,
  onClose,
  onSave,
  isSaving,
}: Props) {
  const [form, setForm] = useState<AccountRequest>(emptyForm);
  const isEditMode = account !== null;

  // Isi form dengan data existing kalau mode edit, reset kalau mode tambah
  useEffect(() => {
    setForm(
      account
        ? {
            name: account.name,
            type: account.type,
            initialBalance: account.initialBalance,
          }
        : emptyForm,
    );
  }, [account]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-slate-900">
            {isEditMode ? "Edit Account" : "Add Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Account Name
            </Label>
            <Input
              placeholder="e.g. BCA, Cash, GoPay"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Type
            </Label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="BANK">🏦 Bank</option>
              <option value="CASH">💵 Cash</option>
              <option value="E-WALLET">📱 E-Wallet</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Initial Balance
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={form.initialBalance || ""}
              onChange={(e) =>
                setForm({ ...form, initialBalance: Number(e.target.value) })
              }
              disabled={isEditMode}
            />
            {isEditMode && (
              <p className="text-xs text-slate-400">
                Cannot be changed after creation.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 text-white font-bold"
            onClick={() => onSave(form)}
            disabled={isSaving || !form.name.trim()}
            style={{ background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)" }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
