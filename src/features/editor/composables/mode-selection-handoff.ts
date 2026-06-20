import type { ZeroCodeData } from '../../../types';
import { getComponentByPath, getParentPath } from '../../../core/utils/path-utils';
import type { EditorMode } from './useEditorMode';

export function getSelectedPathForMode(
  mode: EditorMode,
  paths: {
    edit: string;
    add: string | null;
    reorder: string;
    delete: string;
  }
): string | null {
  switch (mode) {
    case 'edit':
      return paths.edit || null;
    case 'add':
      return paths.add;
    case 'reorder':
      return paths.reorder || null;
    case 'delete':
      return paths.delete || null;
    default:
      return null;
  }
}

function isComponentWithPartId(value: unknown): value is { part_id: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'part_id' in value &&
    typeof (value as { part_id: unknown }).part_id === 'string' &&
    (value as { part_id: string }).part_id.length > 0
  );
}

export function resolveComponentPathForMode(path: string, cmsData: ZeroCodeData): string | null {
  let candidate: string | null = path;

  while (candidate) {
    const data = getComponentByPath(candidate, cmsData);
    if (isComponentWithPartId(data)) {
      return candidate;
    }

    const parent = getParentPath(candidate);
    if (!parent) {
      return null;
    }
    candidate = parent;
  }

  return null;
}

export function canHandoffPathToAddMode(path: string, cmsData: ZeroCodeData): boolean {
  if (/^page\.\d+$/.test(path)) {
    return true;
  }

  if (resolveComponentPathForMode(path, cmsData)) {
    return true;
  }

  if (path.includes('.slots.')) {
    return getParentPath(path) !== null;
  }

  return false;
}
