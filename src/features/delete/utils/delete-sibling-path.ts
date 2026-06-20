import type { ComponentData, ZeroCodeData } from '../../../types';
import { getComponentByPath } from '../../../core/utils/path-utils';

export type SiblingContext = {
  siblings: ComponentData[];
  index: number;
  pathPrefix: string;
};

export function getSiblingContext(path: string, cmsData: ZeroCodeData): SiblingContext | null {
  const parts = path.split('.');
  if (parts[0] !== 'page') {
    return null;
  }

  if (parts.length === 2) {
    const index = parseInt(parts[1], 10);
    if (Number.isNaN(index) || index < 0 || index >= cmsData.page.length) {
      return null;
    }
    return { siblings: cmsData.page, index, pathPrefix: 'page' };
  }

  const lastPart = parts[parts.length - 1];
  const index = parseInt(lastPart, 10);
  if (Number.isNaN(index)) {
    return null;
  }

  const prefixParts = parts.slice(0, -1);
  let current: unknown = cmsData;
  for (const part of prefixParts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return null;
    }
    if (/^\d+$/.test(part)) {
      current = (current as Record<string, unknown>)[parseInt(part, 10)];
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }

  if (!Array.isArray(current) || index < 0 || index >= current.length) {
    return null;
  }

  return {
    siblings: current as ComponentData[],
    index,
    pathPrefix: prefixParts.join('.')
  };
}

export function buildSiblingPath(pathPrefix: string, index: number): string {
  return `${pathPrefix}.${index}`;
}

export function resolveNextSelectionPathAfterDelete(
  path: string,
  cmsData: ZeroCodeData
): string | null {
  const ctx = getSiblingContext(path, cmsData);
  if (!ctx) {
    return null;
  }

  const remainingCount = ctx.siblings.length - 1;
  if (remainingCount <= 0) {
    return null;
  }

  const nextIndex = ctx.index < remainingCount ? ctx.index : remainingCount - 1;
  return buildSiblingPath(ctx.pathPrefix, nextIndex);
}

export function resolveSlotFirstChildPath(
  parentPath: string,
  slotName: string,
  cmsData: ZeroCodeData
): string | null {
  const parent = getComponentByPath(parentPath, cmsData);
  const slot = parent?.slots?.[slotName];
  if (!Array.isArray(slot) || slot.length === 0) {
    return null;
  }
  return `${parentPath}.slots.${slotName}.0`;
}
