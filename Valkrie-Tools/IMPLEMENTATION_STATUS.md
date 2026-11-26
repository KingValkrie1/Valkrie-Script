# Status pengerjaan Valkrie Tools

Fitur dikerjakan bertahap sesuai waktu yang tersedia. Kode tahap awal ada di branch `feature/platform-foundation`; preview Vercel dipakai untuk melihat perubahan tanpa mengubah website utama.

## Sudah disiapkan di workspace

- Kerangka Supabase Auth dan SSR cookie session.
- Halaman daftar, login email/username, lupa/reset password, callback verifikasi, logout semua perangkat, dan profil baca.
- Edit nama tampilan dan bio; kota request hanya bisa disimpan oleh VIP aktif.
- Migration PostgreSQL untuk User ID otomatis `VALK-000001`, profil, tier biasa/VIP, katalog tools, request, vote unik, komentar, bookmark, kuota request mingguan, dan log dasar.
- RLS awal: kolom admin/VIP terlindungi; email tidak tersedia di profil publik; kota hanya ditampilkan untuk VIP aktif.
- Panel request admin awal: ubah status, balas publik, alasan penolakan, pin, dan sembunyikan request.
- Kelola VIP via User ID: preview akun, grant/perpanjang/cabut, durasi, catatan, dan audit history.
- Export CSV admin: filter status/bulan, pilih kolom, hitung vote, dan riwayat export.
- Aksi massal panel admin untuk memilih beberapa request lalu mengubah statusnya, dengan pencatatan audit per request.
- Halaman profil publik `/u/[username]` menampilkan ID, badge, detail aman untuk publik, dan daftar request publik milik pengguna.
- Bookmark request tersedia dari halaman detail, tersimpan per akun, dan punya halaman `/requests/saved`.
- Panel admin punya buku user dengan pencarian, badge tier, dan tautan langsung untuk mengatur VIP melalui User ID.
- Kartu beranda kini mengarah ke situs resmi beberapa tools legal dan pencarian/kategori disesuaikan dengan katalog produktivitas, desain, dan developer.
- Halaman publik `/vip` menjelaskan manfaat, aturan yang tetap setara, dan cara status VIP dikelola admin.
- `.env.example` dan petunjuk setup awal di README.

## Belum dikerjakan atau belum tersambung

- Belum ada project Supabase milik pengguna, jadi database, email, login, dan role admin belum dapat dicoba.
- Migration belum dijalankan atau diverifikasi terhadap project nyata.
- Belum ada upload avatar, halaman katalog dari database, notifikasi email, dan fitur lainnya.
- Project Supabase belum dibuat, jadi alur database masih berupa fondasi kode dan belum bisa digunakan langsung.

## Langkah kecil berikutnya

1. Buat project Supabase dan masukkan konfigurasi sendiri lewat environment variables.
2. Tambahkan avatar upload dan selesaikan alur profil.
3. Selesaikan katalog tools dan halaman detail.
4. Lanjutkan notifikasi email, bulk action, favorit, preferensi, dan polish.
