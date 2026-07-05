import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from './sanitize';

describe('sanitizeUrl', () => {
  it('通常のURLはそのまま返す', () => {
    expect(sanitizeUrl('https://example.com/page')).toBe('https://example.com/page');
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
  });

  it('危険なスキームは空文字を返す', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('JavaScript:alert(1)')).toBe('');
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
  });

  it('制御文字によるスキーム偽装を拒否する', () => {
    expect(sanitizeUrl('java\tscript:alert(1)')).toBe('');
    expect(sanitizeUrl('java\nscript:alert(1)')).toBe('');
    expect(sanitizeUrl('java\rscript:alert(1)')).toBe('');
    expect(sanitizeUrl('da\tta:text/html;base64,PHNjcmlwdD4=', 'embed')).toBe('');
  });

  it('URL中の制御文字は除去して返す', () => {
    expect(sanitizeUrl('https://example.com/pa\tth')).toBe('https://example.com/path');
  });

  it('空文字・不正な入力は空文字を返す', () => {
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null as unknown as string)).toBe('');
    expect(sanitizeUrl(undefined as unknown as string)).toBe('');
  });

  describe('data URL', () => {
    const pngDataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const svgDataUrl = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=';

    it('ラスター画像の data URL はどのコンテキストでも許可する', () => {
      expect(sanitizeUrl(pngDataUrl)).toBe(pngDataUrl);
      expect(sanitizeUrl(pngDataUrl, 'navigation')).toBe(pngDataUrl);
      expect(sanitizeUrl(pngDataUrl, 'embed')).toBe(pngDataUrl);
      expect(sanitizeUrl('data:image/jpeg;base64,AAAA', 'embed')).toBe(
        'data:image/jpeg;base64,AAAA'
      );
      expect(sanitizeUrl('data:image/webp;base64,AAAA')).toBe('data:image/webp;base64,AAAA');
    });

    it('SVG の data URL は embed（img src 等）でのみ許可する', () => {
      expect(sanitizeUrl(svgDataUrl, 'embed')).toBe(svgDataUrl);
      expect(sanitizeUrl(svgDataUrl, 'navigation')).toBe('');
      expect(sanitizeUrl(svgDataUrl)).toBe('');
    });

    it('画像以外の data URL はどのコンテキストでも拒否する', () => {
      expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe('');
      expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD4=', 'embed')).toBe('');
      expect(sanitizeUrl('data:application/javascript,alert(1)', 'embed')).toBe('');
    });

    it('MIMEタイプの偽装（区切り文字なし）は拒否する', () => {
      expect(sanitizeUrl('data:image/pngx;base64,AAAA', 'embed')).toBe('');
      expect(sanitizeUrl('data:image/svg+xmlfoo;base64,AAAA', 'embed')).toBe('');
    });
  });
});
