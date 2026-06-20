import { describe, expect, it } from 'vitest';
import {
  isPreviewPartOrSlotClick,
  isPreviewPartOrSlotClickInEvent,
  isSelectionClearExcludedInComposedPath,
  shouldClearSelectionOnClick
} from './useClickHandlers';

describe('isPreviewPartOrSlotClick', () => {
  it('パーツ要素上は true', () => {
    const root = document.createElement('div');
    const part = document.createElement('div');
    part.setAttribute('data-zcode-path', 'page.0');
    const inner = document.createElement('span');
    part.appendChild(inner);
    root.appendChild(part);

    expect(isPreviewPartOrSlotClick(inner, root)).toBe(true);
  });

  it('スロット要素上は true', () => {
    const root = document.createElement('div');
    const slot = document.createElement('div');
    slot.setAttribute('data-zcode-slot-path', 'page.0.slots.main');
    root.appendChild(slot);

    expect(isPreviewPartOrSlotClick(slot, root)).toBe(true);
  });

  it('プレビュー内の余白は false', () => {
    const root = document.createElement('div');
    const gap = document.createElement('div');
    root.appendChild(gap);

    expect(isPreviewPartOrSlotClick(gap, root)).toBe(false);
  });

  it('空スロット追加ボタン上は true', () => {
    const root = document.createElement('div');
    const button = document.createElement('button');
    button.setAttribute('data-zcode-add-slot', '');
    root.appendChild(button);

    expect(isPreviewPartOrSlotClick(button, root)).toBe(true);
  });

  it('パーツ間追加ボタン上は true', () => {
    const root = document.createElement('div');
    const button = document.createElement('button');
    button.setAttribute('data-zcode-add-after', '');
    button.setAttribute('data-zcode-path', 'page.0');
    root.appendChild(button);

    expect(isPreviewPartOrSlotClick(button, root)).toBe(true);
  });

  it('前に追加ボタン上は true', () => {
    const root = document.createElement('div');
    const button = document.createElement('button');
    button.setAttribute('data-zcode-add-before', '');
    button.setAttribute('data-zcode-path', 'page.0');
    root.appendChild(button);

    expect(isPreviewPartOrSlotClick(button, root)).toBe(true);
  });
});

describe('shouldClearSelectionOnClick', () => {
  it('ZeroCode 外クリックは true', () => {
    const preview = document.createElement('div');
    const outside = document.createElement('button');
    document.body.appendChild(preview);
    document.body.appendChild(outside);

    const event = new MouseEvent('click', { bubbles: true, composed: true });
    Object.defineProperty(event, 'composedPath', {
      value: () => [outside, document.body, document]
    });

    expect(shouldClearSelectionOnClick(event, preview, true)).toBe(true);

    preview.remove();
    outside.remove();
  });

  it('プレビュー内パーツクリックは false', () => {
    const preview = document.createElement('div');
    const part = document.createElement('div');
    part.setAttribute('data-zcode-path', 'page.0');
    preview.appendChild(part);
    document.body.appendChild(preview);

    const event = new MouseEvent('click', { bubbles: true, composed: true });
    Object.defineProperty(event, 'composedPath', {
      value: () => [part, preview, document.body, document]
    });

    expect(isPreviewPartOrSlotClickInEvent(event, preview)).toBe(true);
    expect(shouldClearSelectionOnClick(event, preview, true)).toBe(false);

    preview.remove();
  });

  it('ツールバークリックは false', () => {
    const preview = document.createElement('div');
    const toolbar = document.createElement('div');
    toolbar.className = 'zcode-toolbar';
    const button = document.createElement('button');
    toolbar.appendChild(button);
    document.body.appendChild(preview);
    document.body.appendChild(toolbar);

    const event = new MouseEvent('click', { bubbles: true, composed: true });
    Object.defineProperty(event, 'composedPath', {
      value: () => [button, toolbar, document.body, document]
    });

    expect(isSelectionClearExcludedInComposedPath(event)).toBe(true);
    expect(shouldClearSelectionOnClick(event, preview, true)).toBe(false);

    preview.remove();
    toolbar.remove();
  });

  it('除外 UI 内で開始したジェスチャーの click は false', () => {
    const preview = document.createElement('div');
    const outside = document.createElement('div');
    document.body.appendChild(preview);
    document.body.appendChild(outside);

    const event = new MouseEvent('click', { bubbles: true, composed: true });
    Object.defineProperty(event, 'composedPath', {
      value: () => [outside, document.body, document]
    });

    expect(
      shouldClearSelectionOnClick(event, preview, true, { gestureStartedInExcludedUi: true })
    ).toBe(false);

    preview.remove();
    outside.remove();
  });
});
