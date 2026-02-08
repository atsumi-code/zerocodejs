import type { ComponentData } from '../../types';

const VALID_TAGS: string[] = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'div', 'p', 'span', 'li', 'ul', 'ol',
  'section', 'article', 'aside', 'nav', 'header', 'footer', 'main',
  'figure', 'figcaption', 'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
];

export function processZIf(content: DocumentFragment, component: ComponentData): void {
  content.querySelectorAll('[z-if]').forEach((el) => {
    const condition = el.getAttribute('z-if');
    if (condition) {
      const conditionValue = component[condition] !== undefined ? component[condition] : true;
      if (!conditionValue) {
        el.remove();
      } else {
        el.removeAttribute('z-if');
      }
    } else {
      el.removeAttribute('z-if');
    }
  });
}

export function processZTag(content: DocumentFragment, component: ComponentData, doc: Document): void {
  content.querySelectorAll('[z-tag]').forEach((el) => {
    const zTagValue = el.getAttribute('z-tag');
    if (zTagValue) {
      const tagMatch = zTagValue.match(/^\$(\w+)(?::(.+))?$/);
      if (tagMatch) {
        const fieldName = tagMatch[1];
        const tagValue = component[fieldName];
        const tagName = typeof tagValue === 'string' ? tagValue : el.tagName.toLowerCase();
        const normalizedTagName = typeof tagName === 'string' ? tagName.toLowerCase() : tagName;

        if (typeof normalizedTagName === 'string' && VALID_TAGS.includes(normalizedTagName)) {
          const newElement = doc.createElement(normalizedTagName);

          Array.from(el.attributes).forEach((attr) => {
            if (attr.name !== 'z-tag') {
              newElement.setAttribute(attr.name, attr.value);
            }
          });

          Array.from(el.childNodes).forEach((child) => {
            newElement.appendChild(child.cloneNode(true));
          });

          el.parentNode?.replaceChild(newElement, el);
        }
      }
    }
  });
}

function isEmptyForZEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return true;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      trimmed === '' ||
      trimmed === '<p></p>' ||
      trimmed === '<p> </p>' ||
      /^<p>\s*<\/p>$/i.test(trimmed) ||
      /^<p>\s*<br\s*\/?>\s*<\/p>$/i.test(trimmed)
    ) {
      return true;
    }
  }
  return false;
}

export function processZEmpty(content: DocumentFragment, component: ComponentData): void {
  content.querySelectorAll('[z-empty]').forEach((el) => {
    const condition = el.getAttribute('z-empty');
    if (condition) {
      const fieldNameMatch = condition.match(/^\$(\w+)$/);
      if (fieldNameMatch) {
        const fieldName = fieldNameMatch[1];
        const fieldValue = component[fieldName];

        if (isEmptyForZEmpty(fieldValue)) {
          el.remove();
        } else {
          el.removeAttribute('z-empty');
        }
      } else {
        el.removeAttribute('z-empty');
      }
    } else {
      el.removeAttribute('z-empty');
    }
  });
}
