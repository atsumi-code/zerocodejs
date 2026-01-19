import { createApp, App } from 'vue';
import ZeroCodeCMS from './components/ZeroCodeCMS.vue';

/**
 * Light DOM Web Component for ZeroCode.js CMS
 * Shadow DOMを使用せず、外部CSSを完全に適用可能
 */
class ZeroCodeCMSElement extends HTMLElement {
  private app: App | null = null;

  constructor() {
    super();
    // Shadow DOMを作成しない（Light DOMを使用）
  }

  connectedCallback() {
    // 各属性値を個別に取得
    const pageAttr = this.getAttribute('page') || '[]';
    const partsCommonAttr = this.getAttribute('parts-common') || '[]';
    const partsIndividualAttr = this.getAttribute('parts-individual') || '[]';
    const imagesCommonAttr = this.getAttribute('images-common') || '[]';
    const imagesIndividualAttr = this.getAttribute('images-individual') || '[]';

    // Vueアプリケーションをこの要素に直接マウント
    this.app = createApp(ZeroCodeCMS, {
      locale: this.getAttribute('locale') || 'ja',
      page: pageAttr,
      partsCommon: partsCommonAttr,
      partsIndividual: partsIndividualAttr,
      imagesCommon: imagesCommonAttr,
      imagesIndividual: imagesIndividualAttr,
      config: this.getAttribute('config') || '',
      endpoints: this.getAttribute('endpoints') || ''
    });

    // この要素自体にマウント（Light DOM）
    this.app.mount(this);
  }

  disconnectedCallback() {
    // クリーンアップ
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
  }

  // 属性変更を監視
  static get observedAttributes() {
    return [
      'locale',
      'page',
      'parts-common',
      'parts-individual',
      'images-common',
      'images-individual',
      'config',
      'endpoints'
    ];
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && this.app) {
      // 属性が変更されたら再マウント
      this.app.unmount();
      this.connectedCallback();
    }
  }
}

// カスタム要素を定義
if (!customElements.get('zcode-cms')) {
  customElements.define('zcode-cms', ZeroCodeCMSElement);
}

export { ZeroCodeCMSElement };
