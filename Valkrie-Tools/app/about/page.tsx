import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
export default function AboutPage() {
  return <><Header /><main className="about-page"><span className="eyebrow">TENTANG PROJECT</span><h1>Valkrie-Tools</h1><p>Dikembangkan oleh Dika sebagai rumah untuk berbagai tools digital.</p><Link href="/">← Kembali ke semua tools</Link></main><Footer /></>;
}
