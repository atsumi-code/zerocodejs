const ACTIVE_CLASS_PREFIX = 'zcode-outline-active-';
const HOVER_CLASS_PREFIX = 'zcode-outline-hover-';

function clearPrefixedClasses(element: HTMLElement, prefix: string) {
  const classesToRemove = Array.from(element.classList).filter((cls) => cls.startsWith(prefix));
  classesToRemove.forEach((cls) => element.classList.remove(cls));
}

// アクティブ時のアウトラインを設定
export function setActiveOutline(element: HTMLElement, mode: string) {
  clearPrefixedClasses(element, ACTIVE_CLASS_PREFIX);
  element.classList.add('zcode-outline-active');
  element.classList.add(`${ACTIVE_CLASS_PREFIX}${mode}`);
}

// アクティブ時のアウトラインを削除
export function removeActiveOutline(element: HTMLElement) {
  element.classList.remove('zcode-outline-active');
  clearPrefixedClasses(element, ACTIVE_CLASS_PREFIX);
}

// ホバー時のアウトラインを設定
export function setHoverOutline(element: HTMLElement, mode: string) {
  clearPrefixedClasses(element, HOVER_CLASS_PREFIX);
  element.classList.add('zcode-outline-hover');
  element.classList.add(`${HOVER_CLASS_PREFIX}${mode}`);
}

// ホバー時のアウトラインを削除
export function removeHoverOutline(element: HTMLElement) {
  element.classList.remove('zcode-outline-hover');
  clearPrefixedClasses(element, HOVER_CLASS_PREFIX);
}
