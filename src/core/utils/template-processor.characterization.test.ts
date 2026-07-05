import { describe, it, expect } from 'vitest';
import { processTemplateWithDOM } from './template-processor';
import { sampleTemplates } from '../../__tests__/fixtures/sample-templates';
import { sampleImageData, sampleBackendData } from '../../__tests__/fixtures/sample-data';
import type { ComponentData, PartData } from '../../types';

/**
 * キャラクタリゼーションテスト:
 * テンプレート処理系リファクタリングの前に「現在の出力」をスナップショットとして固定する。
 * スナップショットの差分ゼロ = 挙動維持の機械的証明として使う。
 * ここでのスナップショットは現行実装の観測結果であり、仕様の正しさを主張するものではない。
 */

const findPart = (_partId: string): PartData | null => null;
const renderComponentToHtml = (_component: ComponentData, _path: string) => '';

const filledComponent: ComponentData = {
  id: 'char-1',
  part_id: 'part-char',
  title: '実タイトル',
  subtitle: '実サブタイトル',
  content: '<p>実コンテンツ</p>',
  description: '行1\n行2',
  imageUrl: 'img-1',
  category: 'option2',
  tags: ['tag1', 'tag3'],
  showContent: true,
  showTitle: true,
  headingTag: 'h3'
};

const emptyComponent: ComponentData = {
  id: 'char-empty',
  part_id: 'part-char'
};

function render(
  template: string,
  opts: { editor?: boolean; component?: ComponentData } = {}
): string {
  return processTemplateWithDOM(
    template,
    opts.component ?? filledComponent,
    'page.0',
    findPart,
    renderComponentToHtml,
    opts.editor ?? false,
    sampleImageData,
    [],
    [],
    sampleBackendData
  );
}

describe('キャラクタリゼーション: sample-templates 全フィクスチャ', () => {
  const entries = Object.entries(sampleTemplates);

  for (const [key, template] of entries) {
    it(`公開モード（値あり）: ${key}`, () => {
      expect(render(template)).toMatchSnapshot();
    });

    it(`編集モード（値あり）: ${key}`, () => {
      expect(render(template, { editor: true })).toMatchSnapshot();
    });

    it(`公開モード（値未設定・デフォルト経路）: ${key}`, () => {
      expect(render(template, { component: emptyComponent })).toMatchSnapshot();
    });
  }
});

describe('キャラクタリゼーション: レンダリングの未カバー記法', () => {
  it('選択肢の label=値 記法（radio）', () => {
    const template = '<div>($status:下書き=draft|公開=published)</div>';
    expect(
      render(template, { component: { ...emptyComponent, status: 'published' } })
    ).toMatchSnapshot();
    expect(render(template, { component: emptyComponent })).toMatchSnapshot();
  });

  it('選択肢の label=値 記法（select 複数）', () => {
    const template = '<div>($labels@:ラベルA=a,ラベルB=b)</div>';
    expect(render(template, { component: { ...emptyComponent, labels: ['b'] } })).toMatchSnapshot();
  });

  it('グループ付きフィールドのレンダリング', () => {
    const template = '<div>{$title.header:ヘッダー既定}</div><span>{$note.header?:注記}</span>';
    expect(
      render(template, { component: { ...emptyComponent, title: 'グループ値' } })
    ).toMatchSnapshot();
  });

  it('デフォルト値に : を含むテキストフィールド', () => {
    const template = '<a href="{$url:https://example.com/path}">リンク</a>';
    const result = render(template, { component: emptyComponent });
    expect(result).toMatchSnapshot();
  });

  it('{$content::rich}（空デフォルト）の現行挙動', () => {
    const template = '<div>{$content::rich}</div>';
    expect(render(template, { component: emptyComponent })).toMatchSnapshot();
  });

  it('{@items.length} の現行挙動', () => {
    const template = '<div>{@items.length}</div>';
    expect(render(template)).toMatchSnapshot();
  });

  it('属性内のテキストフィールド（エスケープ経路）', () => {
    const template = '<div title="{$title:既定<>&quot;}">本文</div>';
    expect(
      render(template, { component: { ...emptyComponent, title: 'A<B>&"C' } })
    ).toMatchSnapshot();
  });

  it('属性内の画像フィールド（src / サニタイズ経路）', () => {
    const template = '<img src="{$imageUrl:img-2:image}" alt="{$title:代替}">';
    expect(render(template)).toMatchSnapshot();
    expect(render(template, { component: emptyComponent })).toMatchSnapshot();
  });

  it('optional のみの属性が空のとき属性ごと削除される', () => {
    const template = '<div data-note="{$note?:メモ}">本文</div>';
    expect(render(template, { component: emptyComponent })).toMatchSnapshot();
    expect(render(template, { component: { ...emptyComponent, note: 'あり' } })).toMatchSnapshot();
  });

  it('テキストと属性の混在（同一フィールドの二重展開）', () => {
    const template = '<a href="{$url?:https://fallback}" title="{$title:t}">{$title:t}</a>';
    expect(
      render(template, { component: { ...emptyComponent, title: '題', url: '/x' } })
    ).toMatchSnapshot();
  });

  it('textarea の改行変換（テキストノード）', () => {
    const template = '<div>{$description:既定:textarea}</div>';
    expect(render(template)).toMatchSnapshot();
  });

  it('optional な rich（値あり / 値なし）', () => {
    const template = '<div>{$content?:既定:rich}</div>';
    expect(render(template)).toMatchSnapshot();
    expect(render(template, { component: emptyComponent })).toMatchSnapshot();
  });

  it('バリデーション付きフィールドのレンダリング（validation は出力に影響しない）', () => {
    const template = '<div>{$title:既定:required:max=10}</div>';
    expect(render(template)).toMatchSnapshot();
    expect(render(template, { component: emptyComponent })).toMatchSnapshot();
  });
});
