'use client';

import { useEffect } from 'react';
import type { AccountPreferences } from '@/components/account/PreferencesForm';

type DisplayPreferences = Pick<AccountPreferences, 'theme' | 'language'>;
const storageKey = 'valkrie-account-display-preferences';

function apply(preferences: DisplayPreferences) {
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.lang = preferences.language;
  localStorage.setItem('valkrie-theme', preferences.theme);
  document.querySelector('.storefront')?.classList.toggle('store-light', preferences.theme === 'light');
  window.dispatchEvent(new CustomEvent('valkrie-theme-applied', { detail: preferences.theme }));
}

export function PreferenceApplier() {
  useEffect(() => {
    let saved: DisplayPreferences = { theme: 'dark', language: 'id' };
    try {
      const value = localStorage.getItem(storageKey);
      if (value) saved = { ...saved, ...JSON.parse(value) };
      else if (localStorage.getItem('valkrie-theme') === 'light') saved.theme = 'light';
    } catch { /* Keep the dark Indonesian default. */ }
    apply(saved);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      fetch('/api/account/preferences').then(async (response) => {
        if (!response.ok) return;
        const { preferences } = await response.json();
        const current = { theme: preferences.theme, language: preferences.language } as DisplayPreferences;
        localStorage.setItem(storageKey, JSON.stringify(current));
        apply(current);
      }).catch(() => undefined);
    }

    const update = (event: Event) => {
      const detail = (event as CustomEvent<DisplayPreferences>).detail;
      if (!detail) return;
      localStorage.setItem(storageKey, JSON.stringify(detail));
      apply(detail);
    };
    window.addEventListener('valkrie-preferences-changed', update);
    return () => window.removeEventListener('valkrie-preferences-changed', update);
  }, []);

  return null;
}
