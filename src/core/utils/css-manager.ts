/**
 * ページCSS管理ユーティリティ
 * カテゴリごとのCSSを注入・管理する
 */

export class PageCSSManager {
  private styleElements: Map<string, HTMLStyleElement> = new Map();
  private container: ShadowRoot | HTMLElement | null = null;

  /**
   * コンテナを設定
   */
  setContainer(container: ShadowRoot | HTMLElement | null): void {
    if (this.container !== container) {
      this.container = container;
      this.removeAllCSS();
    }
  }

  /**
   * 単一のCSSを適用（後方互換性のため残す）
   */
  applyCSS(css: string): void {
    if (!this.container) {
      console.warn('[PageCSSManager] Container not set');
      return;
    }

    if (!css || !css.trim()) {
      this.removeCSS('default');
      return;
    }

    this.applyCSSForCategory('default', css);
  }

  /**
   * 複数のCSSを順に適用（共通 → 個別 → 特別）
   */
  applyMultipleCSS(cssMap: { common?: string; individual?: string; special?: string }): void {
    if (!this.container) {
      console.warn('[PageCSSManager] Container not set');
      return;
    }

    // 順序: common → individual → special
    const order = ['common', 'individual', 'special'] as const;
    order.forEach((category) => {
      const css = cssMap[category];
      if (css && css.trim()) {
        this.applyCSSForCategory(category, css);
      } else {
        this.removeCSS(category);
      }
    });
  }

  /**
   * カテゴリごとのCSSを適用
   */
  private applyCSSForCategory(category: string, css: string): void {
    if (!this.container) {
      return;
    }

    let styleElement = this.styleElements.get(category);
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = `zcode-css-style-${category}`;
      styleElement.setAttribute('data-zcode-css', 'true');
      styleElement.setAttribute('data-zcode-css-category', category);
      this.container.appendChild(styleElement);
      this.styleElements.set(category, styleElement);
    }

    styleElement.textContent = css;
  }

  /**
   * カテゴリごとのCSSを削除
   */
  removeCSS(category: string = 'default'): void {
    const styleElement = this.styleElements.get(category);
    if (styleElement) {
      styleElement.remove();
      this.styleElements.delete(category);
    }
  }

  /**
   * すべてのCSSを削除
   */
  removeAllCSS(): void {
    this.styleElements.forEach((element) => {
      element.remove();
    });
    this.styleElements.clear();
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    this.removeAllCSS();
    this.container = null;
  }
}

