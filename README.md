# Money Tracker — Dokumentasi Proyek

Pengembang: Athalla Arli
Stack: Java 21 + Spring Boot 3 (Backend) · Next.js 14 + TypeScript (Frontend)
Repositori BE: github.com/athallaarl66/money-tracker-be
Repositori FE: github.com/athallaarl66/money-tracker-frontend

## Struktur Proyek

money-tracker/
├── money-tracker-be/ ← Backend (Spring Boot)
└── money-tracker-fe/ ← Frontend (Next.js)

Dua repositori terpisah mengikuti standar industri untuk proyek fullstack.

## Arsitektur Backend

Menggunakan pola Thin Controller, Fat Service — semua logika bisnis berada di Service, bukan Controller.

Request → Controller → Service → Repository → Database

Relasi antar entitas:
User → Account → Transaction

Setiap user memiliki banyak akun. Setiap akun memiliki banyak transaksi.

## API Endpoint

Semua endpoint kecuali `/api/auth/ ` memerlukan header:
Authorization: Bearer <token>

Autentikasi
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi akun baru |
| POST | `/api/auth/login` | Login, mendapatkan JWT token |

Akun
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/accounts` | Daftar semua akun |
| POST | `/api/accounts` | Buat akun baru |
| PUT | `/api/accounts/{id}` | Perbarui akun |
| DELETE | `/api/accounts/{id}` | Hapus akun |

Tipe akun: `CASH` · `BANK` · `E-WALLET`

Transaksi
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/transactions` | Semua transaksi lintas akun |
| POST | `/api/accounts/{accountId}/transactions` | Tambah transaksi |
| PUT | `/api/accounts/{accountId}/transactions/{id}` | Perbarui transaksi |
| DELETE | `/api/accounts/{accountId}/transactions/{id}` | Hapus transaksi |

Tipe transaksi: `INCOME` · `EXPENSE`

Analitik
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/analytics/summary` | Total pemasukan, pengeluaran, saldo bersih |
| GET | `/api/analytics/categories` | Rincian pengeluaran per kategori |
| GET | `/api/analytics/monthly-trend` | Tren bulanan (default 6 bulan) |
| GET | `/api/analytics/account-balances` | Saldo detail per akun |

## Menjalankan Proyek

Backend
bash
./mvnw spring-boot:run

Frontend
bash
npm run dev

## Environment Variables

Backend — `application-local.properties` (tidak di-commit)
DB_URL=jdbc:postgresql://localhost:5432/money_tracker
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000

Frontend — `.env.local` (tidak di-commit)
NEXT_PUBLIC_API_URL=http://localhost:8080

## Alur Autentikasi

1. User membuka aplikasi → sistem memeriksa status login via Zustand
2. Belum login → diarahkan ke /login
3. Login berhasil → token disimpan di localStorage (key: auth-storage)
4. Setiap request → Axios interceptor otomatis menyisipkan token
5. Token kedaluwarsa (401) → token dihapus → diarahkan ke /login

## Catatan Teknis Penting

Backend

- `BigDecimal` tidak mendukung operator `+`/`-` — gunakan `.add()` dan `.subtract()`
- `TransactionType` adalah enum — perbandingan menggunakan `==`, bukan `.equals("INCOME")`
- DTO dengan `@Builder` — instansiasi wajib menggunakan `.builder().build()`, bukan `new` + setter

Frontend

- Token tersimpan sebagai JSON di `auth-storage`, dibaca dengan `JSON.parse(...).state.token`
- Recharts `Tooltip formatter` harus mengembalikan tuple `[value, name]`, bukan string biasa
- `useCountUp` — custom hook untuk animasi angka menggunakan `requestAnimationFrame`

## Fitur yang Telah Selesai

| Fitur                                               | Status |
| --------------------------------------------------- | ------ |
| Autentikasi (register, login, logout)               | ✅     |
| Dashboard dengan animasi dan tampilan banking       | ✅     |
| Manajemen akun (CRUD)                               | ✅     |
| Saldo akun otomatis diperbarui dari transaksi       | ✅     |
| Halaman transaksi lintas akun dengan filter         | ✅     |
| Halaman analitik dengan grafik batang dan lingkaran | ✅     |
| Sidebar responsif dengan drawer mobile              | ✅     |

---
