/**
 * SSR 用エントリ — Vue / Web Components を読み込まず renderToHtml のみ公開
 * Node で import して LP などをサーバー描画する用途
 */
export { renderToHtml, RenderError } from './core/renderer/renderer';
