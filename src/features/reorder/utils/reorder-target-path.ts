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
