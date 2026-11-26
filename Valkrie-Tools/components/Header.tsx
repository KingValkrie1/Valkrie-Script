import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { MainMenu } from '@/components/MainMenu';

export function Header() {
  return <header className="site-header"><div className="header-inner">
    <div className="header-start"><MainMenu /><Link className="brand" href="/" aria-label="Valkrie-Tools, kembali ke beranda"><span className="brand-mark"><Sparkles size={19} aria-hidden="true" /></span><span>VALKRIE<span className="brand-accent">-TOOLS</span></span></Link></div>
    <span className="header-note">Satu tempat, banyak kemungkinan.</span>
    <a className="header-cta" href="#tools">Jelajahi tools <span aria-hidden="true">↘</span></a>
  </div></header>;
}
