# Valkrie Tools

Website katalog ValkrieX969. Dibuat dengan Next.js 14, TypeScript, dan Tailwind CSS.

## Peta folder

```text
app/                 Halaman dan gaya utama website
components/          Bagian tampilan, seperti header, menu, dan kartu
data/products.ts     Daftar produk dan kategori
lib/supabase/        Koneksi Supabase untuk browser, server, dan server admin
supabase/migrations/  Skema database dan aturan akses
public/              Gambar atau aset statis (jika ditambahkan)
```

## Mengubah isi website

- **Tambah atau ubah produk:** edit `data/products.ts`. Ikuti bentuk objek produk yang sudah ada. `id` harus unik; `category` harus sama dengan salah satu kategori yang tersedia.
- **Ubah kategori:** edit daftar `categories` di `data/products.ts`.
- **Ubah teks, layanan cepat, profil, navigasi, dan interaksi:** edit `components/Storefront.tsx`.
- **Ubah tampilan dan warna:** edit `app/globals.css`.
- **Ubah judul tab dan deskripsi website:** edit `app/layout.tsx`.
- **Halaman tambahan:** letakkan di dalam folder `app/`, misalnya `app/tentang/page.tsx` untuk alamat `/tentang`.

## Preview di komputer

Jalankan perintah dari folder `Valkrie-Tools`:

```bash
pnpm install
pnpm dev
```

Lalu buka `http://localhost:3000`. Simpan file untuk melihat perubahan; hentikan server dengan `Ctrl+C`.

## Menyiapkan database dan akun

Project ini memakai Supabase untuk Auth dan PostgreSQL. Sebelum fitur akun aktif:

1. Buat project Supabase milikmu, lalu buka **SQL Editor**.
2. Jalankan file `supabase/migrations/20261126000100_platform_foundation.sql`.
3. Salin `.env.example` menjadi `.env.local`, lalu isi URL project dan anon key dari pengaturan Supabase.
4. Tambahkan service role key hanya ke `.env.local` lokal dan Environment Variables Vercel. Key ini server-only; jangan taruh di kode browser atau kirim ke chat.
5. Di pengaturan Auth, atur alamat situs dan URL redirect untuk lokal (`http://localhost:3000/auth/callback`) serta domain Vercel.
6. Buat akun pemilik dahulu. Untuk menjadikannya admin, jalankan query SQL di bawah dari Supabase SQL Editor dan ganti email contoh dengan email akunmu:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('email-pemilik@example.com');
```

Jangan masukkan nilai key asli ke repo. Email konfirmasi dan reset memakai pengaturan email di project Supabase.

## Simpan perubahan ke GitHub

Commit perubahan ke branch `main` di folder `Valkrie-Tools`. Jika project Vercel terhubung ke repo dan branch tersebut, Vercel akan membuat deployment baru setelah perubahan masuk. Set variabel `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, dan server-only `SUPABASE_SERVICE_ROLE_KEY` di Vercel.

## Perintah yang tersedia

- `pnpm dev` — jalankan preview lokal
- `pnpm tsc` — periksa tipe TypeScript
- `pnpm build` — buat build production
