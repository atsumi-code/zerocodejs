import type { ZeroCodeData, ComponentData, PartData } from '../../types';
import { processTemplateWithDOM, type ProcessTemplateOptions } from '../utils/template-processor';
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

export interface RenderComponentCoreContext {
  findPart: (partId: string) => PartData | null;
  enableEditorAttributes: boolean;
  imagesCommon: Array<{ id: string; url: string }>;
  imagesIndividual: Array<{ id: string; url: string }>;
  imagesSpecial: Array<{ id: string; url: string }>;
  backendData?: Record<string, unknown>;
  options?: ProcessTemplateOptions;
}

/**
 * コンポーネントをHTMLにレンダリングする共通処理
 * 循環参照・パーツ未検出時は RenderError を throw
 */
export function renderComponentCore(
  component: ComponentData,
  path: string,
  processedPaths: Set<string>,
  context: RenderComponentCoreContext,
  renderChild: (childComponent: ComponentData, childPath: string) => string
): string {
  if (processedPaths.has(path)) {
    throw new RenderError('CIRCULAR_REFERENCE', path, `循環参照が検出されました: ${path}`);
  }
  processedPaths.add(path);

  const partId = component.part_id;
  const part = context.findPart(partId);
  if (!part) {
    throw new RenderError('PART_NOT_FOUND', path, `パーツが見つかりません: ${partId}`);
  }

  const html = processTemplateWithDOM(
    part.body,
    component,
    path,
    context.findPart,
    renderChild,
    context.enableEditorAttributes,
    context.imagesCommon,
    context.imagesIndividual,
    context.imagesSpecial,
    context.backendData,
    context.options
  );

  if (context.enableEditorAttributes) {
    return injectAttributesToRootElement(
      html,
      {
        'data-zcode-id': component.id,
        'data-zcode-path': path,
        'data-zcode-part': partId
      },
      part.outlinePosition === 'inner' ? { addClass: 'zcode-outline-inner' } : undefined
    );
  }
  return html;
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

  if (!data) {
    throw new RenderError('PARSE_ERROR', '', 'データが提供されていません');
  }

  const parts = data.parts || { common: [], individual: [], special: [] };
  const images = data.images || { common: [], individual: [], special: [] };
  const page = data.page || [];

  function findPart(partId: string): PartData | null {
    return findPartById(partId, parts);
  }

  const context: RenderComponentCoreContext = {
    findPart,
    enableEditorAttributes,
    imagesCommon: images.common,
    imagesIndividual: images.individual,
    imagesSpecial: images.special,
    backendData
  };

  function renderComponent(
    component: ComponentData,
    path: string,
    processedPaths: Set<string>
  ): string {
    return renderComponentCore(
      component,
      path,
      processedPaths,
      context,
      (childComponent, childPath) =>
        renderComponent(childComponent, childPath, processedPaths)
    );
  }

  return page
    .map((component, index) => {
      try {
        return renderComponent(component, `page.${index}`, new Set());
      } catch (error) {
        if (error instanceof RenderError) {
          return `<div class="zcode-error-message" data-error-code="${error.code}">${error.message}</div>`;
        }
        throw error;
      }
    })
    .join('');
}
