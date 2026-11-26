'use client';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

export function ThemeSwitch() {
  const [neon, setNeon] = useState(false);
  useEffect(() => {
    const enabled = localStorage.getItem('valkrie-display-mode') === 'neon';
    setNeon(enabled);
    document.documentElement.classList.toggle('theme-neon', enabled);
  }, []);
  function change(enabled: boolean) {
    setNeon(enabled);
    localStorage.setItem('valkrie-display-mode', enabled ? 'neon' : 'standard');
    document.documentElement.classList.toggle('theme-neon', enabled);
  }
  return <label className="theme-option"><span><strong>Display Mode</strong><small>{neon ? 'Neon' : 'Standard'}</small></span><Switch checked={neon} onCheckedChange={change} aria-label="Toggle Display Mode (Standard/Neon)" /></label>;
}
