// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { processTemplateWithDOM } from './template-processor';
import type { ComponentData } from '../../types';

function render(
  html: string,
  values: Record<string, unknown>,
  enableEditorAttributes: boolean,
  backendData?: Record<string, unknown>
): string {
  const component: ComponentData = { id: 'c1', part_id: 'p1', ...values };
  return processTemplateWithDOM(
    html,
    component,
    '0',
    () => null,
    () => '',
    enableEditorAttributes,
    [],
    [],
    [],
    backendData
  );
}

describe('リッチテキストの無害化', () => {
  const malicious = '<p>本文<img src=x onerror=alert(1)><script>alert(2)</script></p>';

  it.each([
    ['編集モード', true],
    ['公開モード', false]
  ])('%sでもイベントハンドラ・script を除去する', (_label, editorMode) => {
    const out = render('<div>{$body:x:rich}</div>', { body: malicious }, editorMode);
    expect(out).not.toMatch(/onerror|<script|<img/i);
    expect(out).toContain('本文');
  });

  it('編集モードでも Tiptap が出力する書式・リンクは保持する', () => {
    const tiptapHtml =
      '<p><strong>太字</strong><em>斜体</em><s>取消</s><br><a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">リンク</a></p><ul><li><p>項目</p></li></ul><ol><li><p>番号</p></li></ol>';
    const out = render('<div>{$body:x:rich}</div>', { body: tiptapHtml }, true);
    expect(out).toBe(`<div>${tiptapHtml}</div>`);
  });

  it('リンクの javascript: スキームを除去する', () => {
    const out = render(
      '<div>{$body:x:rich}</div>',
      { body: '<p><a href="javascript:alert(1)">x</a></p>' },
      true
    );
    expect(out).not.toMatch(/javascript:/i);
  });
});
