import type { ComponentData, PartData, TypeData, ZeroCodeData } from '../../types';

// パスからコンポーネントを取得するヘルパー関数
export function getComponentByPath(path: string, cmsData: ZeroCodeData): ComponentData | null {
  const parts = path.split('.');
  let target: unknown = cmsData;

  for (const part of parts) {
    if (target === null || target === undefined || typeof target !== 'object') {
      return null;
    }
    if (/^\d+$/.test(part)) {
      target = (target as Record<string, unknown>)[parseInt(part)];
    } else {
      target = (target as Record<string, unknown>)[part];
    }
    if (target === undefined) return null;
  }

  return target as ComponentData;
}

// ID生成
export function generateId(): string {
  return `zcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// フィールドラベルの生成
export function humanize(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\s*([a-zA-Z])/, (c) => c.toUpperCase());
}

export function getFieldLabel(fieldName: string): string {
  return humanize(fieldName);
}

// 親パスを取得する関数
export function getParentPath(path: string): string | null {
  const parts = path.split('.');

  // トップレベルの要素（page.0など）の場合は親要素なし
  if (parts.length <= 2 && parts[0] === 'page') {
    return null;
  }

  // スロット内の要素の場合、最後の'slots'セグメントを見つける
  if (parts.includes('slots')) {
    let lastSlotIndex = -1;
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] === 'slots') {
        lastSlotIndex = i;
        break;
      }
    }

    if (lastSlotIndex !== -1 && lastSlotIndex < parts.length - 1) {
      // 最後のセグメントが数値の場合は、その前の'slots.xxx'までを削除
      const lastSegment = parts[parts.length - 1];
      if (!isNaN(parseInt(lastSegment))) {
        // 例: "page.0.slots.rows.1" → "page.0"
        // 例: "page.0.slots.rows.1.slots.cells.0" → "page.0.slots.rows.1"
        return parts.slice(0, lastSlotIndex).join('.');
      }
    }
  }

  // 通常の場合は最後のセグメントを削除
  const parentParts = parts.slice(0, -1);

  if (parentParts.length === 0) {
    return null;
  }

  return parentParts.join('.');
}

/**
 * パーツIDから対応するパーツテンプレートを取得
 * @param partId - パーツID
 * @param parts - パーツデータ（common/individual/special）
 * @returns 見つかったパーツ、またはnull
 */
export function findPartById(
  partId: string,
  parts: { common: TypeData[]; individual: TypeData[]; special: TypeData[] }
): PartData | null {
  // 検索順序（優先度の高い順）：common → individual → special
  const allTypes = [...parts.common, ...parts.individual, ...parts.special];
  for (const type of allTypes) {
    const part = type.parts.find((p) => p.id === partId);
    if (part) {
      return part;
    }
  }
  return null;
}
