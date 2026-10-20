import { describe, expect, it } from 'vitest';
import { isUrl, money, telHref } from './format';

describe('format', () => {
  it('formats FCFA in French and XAF in English', () => {
    expect(money(500000, 'fr').replace(/\s/g, ' ')).toBe('500 000 FCFA');
    expect(money(500000, 'en')).toBe('500,000 XAF');
  });

  it('builds a tel: link from a formatted number', () => {
    expect(telHref('+237 695 292 287')).toBe('tel:+237695292287');
  });

  it('only accepts absolute http(s) URLs for social links', () => {
    expect(isUrl('https://facebook.com/isstas')).toBe(true);
    expect(isUrl('@isstascameroun')).toBe(false);
    expect(isUrl(null)).toBe(false);
  });
});