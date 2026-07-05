import DOMPurify from 'dompurify';

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 's', 'u', 'ul', 'ol', 'li', 'a', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
}

/**
 * HTML属性値をエスケープする
 */
export function escapeAttributeValue(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const RASTER_IMAGE_DATA_URL_REGEX = /^data:image\/(png|jpe?g|gif|webp|avif|bmp|x-icon)[;,]/;
const SVG_IMAGE_DATA_URL_REGEX = /^data:image\/svg\+xml[;,]/;

export type UrlContext = 'navigation' | 'embed';

/**
 * URLを検証・サニタイズする
 * @param url - 検証するURL
 * @param context - URLの使われ方。
 *   'embed'（img の src 等の埋め込み先）では SVG の data URL を許可する
 *   （img 経由ではスクリプトが実行されないため）。
 *   'navigation'（href / action 等の遷移先）では SVG の data URL は
 *   スクリプトを内包できるため拒否する。省略時は安全側の 'navigation'。
 */
export function sanitizeUrl(url: string, context: UrlContext = 'navigation'): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // ブラウザは URL 中のタブ・改行等の制御文字を除去してから解釈するため
  // （例: java\tscript: は javascript: として実行される）、判定前に同様に除去する
  // eslint-disable-next-line no-control-regex -- 制御文字の除去自体が目的
  const cleaned = url.trim().replace(/[\u0000-\u001f\u007f]/g, '');
  const lower = cleaned.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '';
  }

  if (lower.startsWith('data:')) {
    if (RASTER_IMAGE_DATA_URL_REGEX.test(lower)) {
      return cleaned;
    }
    if (context === 'embed' && SVG_IMAGE_DATA_URL_REGEX.test(lower)) {
      return cleaned;
    }
    return '';
  }

  return cleaned;
}

/**
 * パーツテンプレート用のサニタイズ。
 * ZeroCode のテンプレート記法（{$...}, {@...}, ($...), z-* 属性）を保持しつつ、
 * 危険なタグ・属性を除去する。
 */
export function sanitizePartTemplate(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['img', 'picture', 'source', 'video', 'audio', 'svg', 'path', 'use'],
    ADD_ATTR: [
      'z-if',
      'z-tag',
      'z-empty',
      'z-for',
      'z-slot',
      'class',
      'id',
      'style',
      'src',
      'href',
      'alt',
      'title',
      'width',
      'height',
      'target',
      'rel',
      'role',
      'aria-level',
      'aria-label',
      'aria-hidden',
      'loading',
      'decoding',
      'fetchpriority',
      'data-*'
    ],
    FORBID_TAGS: [
      'script',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'button',
      'textarea',
      'select'
    ],
    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'ondblclick',
      'onmousedown',
      'onmouseup',
      'onmouseover',
      'onmouseout',
      'onmousemove',
      'onmouseenter',
      'onmouseleave',
      'onfocus',
      'onblur',
      'onkeydown',
      'onkeyup',
      'onkeypress',
      'onsubmit',
      'onreset',
      'onchange',
      'oninput',
      'oncontextmenu',
      'ontouchstart',
      'ontouchmove',
      'ontouchend',
      'onpointerdown',
      'onpointerup',
      'ontoggle',
      'onscroll',
      'onwheel',
      'onresize',
      'onanimationstart',
      'onanimationend',
      'ontransitionend'
    ],
    ALLOW_DATA_ATTR: true,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  });
}
