import type { ZeroCodeData, ComponentData, PartData } from '../../types';
import { processTemplateWithDOM } from '../utils/template-processor';
import { injectAttributesToRootElement } from '../utils/template-utils';
import { findPartById } from '../utils/path-utils';

/**
 * レンダリングエラー
 */
export class RenderError extends Error {
  constructor(
    public code: 'PART_NOT_FOUND' | 'CIRCULAR_REFERENCE' | 'PARSE_ERROR',
    public path: string,
    message: string
  ) {
    super(message);
    this.name = 'RenderError';
  }
}

/**
 * データからHTMLを生成（サーバーサイド/クライアントサイド両対応）
 *
 * @param data - ZeroCodeData形式のデータ
 * @param options - レンダリングオプション
 * @returns 生成されたHTML文字列
 */
export function renderToHtml(
  data: ZeroCodeData,
  options: {
    enableEditorAttributes?: boolean;
  } = {}
): string {
  const { enableEditorAttributes = false } = options;
  const backendData = data.backendData;

  // データ構造の検証と正規化
  if (!data) {
    throw new RenderError('PARSE_ERROR', '', 'データが提供されていません');
  }

  // partsとimagesが正しい構造であることを確認
  const parts = data.parts || { common: [], individual: [], special: [] };
  const images = data.images || { common: [], individual: [], special: [] };
  const page = data.page || [];

  function findPart(partId: string): PartData | null {
    return findPartById(partId, parts);
  }

  function renderComponent(
    component: ComponentData,
    path: string = '',
    processedPaths: Set<string> = new Set()
  ): string {
    // 循環参照を防ぐ
    if (processedPaths.has(path)) {
      throw new RenderError('CIRCULAR_REFERENCE', path, `循環参照が検出されました: ${path}`);
    }
    processedPaths.add(path);

    const partId = component.part_id;
    const part = findPart(partId);
    if (!part) {
      throw new RenderError('PART_NOT_FOUND', path, `パーツが見つかりません: ${partId}`);
    }

    // テンプレート処理（環境に応じて適切なDOMParserを使用）
    const html = processTemplateWithDOM(
      part.body,
      component,
      path,
      findPart,
      (childComponent: ComponentData, childPath: string) =>
        renderComponent(childComponent, childPath, processedPaths),
      enableEditorAttributes,
      images.common,
      images.individual,
      images.special,
      backendData
    );

    // 属性注入（編集用属性が有効な場合のみ）
    if (enableEditorAttributes) {
      return injectAttributesToRootElement(html, {
        'data-zcode-id': component.id,
        'data-zcode-path': path,
        'data-zcode-part': partId
      });
    }
    return html;
  }

  return page
    .map((component, index) => {
      try {
        return renderComponent(component, `page.${index}`);
      } catch (error) {
        if (error instanceof RenderError) {
          // エラーをHTMLに埋め込む
          return `<div class="zcode-error-message" data-error-code="${error.code}">${error.message}</div>`;
        }
        throw error;
      }
    })
    .join('');
}
