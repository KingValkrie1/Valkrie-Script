import Link from 'next/link';

const channelUrl = 'https://whatsapp.com/channel/0029VbAq9wH4inozYo8E9z2s';

export default function ContactPage() {
  return <main className="request-page vip-info-page">
    <header className="request-top">
      <Link href="/" className="request-brand">← VALKRIE TOOLS</Link>
      <Link href="/about">TENTANG</Link>
    </header>
    <section className="request-intro">
      <span className="request-kicker">BANTUAN DAN KONTAK</span>
      <h1>Butuh <em>bantuan?</em></h1>
      <p>Gunakan kanal resmi Valkrie untuk melihat update atau menghubungi admin. Sampaikan konteks dan link halaman jika melaporkan masalah.</p>
    </section>
    <section className="vip-info-grid" aria-label="Pilihan kontak">
      <article><span>01</span><h2>WhatsApp admin</h2><p>Untuk pertanyaan, laporan masalah, atau bantuan penggunaan katalog.</p><a className="request-submit-open" href={channelUrl} target="_blank" rel="noreferrer">Buka WhatsApp ↗</a></article>
      <article><span>02</span><h2>Saluran update</h2><p>Ikuti kanal resmi untuk info tools baru dan perubahan layanan.</p><a className="request-submit-open" href={channelUrl} target="_blank" rel="noreferrer">Lihat channel ↗</a></article>
      <article><span>03</span><h2>Ajukan tool</h2><p>Punya ide tool baru? Kirim melalui Request Board agar bisa ditinjau.</p><Link className="request-submit-open" href="/requests">Buka Request Board →</Link></article>
    </section>
    <section className="vip-info-note"><b>Catatan preview</b><p>Form chat internal dan pengiriman email belum tersedia di preview ini. Kontak dilakukan melalui WhatsApp sampai integrasi akun dan database diaktifkan.</p><Link href="/" className="profile-home-link">Kembali ke katalog →</Link></section>
  </main>;
}
