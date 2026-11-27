# Status pengerjaan Valkrie Tools

Fitur dikerjakan bertahap sesuai waktu yang tersedia. Kode tahap awal ada di branch `feature/platform-foundation`; preview Vercel dipakai untuk melihat perubahan tanpa mengubah website utama.

## Sudah disiapkan di workspace

- Kerangka Supabase Auth dan SSR cookie session.
- Halaman daftar, login email/username, lupa/reset password, callback verifikasi, logout semua perangkat, dan profil baca.
- Edit nama tampilan dan bio; kota request hanya bisa disimpan oleh VIP aktif.
- Migration PostgreSQL untuk User ID otomatis `VALK-000001`, profil, tier biasa/VIP, katalog tools, request, vote unik, komentar, bookmark, kuota request mingguan, dan log dasar.
- Upload avatar profil dan lampiran request sudah memiliki alur kode serta migration/storage path; bucket dan policy tetap perlu diterapkan di project Supabase pemilik.
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
- Profil pribadi menampilkan riwayat 20 request terakhir beserta status balasan admin.
- Katalog `/tools` membaca tools terbit dari tabel database saat Supabase tersedia, dengan katalog contoh yang diberi label saat konfigurasi belum tersedia.
- Detail tool dapat dibuka dari slug katalog; admin mendapat CRUD katalog di `/admin/tools` dengan validasi URL HTTPS, kategori, status terbit, dan penanda akses VIP.
- Favorit tool database tersimpan per akun, bisa dikelola dari katalog/detail, dan ditampilkan di `/favorites` setelah login.
- Halaman `/account/preferences` menyimpan pilihan notifikasi, tema, dan bahasa pada akun.
- `.env.example` dan petunjuk setup awal di README.

## Belum dikerjakan atau belum tersambung

- Belum ada project Supabase milik pengguna, jadi database, login, role admin, upload, dan pengiriman email belum dapat dicoba dengan data nyata.
- Migration belum dijalankan atau diverifikasi terhadap project nyata.
- Katalog database dan CRUD admin masih menunggu konfigurasi Supabase serta migration di project pemilik.
- Fitur database, login, role admin, upload, favorit akun, dan preferensi belum dapat dicoba dengan data nyata sampai project Supabase dibuat dan seluruh migration dijalankan.
- Preferensi tema/bahasa sudah tersimpan, tetapi belum diterapkan lintas halaman atau diterjemahkan ke bahasa Inggris.
- Pilihan notifikasi tersimpan, tetapi email belum dihubungkan ke provider atau trigger aktif.

## Langkah kecil berikutnya

1. Buat project Supabase dan masukkan konfigurasi sendiri lewat environment variables.
2. Hubungkan notifikasi email setelah provider email tersedia.
3. Terapkan tema/bahasa preferensi ke seluruh halaman.
4. Lanjutkan polish dan audit akses setelah database dapat diuji.
