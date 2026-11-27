import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return <>
    <Header />
    <main className="about-page">
      <span className="eyebrow">PRIVASI</span>
      <h1>Kebijakan Privasi</h1>
      <p>Halaman ini masih berupa rancangan untuk preview website. Pengaturan akun, tukar kode hadiah, dan penyimpanan data belum terhubung ke database.</p>
      <section className="about-copy">
        <h2>Data yang kami gunakan</h2>
        <p>Saat fitur akun diaktifkan, data hanya digunakan untuk login, profil, request tools, favorit, dan pengaturan yang kamu pilih.</p>
        <h2>Kontrol kamu</h2>
        <p>Kamu dapat mengubah informasi profil, preferensi, atau menghapus akun melalui halaman akun setelah koneksi database tersedia.</p>
      </section>
      <Link href="/">← Kembali ke semua tools</Link>
    </main>
    <Footer />
  </>;
}
