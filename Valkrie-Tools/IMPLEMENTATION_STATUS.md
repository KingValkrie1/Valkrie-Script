# Status pengerjaan Valkrie Tools

Fitur akan dikerjakan bertahap sesuai waktu yang tersedia. Kode tahap awal ada di branch lokal `feature/platform-foundation` dan belum dipush atau dideploy.

## Sudah disiapkan di workspace

- Kerangka Supabase Auth dan SSR cookie session.
- Halaman daftar, login email/username, lupa/reset password, callback verifikasi, logout semua perangkat, dan profil baca.
- Edit nama tampilan dan bio; kota request hanya bisa disimpan oleh VIP aktif.
- Migration PostgreSQL untuk User ID otomatis `VALK-000001`, profil, tier biasa/VIP, katalog tools, request, vote unik, komentar, bookmark, kuota request mingguan, dan log dasar.
- RLS awal: kolom admin/VIP terlindungi; email tidak tersedia di profil publik; kota hanya ditampilkan untuk VIP aktif.
- `.env.example` dan petunjuk setup awal di README.

## Belum dikerjakan atau belum tersambung

- Belum ada project Supabase milik pengguna, jadi database, email, login, dan role admin belum dapat dicoba.
- Migration belum dijalankan atau diverifikasi terhadap project nyata.
- Belum ada upload avatar, halaman katalog dari database, request board, komentar/vote UI, panel admin, kelola VIP via User ID, export CSV, notifikasi, dan fitur lainnya.
- Belum ada preview deployment untuk branch ini.

## Langkah kecil berikutnya

1. Rapikan dan verifikasi migration/Auth foundation.
2. Buat project Supabase dan masukkan konfigurasi sendiri lewat environment variables.
3. Tambahkan avatar upload dan selesaikan alur profil.
4. Bangun papan request publik beserta form dan vote.
5. Lanjutkan admin, export, notifikasi, dan polish.
