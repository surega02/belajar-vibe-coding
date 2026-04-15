# Belajar Vibe Coding - Bun Elysia Drizzle

Aplikasi backend sederhana yang dibangun menggunakan Bun, Elysia.js, dan Drizzle ORM untuk manajemen pengguna (registrasi, login, profil, dan logout).

## Technology Stack & Library

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Elysia.js](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL (via `mysql2`)
- **Language**: TypeScript

### Library Utama:
- `elysia`: Framework web berperforma tinggi.
- `drizzle-orm`: ORM TypeScript yang ringan dan cepat.
- `mysql2`: Driver untuk koneksi ke database MySQL.

## Arsitektur & Struktur File

Proyek ini menggunakan pola pemisahan tanggung jawab (Separation of Concerns) yang sederhana namun efektif:

```text
src/
├── db/             # Konfigurasi database dan definisi schema
│   ├── index.ts    # Inisialisasi koneksi Drizzle
│   └── schema.ts   # Definisi tabel (Users, Sessions)
├── routes/         # Layer routing (Elysia instances)
│   └── users.route.ts  # Semua endpoint terkait pengguna
├── services/       # Layer logika bisnis
│   └── users.service.ts # Manajemen data dan proses autentikasi
└── index.ts        # Entry point aplikasi
```

### Konvensi Penamaan:
- Menggunakan penamaan **plural** untuk entitas (contoh: `users.route.ts`, `users.service.ts`).
- Pemisahan antara layer **Route** (HTTP/Interface) dan **Service** (Logika/Data).

## Schema Database

### 1. Tabel `users`
Menyimpan informasi dasar pengguna.
- `id`: Primary Key (Serial)
- `name`: Nama lengkap pengguna
- `email`: Alamat email unik
- `password`: Password (terenkripsi)
- `created_at`: Waktu pembuatan
- `updated_at`: Waktu pembaruan terakhir

### 2. Tabel `sessions`
Menyimpan token sesi aktif untuk autentikasi.
- `id`: Primary Key (Serial)
- `token`: UUID string sebagai session token
- `user_id`: Foreign Key ke tabel `users`
- `created_at`: Waktu sesi dibuat

## API Documentation

Semua API memiliki prefix `/api`.

| Method | Endpoint | Deskripsi | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/users/` | Registrasi user baru | No |
| POST | `/api/users/login` | Login dan mendapatkan session token | No |
| GET | `/api/users/current` | Mendapatkan informasi user saat ini | **Yes** (Bearer) |
| DELETE | `/api/users/logout` | Menghapus sesi (Logout) | **Yes** (Bearer) |

## Cara Setup Project

1. **Clone & Install**:
   ```bash
   bun install
   ```

2. **Konfigurasi Environment**:
   Salin file `.env.example` menjadi `.env` dan sesuaikan kredensial database Anda:
   ```text
   DB_HOST=localhost
   DB_USERNAME=root
   DB_PASSWORD=
   DB_NAME=db_belajar_vibe_coding
   DB_PORT=3306
   ```

3. **Database Migration**:
   Pastikan database sudah dibuat sesuai dengan `DB_NAME` di file `.env`. Gunakan Drizzle Kit untuk sinkronisasi schema (jika diperlukan).

## Cara Menjalankan Aplikasi

Jalankan aplikasi dengan perintah:
```bash
bun src/index.ts
```
Aplikasi akan berjalan secara default di `http://localhost:3000`.

## Cara Menjalankan Testing

Anda dapat menjalankan pengujian integrasi sederhana untuk memastikan semua route berfungsi dengan:
```bash
bun test_refactor.ts
```
*(Pastikan database sudah terkonfigurasi untuk testing)*.
