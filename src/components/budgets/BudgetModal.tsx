"use client";

import { useEffect, useState } from "react";
import { Budget, BudgetRequest } from "@/types";
import { createBudget, updateBudget } from "@/lib/budgetApi";
import { toast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Budget | null;
  selectedMonth: string;
}

interface FormErrors {
  category?: string;
  limitAmount?: string;
}

export default function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  editData,
  selectedMonth,
}: BudgetModalProps) {
  const isEdit = !!editData;

  const [form, setForm] = useState<BudgetRequest>({
    category: "",
    limitAmount: 0,
    budgetMonth: selectedMonth,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        category: editData.category,
        limitAmount: editData.limitAmount,
        budgetMonth: editData.budgetMonth,
      });
    } else {
      setForm({ category: "", limitAmount: 0, budgetMonth: selectedMonth });
    }
    setErrors({});
  }, [editData, selectedMonth, isOpen]);

  if (!isOpen) return null;

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.limitAmount || form.limitAmount < 1000)
      newErrors.limitAmount = "Minimum limit is Rp 1,000";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(field: keyof BudgetRequest, value: string | number) {
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
        await updateBudget(editData.id, form);
        toast.success("Budget updated");
      } else {
        await createBudget(form);
        toast.success("Budget added");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      const message = raw.includes("sudah ada")
        ? "Budget for this category already exists this month"
        : isEdit
          ? "Failed to update budget"
          : "Failed to add budget";
      toast.error(message);
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
        className="w-full max-w-md rounded-2xl bg-white p-6 animate-fade-up"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Budget" : "Add Budget"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-white transition-colors outline-none ${
                errors.category
                  ? "border-red-400 focus:border-red-400"
                  : "border-gray-200 focus:border-blue-500"
              }`}
            >
              <option value="">Select category...</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Budget Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
                Rp
              </span>
              <input
                type="number"
                min={1000}
                step={1000}
                placeholder="0"
                value={form.limitAmount || ""}
                onChange={(e) =>
                  handleChange("limitAmount", parseFloat(e.target.value) || 0)
                }
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm transition-colors outline-none ${
                  errors.limitAmount
                    ? "border-red-400 focus:border-red-400"
                    : "border-gray-200 focus:border-blue-500"
                }`}
              />
            </div>
            {errors.limitAmount ? (
              <p className="mt-1 text-xs text-red-500">{errors.limitAmount}</p>
            ) : form.limitAmount > 0 ? (
              <p className="mt-1 text-xs text-gray-400">
                {formatCurrency(form.limitAmount)}
              </p>
            ) : null}
          </div>

          <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500">Month</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">
              {new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
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
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Add Budget"}
          </button>
        </div>
      </div>
    </div>
  );
}
