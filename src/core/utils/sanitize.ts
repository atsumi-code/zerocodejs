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

/**
 * URLを検証・サニタイズする
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return '';
  }

  if (lower.startsWith('data:')) {
    if (lower.startsWith('data:image/')) {
      return trimmed;
    }
    return '';
  }

  return trimmed;
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
      'z-if', 'z-tag', 'z-empty', 'z-for', 'z-slot',
      'class', 'id', 'style', 'src', 'href', 'alt', 'title', 'width', 'height',
      'target', 'rel', 'role', 'aria-level', 'aria-label', 'aria-hidden',
      'loading', 'decoding', 'fetchpriority',
      'data-*'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select'],
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'ondblclick', 'onmousedown', 'onmouseup',
      'onmouseover', 'onmouseout', 'onmousemove', 'onmouseenter', 'onmouseleave',
      'onfocus', 'onblur', 'onkeydown', 'onkeyup', 'onkeypress',
      'onsubmit', 'onreset', 'onchange', 'oninput', 'oncontextmenu',
      'ontouchstart', 'ontouchmove', 'ontouchend', 'onpointerdown', 'onpointerup',
      'ontoggle', 'onscroll', 'onwheel', 'onresize',
      'onanimationstart', 'onanimationend', 'ontransitionend'
    ],
    ALLOW_DATA_ATTR: true,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  });
}
