// src/lib/categories.ts

export const EXPENSE_CATEGORIES = [
  "Food & Drink",
  "Transport",
  "Shopping",
  "Health",
  "Entertainment",
  "Education",
  "Bills",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Other",
] as const;

export const CATEGORY_EMOJI: Record<string, string> = {
  "Food & Drink": "🍜",
  Transport: "🚗",
  Shopping: "🛍️",
  Health: "💊",
  Entertainment: "🎮",
  Education: "📚",
  Bills: "📄",
  Salary: "💼",
  Freelance: "💻",
  Investment: "📈",
  Other: "📦",
};
