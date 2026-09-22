import { idTranslations } from './i18n/id';
import { enTranslations } from './i18n/en';

export type Lang = 'id' | 'en';

const translations: Record<Lang, Record<string, string>> = {
  id: idTranslations,
  en: enTranslations,
};

let currentLang: Lang = 'id';

export function initLang(saved: string | null): void {
  if (saved === 'id' || saved === 'en') {
    currentLang = saved;
  }
}

if (typeof window !== 'undefined') {
  try {
    initLang(localStorage.getItem('lms-lang'));
  } catch {
    // localStorage not available
  }
}

export function getLang(): Lang {
  return currentLang;
}

export function setLang(l: Lang) {
  currentLang = l;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('lms-lang', l);
    } catch {
      // localStorage not available
    }
  }
}

export function toggleLang() {
  setLang(currentLang === 'id' ? 'en' : 'id');
}

export function t(key: string): string {
  if (!key) return '';
  const l = currentLang;
  // Try active language
  const val = translations[l]?.[key];
  if (val !== undefined && val !== '') return val;
  // Fallback to other language before returning raw key
  const fallbackLang: Lang = l === 'id' ? 'en' : 'id';
  const fallbackVal = translations[fallbackLang]?.[key];
  if (fallbackVal !== undefined && fallbackVal !== '') return fallbackVal;
  return key;
}

export { idTranslations, enTranslations };
