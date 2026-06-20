import { describe, expect, it } from 'vitest';
import {
  joinPageHtmlWithAddButtons,
  joinSiblingHtmlWithAddButtons,
  renderAddAfterButton,
  renderAddBeforeButton,
  resolveAddBetweenButtonTarget,
  syncAddBetweenButtonCurrentState
} from './page-add-buttons';

describe('page-add-buttons', () => {
  const labels = { before: '前に追加', after: '後に追加' };

  it('renderAddBeforeButton は path と aria-label を含む', () => {
    const html = renderAddBeforeButton('page.0', '前に追加');
    expect(html).toContain('data-zcode-add-before');
    expect(html).toContain('data-zcode-path="page.0"');
    expect(html).toContain('aria-label="前に追加"');
    expect(html).toContain('class="zcode-add-slot-btn zcode-add-between-btn"');
  });

  it('renderAddAfterButton は path と aria-label を含む', () => {
    const html = renderAddAfterButton('page.0', '後に追加');
    expect(html).toContain('data-zcode-add-after');
    expect(html).toContain('data-zcode-path="page.0"');
    expect(html).toContain('aria-label="後に追加"');
    expect(html).toContain('class="zcode-add-slot-btn zcode-add-between-btn"');
  });

  it('enableEditorAttributes が false のときボタンを注入しない', () => {
    const result = joinPageHtmlWithAddButtons(['<div>a</div>', '<div>b</div>'], false, labels);
    expect(result).toBe('<div>a</div><div>b</div>');
  });

  it('page 直下では先頭の前に追加と各パーツ直後の後に追加を注入する', () => {
    const result = joinPageHtmlWithAddButtons(
      ['<div data-zcode-path="page.0">a</div>', '<div data-zcode-path="page.1">b</div>'],
      true,
      labels
    );
    expect(result.indexOf('data-zcode-add-before')).toBeLessThan(result.indexOf('page.0'));
    expect(result.match(/data-zcode-add-before/g)?.length).toBe(1);
    expect(result.match(/data-zcode-add-after/g)?.length).toBe(2);
    expect(result).toContain('data-zcode-path="page.0"');
    expect(result).toContain('data-zcode-path="page.1"');
  });

  it('スロット内の兄弟にも同様に注入する', () => {
    const result = joinSiblingHtmlWithAddButtons(
      ['<div>child0</div>', '<div>child1</div>'],
      (index) => `page.0.slots.main.${index}`,
      true,
      labels
    );
    expect(result.match(/data-zcode-add-before/g)?.length).toBe(1);
    expect(result.match(/data-zcode-add-after/g)?.length).toBe(2);
    expect(result).toContain('data-zcode-path="page.0.slots.main.0"');
  });

  it('resolveAddBetweenButtonTarget は page 先頭の前に追加を before ボタンに対応づける', () => {
    expect(resolveAddBetweenButtonTarget('page.0', true)).toEqual({
      attribute: 'data-zcode-add-before',
      path: 'page.0'
    });
  });

  it('resolveAddBetweenButtonTarget は page 途中の前に追加を直前の after ボタンに対応づける', () => {
    expect(resolveAddBetweenButtonTarget('page.1', true)).toEqual({
      attribute: 'data-zcode-add-after',
      path: 'page.0'
    });
  });

  it('syncAddBetweenButtonCurrentState は選択中の追加ボタンに is-current を付ける', () => {
    const preview = document.createElement('div');
    preview.innerHTML = `
      ${renderAddBeforeButton('page.0', '前に追加')}
      ${renderAddAfterButton('page.0', '後に追加')}
      ${renderAddAfterButton('page.1', '後に追加')}
    `;

    syncAddBetweenButtonCurrentState(preview, 'page.0', true);
    expect(preview.querySelector('[data-zcode-add-before]')?.classList.contains('is-current')).toBe(
      true
    );
    expect(
      preview
        .querySelector('[data-zcode-add-after][data-zcode-path="page.0"]')
        ?.classList.contains('is-current')
    ).toBe(false);

    syncAddBetweenButtonCurrentState(preview, 'page.0', false);
    expect(preview.querySelector('[data-zcode-add-before]')?.classList.contains('is-current')).toBe(
      false
    );
    expect(
      preview
        .querySelector('[data-zcode-add-after][data-zcode-path="page.0"]')
        ?.classList.contains('is-current')
    ).toBe(true);

    syncAddBetweenButtonCurrentState(preview, null, false);
    expect(preview.querySelectorAll('.is-current').length).toBe(0);
  });

  it('syncAddBetweenButtonCurrentState は page.1 の前に追加を page.0 直後の after に付ける', () => {
    const preview = document.createElement('div');
    preview.innerHTML = `
      ${renderAddBeforeButton('page.0', '前に追加')}
      ${renderAddAfterButton('page.0', '後に追加')}
      ${renderAddAfterButton('page.1', '後に追加')}
    `;

    syncAddBetweenButtonCurrentState(preview, 'page.1', true);
    expect(preview.querySelector('[data-zcode-add-before]')?.classList.contains('is-current')).toBe(
      false
    );
    expect(
      preview
        .querySelector('[data-zcode-add-after][data-zcode-path="page.0"]')
        ?.classList.contains('is-current')
    ).toBe(true);
  });
});
