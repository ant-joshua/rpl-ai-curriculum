// i18n — split: dictionaries in id.ts / en.ts, logic here
// Zero-change API: imports stay '$lib/stores/i18n'
import { browser } from '$app/environment';
import { idTranslations } from './id';
import { enTranslations } from './en';

export type Lang = 'id' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  id: idTranslations,
  en: enTranslations,
};

let currentLang = $state<Lang>('id');

if (browser) {
  const saved = localStorage.getItem('lms-lang');
  if (saved === 'id' || saved === 'en') {
    currentLang = saved;
  }
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(l: Lang) {
  currentLang = l;
  if (browser) localStorage.setItem('lms-lang', l);
}

export function toggleLang() {
  setLang(currentLang === 'id' ? 'en' : 'id');
}

export function t(key: string): string {
  const l = currentLang;
  return translations[l]?.[key] ?? key;
}
