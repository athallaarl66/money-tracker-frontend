// money-tracker/src/lib/recurringApi.ts

import api from "@/lib/axios";
import { RecurringTransaction, RecurringTransactionRequest } from "@/types";

export async function getRecurringTransactions(): Promise<
  RecurringTransaction[]
> {
  const res = await api.get("/api/recurring");
  return res.data;
}

export async function createRecurringTransaction(
  data: RecurringTransactionRequest,
): Promise<RecurringTransaction> {
  const res = await api.post("/api/recurring", data);
  return res.data;
}

export async function updateRecurringTransaction(
  id: number,
  data: RecurringTransactionRequest,
): Promise<RecurringTransaction> {
  const res = await api.put(`/api/recurring/${id}`, data);
  return res.data;
}

// Pause / resume tanpa hapus
export async function toggleRecurringTransaction(
  id: number,
): Promise<RecurringTransaction> {
  const res = await api.patch(`/api/recurring/${id}/toggle`);
  return res.data;
}

export async function deleteRecurringTransaction(id: number): Promise<void> {
  await api.delete(`/api/recurring/${id}`);
}
