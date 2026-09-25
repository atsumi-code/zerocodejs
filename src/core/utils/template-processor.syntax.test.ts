// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { processTemplateWithDOM } from './template-processor';
import { initializeAllComponentFields } from './component-initializer';
import type { ComponentData, ZeroCodeData } from '../../types';

function render(html: string, values: Record<string, unknown>): string {
  const component: ComponentData = { id: 'c1', part_id: 'p1', ...values };
  return processTemplateWithDOM(
    html,
    component,
    '0',
    () => null,
    () => '',
    false
  );
}

describe('デフォルト値を省略した記法の描画', () => {
  it('{$name} は値に置き換わり、値が無ければ空になる（記法の文字をそのまま出さない）', () => {
    expect(render('<h2>{$title}</h2>', { title: 'こんにちは' })).toBe('<h2>こんにちは</h2>');
    expect(render('<h2>{$title}</h2>', {})).toBe('<h2></h2>');
  });

  it('属性がオプショナルフィールド {$name?} だけで値が無ければ属性ごと削除する', () => {
    expect(render('<img src="a.png" alt="{$alt?}">', {})).toBe('<img src="a.png">');
    expect(render('<img src="a.png" alt="{$alt?}">', { alt: '説明' })).toBe(
      '<img src="a.png" alt="説明">'
    );
  });

  it('{$name:rich} はリッチテキストとして描画する', () => {
    expect(render('<div>{$body:rich}</div>', { body: '<p><strong>太字</strong></p>' })).toBe(
      '<div><p><strong>太字</strong></p></div>'
    );
  });
});

describe('デフォルト値に . を含むフィールドの初期化', () => {
  it('読み込み時にデフォルト値で初期化され、描画に反映される', () => {
    const body = '<a href="{$link:mailto:info@example.com}">{$label:お問い合わせ}</a>';
    const data: ZeroCodeData = {
      page: [{ id: 'c1', part_id: 'p1' }],
      css: {},
      parts: {
        common: [
          {
            id: 't1',
            type: 't',
            description: '',
            parts: [{ id: 'p1', title: '', description: '', body }]
          }
        ],
        individual: [],
        special: []
      },
      images: { common: [], individual: [], special: [] }
    };
    initializeAllComponentFields(data);
    expect(data.page[0].link).toBe('mailto:info@example.com');
    expect(
      processTemplateWithDOM(
        body,
        data.page[0],
        '0',
        () => null,
        () => '',
        false
      )
    ).toBe('<a href="mailto:info@example.com">お問い合わせ</a>');
  });
});
