import api from "@/lib/axios";
import { Budget, BudgetRequest } from "@/types";

// Ambil semua budget user di bulan tertentu
// month format: "YYYY-MM", default ke bulan ini di BE kalau kosong
export async function getBudgets(month: string): Promise<Budget[]> {
  const res = await api.get("/budgets", { params: { month } });
  return res.data;
}

export async function createBudget(data: BudgetRequest): Promise<Budget> {
  const res = await api.post("/budgets", data);
  return res.data;
}

export async function updateBudget(
  id: number,
  data: BudgetRequest,
): Promise<Budget> {
  const res = await api.put(`/budgets/${id}`, data);
  return res.data;
}

export async function deleteBudget(id: number): Promise<void> {
  await api.delete(`/budgets/${id}`);
}
