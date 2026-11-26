# Valkrie Tools

Website katalog ValkrieX969. Dibuat dengan Next.js 14, TypeScript, dan Tailwind CSS.

## Peta folder

```text
app/                 Halaman dan gaya utama website
components/          Bagian tampilan, seperti header, menu, dan kartu
data/products.ts     Daftar produk dan kategori
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

## Simpan perubahan ke GitHub

Commit perubahan ke branch `main` di folder `Valkrie-Tools`. Jika project Vercel terhubung ke repo dan branch tersebut, Vercel akan membuat deployment baru setelah perubahan masuk.

## Perintah yang tersedia

- `pnpm dev` — jalankan preview lokal
- `pnpm tsc` — periksa tipe TypeScript
- `pnpm build` — buat build production
