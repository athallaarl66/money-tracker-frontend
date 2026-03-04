// money-tracker-fe/src/lib/accountApi.ts

import api from "@/lib/axios";
import { Account, AccountRequest } from "@/types";

// GET /api/accounts → ambil semua account milik user
export async function getAccounts(): Promise<Account[]> {
  const response = await api.get("/api/accounts");
  return response.data;
}

// POST /api/accounts → buat account baru
export async function createAccount(data: AccountRequest): Promise<Account> {
  const response = await api.post("/api/accounts", data);
  return response.data;
}

// PUT /api/accounts/:id → update nama/tipe account
export async function updateAccount(
  id: number,
  data: AccountRequest,
): Promise<Account> {
  const response = await api.put(`/api/accounts/${id}`, data);
  return response.data;
}

// DELETE /api/accounts/:id → hapus account
export async function deleteAccount(id: number): Promise<void> {
  await api.delete(`/api/accounts/${id}`);
}
