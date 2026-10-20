import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, isLocale } from './index';
import strings from '../ui-strings.json';

describe('i18n', () => {
  it('knows the supported locales', () => {
    expect(DEFAULT_LOCALE).toBe('fr');
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
  });

  it('has a French and English text for every UI key', () => {
    for (const [key, row] of Object.entries(strings as Record<string, { fr: string; en: string }>)) {
      expect(row.fr, `${key} (fr)`).toBeTruthy();
      expect(row.en, `${key} (en)`).toBeTruthy();
    }
  });
});