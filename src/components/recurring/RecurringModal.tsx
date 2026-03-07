// money-tracker-fe/src/components/recurring/RecurringModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Account,
  RecurringTransaction,
  RecurringTransactionRequest,
} from "@/types";
import {
  createRecurringTransaction,
  updateRecurringTransaction,
} from "@/lib/recurringApi";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_EMOJI,
} from "@/lib/categories";

const FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Every Day" },
  { value: "WEEKLY", label: "Every Week" },
  { value: "MONTHLY", label: "Every Month" },
  { value: "YEARLY", label: "Every Year" },
];

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: RecurringTransaction | null;
  accounts: Account[];
}

interface FormErrors {
  accountId?: string;
  description?: string;
  amount?: string;
  frequency?: string;
  startDate?: string;
}

const defaultForm: RecurringTransactionRequest = {
  accountId: 0,
  description: "",
  amount: 0,
  transactionType: "EXPENSE",
  category: "",
  frequency: "MONTHLY",
  startDate: new Date().toISOString().split("T")[0],
};

export default function RecurringModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  accounts,
}: RecurringModalProps) {
  const isEdit = !!editData;

  const [form, setForm] = useState<RecurringTransactionRequest>(defaultForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        accountId: editData.accountId,
        description: editData.description,
        amount: editData.amount,
        transactionType: editData.transactionType,
        category: editData.category,
        frequency: editData.frequency,
        startDate: editData.nextRunDate,
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const categories =
    form.transactionType === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.accountId) newErrors.accountId = "Please select an account";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.amount || form.amount <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!form.frequency) newErrors.frequency = "Please select frequency";
    if (!form.startDate) newErrors.startDate = "Please select start date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange<K extends keyof RecurringTransactionRequest>(
    field: K,
    value: RecurringTransactionRequest[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (isEdit && editData) {
        await updateRecurringTransaction(editData.id, form);
        toast.success("Recurring transaction updated");
      } else {
        await createRecurringTransaction(form);
        toast.success("Recurring transaction added");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(
        isEdit
          ? "Failed to update recurring transaction"
          : "Failed to add recurring transaction",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 animate-fade-up max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Recurring" : "Add Recurring Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(["EXPENSE", "INCOME"] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleChange("transactionType", type)}
                className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                style={
                  form.transactionType === type
                    ? {
                        background: type === "INCOME" ? "#059669" : "#DC2626",
                        color: "white",
                      }
                    : { color: "#6B7280", background: "white" }
                }
              >
                {type === "INCOME" ? "💰 Income" : "💸 Expense"}
              </button>
            ))}
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Account
            </label>
            <select
              value={form.accountId || ""}
              onChange={(e) =>
                handleChange("accountId", Number(e.target.value))
              }
              className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-white transition-colors outline-none ${
                errors.accountId
                  ? "border-red-400"
                  : "border-gray-200 focus:border-blue-500"
              }`}
            >
              <option value="">Select account...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="mt-1 text-xs text-red-500">{errors.accountId}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Netflix subscription, Rent..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors outline-none ${
                errors.description
                  ? "border-red-400"
                  : "border-gray-200 focus:border-blue-500"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                Rp
              </span>
              <input
                type="number"
                min={1}
                placeholder="0"
                value={form.amount || ""}
                onChange={(e) =>
                  handleChange("amount", parseFloat(e.target.value) || 0)
                }
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm transition-colors outline-none ${
                  errors.amount
                    ? "border-red-400"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.amount ? (
              <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
            ) : form.amount > 0 ? (
              <p className="mt-1 text-xs text-gray-400">
                {formatCurrency(form.amount)}
              </p>
            ) : null}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 text-sm bg-white transition-colors outline-none"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_EMOJI[cat]} {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    handleChange(
                      "frequency",
                      opt.value as RecurringTransactionRequest["frequency"],
                    )
                  }
                  className="py-2 px-3 rounded-xl border text-sm font-medium transition-colors text-left"
                  style={
                    form.frequency === opt.value
                      ? {
                          background:
                            "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
                          color: "white",
                          borderColor: "transparent",
                        }
                      : { borderColor: "#E5E7EB", color: "#6B7280" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {errors.frequency && (
              <p className="mt-1 text-xs text-red-500">{errors.frequency}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-colors outline-none ${
                errors.startDate
                  ? "border-red-400"
                  : "border-gray-200 focus:border-blue-500"
              }`}
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #0B1A3E, #1D4ED8)",
              boxShadow: "0 4px 12px rgba(29, 78, 216, 0.3)",
            }}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
