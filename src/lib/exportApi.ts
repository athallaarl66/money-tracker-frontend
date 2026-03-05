// src/lib/exportApi.ts
// Utility untuk trigger download CSV dari BE

import { toast } from "@/hooks/use-toast";

/**
 * Download transaksi sebagai CSV.
 * Kalau year & month di-pass, export bulan itu aja.
 * Kalau kosong, export semua transaksi.
 */
export async function exportTransactionsCsv(year?: number, month?: number) {
  // Ambil token dari localStorage — sama pola kayak axios interceptor
  const raw = localStorage.getItem("auth-storage");
  const token: string | null = raw ? JSON.parse(raw)?.state?.token : null;

  if (!token) {
    toast.error("Not authenticated", "Please log in again.");
    return;
  }

  // Build URL dengan query params kalau ada
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (month) params.set("month", String(month));

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/export${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    // Ambil nama file dari header Content-Disposition kalau ada
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="(.+?)"/);
    const filename = match?.[1] ?? "transactions.csv";

    // Buat blob → buat link sementara → trigger download → cleanup
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup setelah download — jangan tinggalin object URL nganggur
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    toast.success("Export successful", `Saved as ${filename}`);
  } catch (err) {
    console.error("Export failed:", err);
    toast.error("Export failed", "Please try again.");
  }
}
