// money-tracker-fe/src/types/index.ts
// ===== AUTH =====
export interface AuthResponse {
  token: string;
  email: string;
  name: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ===== ACCOUNT =====
export interface Account {
  id: number;
  name: string;
  type: string;
  initialBalance: number;
  balance: number;
  createdAt: string;
}

export interface AccountRequest {
  name: string;
  type: string;
  initialBalance: number;
}

// ===== TRANSACTION =====
export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  description: string;
  amount: number;
  transactionType: "INCOME" | "EXPENSE";
  category: string;
  transactionDate: string;
  createdAt: string;
}

export interface TransactionRequest {
  accountId: number;
  description: string;
  amount: number;
  transactionType: "INCOME" | "EXPENSE";
  category: string;
  transactionDate?: string;
}

// ===== ANALYTICS =====
export interface SummaryResponse {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  period: string;
}

export interface CategorySummaryResponse {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyTrendResponse {
  month: string;
  income: number;
  expense: number;
  netBalance: number;
}

export interface AccountBalanceResponse {
  accountId: number;
  accountName: string;
  accountType: string;
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
}
