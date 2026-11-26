import { ArrowDown, Sparkles } from 'lucide-react';
import { totalTools } from '@/data/tools';

export function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
    <div className="hero-copy">
      <span className="eyebrow"><Sparkles size={14} /> TOOLBOX DIGITAL SERBAGUNA</span>
      <h1 id="hero-title">Semua yang kamu butuhkan.<br /><span>Dalam satu tempat.</span></h1>
      <p>Jelajahi koleksi tools untuk kreasi, produktivitas, visual, dan banyak hal lainnya.</p>
      <a className="hero-button" href="#tools">Lihat semua tools <ArrowDown size={16} /></a>
      <div className="hero-count"><strong>{totalTools}</strong><span>tools siap dijelajahi</span></div>
    </div>
    <div className="hero-art" aria-hidden="true"><div className="hero-ring ring-one" /><div className="hero-ring ring-two" /><div className="hero-core"><Sparkles size={42} /></div><span className="orbit-chip chip-one">CREATE</span><span className="orbit-chip chip-two">EXPLORE</span><span className="orbit-chip chip-three">TOOLS</span></div>
  </section>;
}
