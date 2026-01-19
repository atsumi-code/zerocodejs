// Light DOM Web Component として登録
import './web-components/zcode-cms';
import './web-components/zcode-editor';

// CSS スタイルをインポート
import './styles/zcode-cms.css';

// 型定義エクスポート
export * from './types';

// サーバーサイド用のレンダリング関数をエクスポート
export { renderToHtml, RenderError } from './core/renderer/renderer';

// コンポーネントのエクスポート（Vue環境で直接使いたい場合）
export { default as ZeroCodePreview } from './components/ZeroCodePreview.vue';
export { default as ZeroCodeCMS } from './components/ZeroCodeCMS.vue';
export { default as ZeroCodeEditor } from './components/ZeroCodeEditor.vue';
