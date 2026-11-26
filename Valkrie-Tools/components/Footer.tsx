import Link from 'next/link';
import { Github, Instagram } from 'lucide-react';

export function Footer() {
  return <footer className="site-footer"><div className="footer-inner">
    <Link className="footer-brand" href="/">VALKRIE<span>-TOOLS</span></Link>
    <p>Valkrie-Tools · Developer Dika</p>
    <div className="social-links"><a href="https://github.com/" aria-label="GitHub"><Github size={17} /></a><a href="https://instagram.com/" aria-label="Instagram"><Instagram size={17} /></a></div>
  </div></footer>;
}
