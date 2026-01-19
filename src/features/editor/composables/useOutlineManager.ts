// モード別の色を取得
function getModeColor(mode: string): string {
  const root = document.documentElement;
  const colorMap: Record<string, string> = {
    edit: '--zcode-color-edit',
    add: '--zcode-color-add',
    reorder: '--zcode-color-reorder',
    delete: '--zcode-color-delete'
  };
  const cssVar = colorMap[mode] || '--zcode-color-edit';
  return getComputedStyle(root).getPropertyValue(cssVar).trim() || '#3b82f6';
}

// アクティブ時のアウトラインを設定
export function setActiveOutline(element: HTMLElement, mode: string) {
  const color = getModeColor(mode);
  // アニメーション用のクラスを追加（CSSでアニメーションが適用される）
  element.classList.remove(
    'zcode-outline-active-edit',
    'zcode-outline-active-add',
    'zcode-outline-active-reorder',
    'zcode-outline-active-delete'
  );
  element.classList.add(`zcode-outline-active-${mode}`);
  
  // 初期値としてoutline-colorを設定（アニメーションでwidthとoffsetが変わる）
  element.style.outlineColor = color;
  element.style.outlineStyle = 'solid';
}

// アクティブ時のアウトラインを削除
export function removeActiveOutline(element: HTMLElement) {
  element.style.outline = '';
  element.style.outlineOffset = '';
  
  // アニメーション用のクラスを削除
  element.classList.remove(
    'zcode-outline-active-edit',
    'zcode-outline-active-add',
    'zcode-outline-active-reorder',
    'zcode-outline-active-delete'
  );
}

// ホバー時のアウトラインを設定
export function setHoverOutline(element: HTMLElement, mode: string) {
  const color = getModeColor(mode);
  element.style.outline = `2px dashed ${color}`;
  element.style.outlineOffset = '2px';
}

// ホバー時のアウトラインを削除
export function removeHoverOutline(element: HTMLElement) {
  element.style.outline = '';
  element.style.outlineOffset = '';
}
