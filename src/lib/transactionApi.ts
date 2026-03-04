import api from "@/lib/axios";
import { Transaction, TransactionRequest } from "@/types";

export async function getAllTransactions(): Promise<Transaction[]> {
  const res = await api.get("/api/transactions");
  return res.data;
}

export async function getTransactionsByAccount(
  accountId: number,
): Promise<Transaction[]> {
  const res = await api.get(`/api/accounts/${accountId}/transactions`);
  return res.data;
}

export async function createTransaction(
  accountId: number,
  data: TransactionRequest,
): Promise<Transaction> {
  const res = await api.post(`/api/accounts/${accountId}/transactions`, data);
  return res.data;
}

export async function updateTransaction(
  accountId: number,
  id: number,
  data: TransactionRequest,
): Promise<Transaction> {
  const res = await api.put(
    `/api/accounts/${accountId}/transactions/${id}`,
    data,
  );
  return res.data;
}

export async function deleteTransaction(
  accountId: number,
  id: number,
): Promise<void> {
  await api.delete(`/api/accounts/${accountId}/transactions/${id}`);
}
