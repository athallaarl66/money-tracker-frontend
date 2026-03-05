// components/accounts/AccountModal.tsx

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

const ACCOUNT_TYPES = [
  { value: "BANK", label: "Bank", icon: "🏦" },
  { value: "CASH", label: "Cash", icon: "💵" },
  { value: "E-WALLET", label: "E-Wallet", icon: "📱" },
] as const;

const emptyForm: AccountRequest = {
  name: "",
  type: "BANK",
  initialBalance: 0,
};

export default function AccountModal({
  account,
  open,
  onClose,
  onSave,
  isSaving,
}: Props) {
  const [form, setForm] = useState<AccountRequest>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AccountRequest, string>>
  >({});
  const isEditMode = account !== null;

  // Reset form setiap modal dibuka
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
    setErrors({});
  }, [account, open]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof AccountRequest, string>> = {};

    if (!form.name.trim()) {
      next.name = "Account name is required";
    } else if (form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters";
    }

    if (!isEditMode && form.initialBalance < 0) {
      next.initialBalance = "Initial balance cannot be negative";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      ...form,
      name: form.name.trim(),
      initialBalance: Math.max(0, form.initialBalance),
    });
  };

  const fieldClass = (hasError: boolean) =>
    hasError ? "border-red-300 focus-visible:ring-red-400" : "";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-extrabold text-slate-900">
            {isEditMode ? "Edit Account" : "Add Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Account Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Account Name
            </Label>
            <Input
              placeholder="e.g. BCA, Cash, GoPay"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              maxLength={50}
              className={fieldClass(!!errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Type — pakai button toggle biar konsisten sama TransactionModal */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Type
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map(({ value, label, icon }) => {
                const isSelected = form.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, type: value })}
                    className="py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1"
                    style={
                      isSelected
                        ? {
                            background:
                              value === "BANK"
                                ? "linear-gradient(135deg, #DBEAFE, #93C5FD)"
                                : value === "CASH"
                                  ? "linear-gradient(135deg, #D1FAE5, #6EE7B7)"
                                  : "linear-gradient(135deg, #EDE9FE, #C4B5FD)",
                            borderColor:
                              value === "BANK"
                                ? "#3B82F6"
                                : value === "CASH"
                                  ? "#059669"
                                  : "#7C3AED",
                            color:
                              value === "BANK"
                                ? "#1D4ED8"
                                : value === "CASH"
                                  ? "#065F46"
                                  : "#5B21B6",
                          }
                        : { borderColor: "#E2E8F0", color: "#94A3B8" }
                    }
                  >
                    <span className="text-base">{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Balance — disabled saat edit, ga bisa diubah */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Initial Balance (Rp)
            </Label>
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={form.initialBalance || ""}
              onChange={(e) => {
                setForm({ ...form, initialBalance: Number(e.target.value) });
                setErrors((prev) => ({ ...prev, initialBalance: undefined }));
              }}
              disabled={isEditMode}
              className={fieldClass(!!errors.initialBalance)}
            />
            {errors.initialBalance && (
              <p className="text-xs text-red-500">{errors.initialBalance}</p>
            )}
            {isEditMode && (
              <p className="text-xs text-slate-400">
                Initial balance cannot be changed after creation.
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
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{ background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)" }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
