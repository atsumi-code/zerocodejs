import { describe, it, expect } from 'vitest';
import { lintTemplateSyntax } from './template-lint';
import { extractFieldsFromTemplate } from './field-extractor';

describe('lintTemplateSyntax', () => {
  it('正しい記法には警告を出さない', () => {
    const template = `
      <h2>{$title:見出し:required}</h2>
      <div>{$body:本文:required:rich}</div>
      <img src="{$photo:img-1:image}" alt="{$alt?:説明}">
      <a href="{$url.link:https://example.com/path}">{$label.link:リンク}</a>
      <p class="($color:red|blue)">{@user.name}</p>`;
    expect(lintTemplateSyntax(template)).toEqual([]);
  });

  it('デフォルト値の無い {$name} は記法として認識されない', () => {
    expect(lintTemplateSyntax('<h2>{$title}</h2>')).toEqual([
      { code: 'unrecognized', raw: '{$title}' }
    ]);
  });

  it('グループなしのテキストでデフォルト値に「.」を含むと検出する', () => {
    expect(lintTemplateSyntax('<a href="{$url:https://example.com/path}">x</a>')).toEqual([
      { code: 'default-contains-dot', raw: '{$url:https://example.com/path}' }
    ]);
  });

  it('型の前のデフォルト値が空だと検出する', () => {
    expect(lintTemplateSyntax('<div>{$body::rich}</div>')).toEqual([
      { code: 'empty-default-before-type', raw: '{$body::rich}' }
    ]);
  });

  it('型の後ろの validation を検出する', () => {
    expect(lintTemplateSyntax('<div>{$body:本文:rich:required:max=10}</div>')).toEqual([
      {
        code: 'validation-after-type',
        raw: '{$body:本文:rich:required:max=10}',
        ignored: ['required', 'max=10']
      }
    ]);
  });

  it('警告したフィールドは実際に編集パネルに出ない／validation が無視される', () => {
    const fields = extractFieldsFromTemplate(
      '<div><h2>{$title}</h2><a href="{$url:https://example.com}">x</a>{$body::rich}{$note:メモ:textarea:required}</div>'
    );
    const names = fields.map((f) => f.fieldName);
    expect(names).not.toContain('title');
    expect(names).not.toContain('url');
    expect(names).not.toContain('body');
    expect(fields.find((f) => f.fieldName === 'note')?.required).toBeUndefined();
  });
});
