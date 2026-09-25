/**
 * SSR 用エントリ — Vue / Web Components を読み込まず renderToHtml のみ公開
 * Node で import して LP などをサーバー描画する用途
 */
export { renderToHtml, renderCssToHtml, RenderError } from './core/renderer/renderer';
export { ZERO_CODE_DATA_VERSION, migrateZeroCodeData } from './core/utils/data-version';
