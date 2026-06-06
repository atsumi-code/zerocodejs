/** テーブルセルクリック時など、並べ替えの実際の移動先パスに正規化する */
export function resolveReorderTargetPath(sourcePath: string, path: string): string {
  if (!sourcePath || !path) {
    return path;
  }

  const sourceParts = sourcePath.split('.');
  const targetParts = path.split('.');

  if (sourceParts.length === targetParts.length) {
    return path;
  }

  const sourceRowsIndex = sourceParts.indexOf('rows');
  if (sourceRowsIndex === -1) {
    return path;
  }

  const targetCellsIndex = targetParts.indexOf('cells');
  if (targetCellsIndex === -1) {
    return path;
  }

  let slotsIndex = -1;
  for (let i = targetCellsIndex - 1; i >= 0; i--) {
    if (targetParts[i] === 'slots') {
      slotsIndex = i;
      break;
    }
  }

  if (slotsIndex === -1) {
    return path;
  }

  return targetParts.slice(0, slotsIndex).join('.');
}

export function isValidReorderTarget(
  sourcePath: string,
  path: string,
  canReorderWith: (source: string, target: string) => boolean
): boolean {
  if (!sourcePath || !path || sourcePath === path) {
    return false;
  }
  const targetPath = resolveReorderTargetPath(sourcePath, path);
  return canReorderWith(sourcePath, targetPath);
}

function nextPathAncestor(
  element: HTMLElement,
  root: HTMLElement | null | undefined
): HTMLElement | null {
  let parent: HTMLElement | null = element.parentElement;
  while (parent) {
    if (parent.hasAttribute('data-zcode-path')) {
      if (root && !root.contains(parent)) {
        return null;
      }
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * クリック位置から、移動元に対して有効な移動先パスを祖先方向に探す。
 * 候補パーツ内の子コンポーネントをクリックした場合は、有効な親パーツを返す。
 */
export function resolveReorderClickPath(
  sourcePath: string,
  clickElement: HTMLElement,
  canReorderWith: (source: string, target: string) => boolean,
  root?: HTMLElement | null
): string | null {
  if (!sourcePath || !clickElement) {
    return null;
  }

  let current: HTMLElement | null = clickElement.closest('[data-zcode-path]');
  while (current) {
    if (root && !root.contains(current)) {
      break;
    }

    const path = current.getAttribute('data-zcode-path');
    if (path && isValidReorderTarget(sourcePath, path, canReorderWith)) {
      return resolveReorderTargetPath(sourcePath, path);
    }

    current = nextPathAncestor(current, root);
  }

  return null;
}
