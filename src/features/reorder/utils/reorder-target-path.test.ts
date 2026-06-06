import { describe, expect, it } from 'vitest';
import {
  isValidReorderTarget,
  resolveReorderClickPath,
  resolveReorderTargetPath
} from './reorder-target-path';

function siblingCanReorder(sourcePath: string, targetPath: string): boolean {
  if (!sourcePath || !targetPath || sourcePath === targetPath) {
    return false;
  }
  const sourceParts = sourcePath.split('.');
  const targetParts = targetPath.split('.');
  return (
    sourceParts.length === targetParts.length &&
    sourceParts.slice(0, -1).join('.') === targetParts.slice(0, -1).join('.')
  );
}

describe('resolveReorderTargetPath', () => {
  it('rows ソースで cells クリック時は行パスに正規化する', () => {
    const source = 'page.0.slots.body.0.slots.rows.0';
    const cell = 'page.0.slots.body.0.slots.rows.1.slots.cells.0.slots.main.0';
    expect(resolveReorderTargetPath(source, cell)).toBe('page.0.slots.body.0.slots.rows.1');
  });
});

describe('resolveReorderClickPath', () => {
  it('候補パーツ内の子 path 要素から親の移動先を返す', () => {
    const root = document.createElement('div');
    const parent = document.createElement('div');
    parent.setAttribute('data-zcode-path', 'page.1');
    const child = document.createElement('div');
    child.setAttribute('data-zcode-path', 'page.1.slots.main.0');
    const inner = document.createElement('span');
    child.appendChild(inner);
    parent.appendChild(child);
    root.appendChild(parent);

    expect(resolveReorderClickPath('page.0', inner, siblingCanReorder, root)).toBe('page.1');
  });

  it('有効な兄弟パーツを直接クリックした場合はその path を返す', () => {
    const root = document.createElement('div');
    const sibling = document.createElement('div');
    sibling.setAttribute('data-zcode-path', 'page.0.slots.main.1');
    const inner = document.createElement('span');
    sibling.appendChild(inner);
    root.appendChild(sibling);

    expect(resolveReorderClickPath('page.0.slots.main.0', inner, siblingCanReorder, root)).toBe(
      'page.0.slots.main.1'
    );
  });

  it('有効な移動先がなければ null', () => {
    const root = document.createElement('div');
    const invalid = document.createElement('div');
    invalid.setAttribute('data-zcode-path', 'page.0.slots.main.0');
    root.appendChild(invalid);

    expect(resolveReorderClickPath('page.1', invalid, siblingCanReorder, root)).toBeNull();
  });

  it('移動元自身は返さない', () => {
    const root = document.createElement('div');
    const source = document.createElement('div');
    source.setAttribute('data-zcode-path', 'page.0');
    root.appendChild(source);

    expect(resolveReorderClickPath('page.0', source, siblingCanReorder, root)).toBeNull();
  });
});

describe('isValidReorderTarget', () => {
  it('cells クリックを rows ソースの兄弟として判定する', () => {
    const source = 'page.0.slots.body.0.slots.rows.0';
    const cell = 'page.0.slots.body.0.slots.rows.1.slots.cells.0.slots.main.0';
    expect(isValidReorderTarget(source, cell, siblingCanReorder)).toBe(true);
  });
});
