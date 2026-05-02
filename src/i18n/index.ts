import { en, TranslationDict } from './en';
import { tr } from './tr';
import { Lang } from '../types';

let currentLang: Lang = 'en';

export function setLang(lang: Lang): void {
  currentLang = lang;
}

export function getLang(): Lang {
  return currentLang;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') return acc[key];
    return undefined;
  }, obj);
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict: TranslationDict = currentLang === 'tr' ? (tr as unknown as TranslationDict) : en;
  let value = getNestedValue(dict, key);

  // Fallback to English if not found in Turkish
  if (value === undefined && currentLang !== 'en') {
    value = getNestedValue(en, key);
  }

  if (value === undefined) return key;
  if (typeof value !== 'string') return key;

  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
  }

  return value;
}

// Shorthand for arrays
export function ta(key: string): string[] {
  const dict: TranslationDict = currentLang === 'tr' ? (tr as unknown as TranslationDict) : en;
  let value = getNestedValue(dict, key);
  if (!Array.isArray(value) && currentLang !== 'en') {
    value = getNestedValue(en, key);
  }
  if (!Array.isArray(value)) return [];
  return value as string[];
}
