/**
 * DOM操作のユーティリティ
 * 環境に応じて適切なDOMParserを返す
 */

export function getDOMParser(): typeof DOMParser {
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    return DOMParser;
  }

  if (typeof require !== 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM();
      return dom.window.DOMParser as typeof DOMParser;
    } catch (error) {
      throw new Error(
        'jsdom is required for server-side rendering. Please install it: npm install jsdom'
      );
    }
  }

  if (typeof DOMParser !== 'undefined') {
    return DOMParser;
  }

  throw new Error('DOMParser is not available in this environment');
}

/**
 * Shadow DOM内で実行されるスクリプトに対して、そのShadow DOM内の要素にアクセスできるようにする拡張スクリプトを生成
 * @param shadowRoot - Shadow DOMのルート要素
 * @returns 拡張スクリプトのテキストコンテンツ
 */
export function createShadowDOMExtensionScript(shadowRoot: ShadowRoot): string {
  type WindowWithZCMS = Window & {
    __zcmsShadowRoots?: Map<string, ShadowRoot>;
  };

  const w = window as WindowWithZCMS;

  if (!w.__zcmsShadowRoots) {
    w.__zcmsShadowRoots = new Map();
  }
  const scriptId = `script-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  w.__zcmsShadowRoots.set(scriptId, shadowRoot);

  return `
    (function() {
      const scriptId = '${scriptId}'
      const shadowRoot = window.__zcmsShadowRoots?.get(scriptId)
      if (!shadowRoot || !(shadowRoot instanceof ShadowRoot)) {
        return
      }

      if (shadowRoot.__zcmsJQueryExtended) {
        return
      }

      if (!shadowRoot.__zcmsEventListeners) {
        shadowRoot.__zcmsEventListeners = new Map()
      }

      shadowRoot.__zcmsSetAllowDynamicContentInteraction = function(value) {
        shadowRoot.__zcmsAllowDynamicContentInteraction = value !== false;
      };

      ;(function initAllowDynamicContentInteraction() {
        try {
          const raw = localStorage.getItem('zcode-user-settings')
          if (!raw) {
            shadowRoot.__zcmsAllowDynamicContentInteraction = false
            return
          }
          const parsed = JSON.parse(raw) || {}
          shadowRoot.__zcmsAllowDynamicContentInteraction =
            parsed?.cms?.allowDynamicContentInteraction === true
        } catch (e) {
          shadowRoot.__zcmsAllowDynamicContentInteraction = false
        }
      })();

      function extendJQuery() {
        if (typeof jQuery === 'undefined' || typeof window.jQuery === 'undefined') {
          setTimeout(extendJQuery, 50)
          return
        }

        if (shadowRoot.__zcmsJQueryExtended) {
          return
        }

        const $ = window.jQuery

        if (!$.fn.__zcmsOriginalInit) {
          $.fn.__zcmsOriginalInit = $.fn.init
        }
        const originalInit = $.fn.__zcmsOriginalInit

        $.fn.init = function(selector, context, root) {
          const result = originalInit.call(this, selector, context, root)

          if (typeof selector === 'string' && result.length === 0) {
            try {
              const shadowElements = shadowRoot.querySelectorAll(selector)
              if (shadowElements.length > 0) {
                return $(Array.from(shadowElements))
              }
            } catch (e) {
            }
          }

          return result
        }

        $.fn.init.prototype = originalInit.prototype
        if (!$.fn.__zcmsOriginalFind) {
          $.fn.__zcmsOriginalFind = $.fn.find
        }
        const originalFind = $.fn.__zcmsOriginalFind

        $.fn.find = function(selector) {
          const result = originalFind.call(this, selector)

          if (result.length === 0 && typeof selector === 'string') {
            try {
              const shadowElements = []
              let shouldSearchShadow = false

              this.each(function() {
                const element = this
                if (element === document || element === shadowRoot) {
                  shouldSearchShadow = true
                  return false
                }
                if (element.getRootNode && element.getRootNode() === shadowRoot) {
                  shouldSearchShadow = true
                  return false
                }
              })

              if (shouldSearchShadow) {
                const found = shadowRoot.querySelectorAll(selector)
                shadowElements.push(...Array.from(found))
              }

              if (shadowElements.length > 0) {
                return $(Array.from(new Set(shadowElements)))
              }
            } catch (e) {
            }
          }

          return result
        }
        if (!$.fn.__zcmsOriginalClosest) {
          $.fn.__zcmsOriginalClosest = $.fn.closest
        }
        const originalClosest = $.fn.__zcmsOriginalClosest

        $.fn.closest = function(selector) {
          const result = originalClosest.call(this, selector)

          if (result.length === 0 && typeof selector === 'string') {
            try {
              let found = null
              this.each(function() {
                const element = this
                if (element.getRootNode && element.getRootNode() === shadowRoot) {
                  let current = element
                  while (current && current !== shadowRoot) {
                    if (current.matches && current.matches(selector)) {
                      found = current
                      return false
                    }
                    current = current.parentElement
                  }
                }
              })

              if (found) {
                return $(found)
              }
            } catch (e) {
            }
          }

          return result
        }
        if (!$.fn.__zcmsOriginalOn) {
          $.fn.__zcmsOriginalOn = $.fn.on
        }
        const originalOn = $.fn.__zcmsOriginalOn

        $.fn.on = function(events, selector, data, handler) {
          let actualSelector = selector
          let actualData = data
          let actualHandler = handler

          if (typeof selector === 'function') {
            actualHandler = selector
            actualSelector = undefined
            actualData = undefined
          }
          else if (typeof data === 'function') {
            actualHandler = data
            actualData = undefined
          }

          if (this[0] === document && actualSelector && typeof actualSelector === 'string') {
            const eventKey = events + ':' + actualSelector
            const existingListeners = shadowRoot.__zcmsEventListeners.get(eventKey)
            if (existingListeners) {
              existingListeners.forEach(function(listener) {
                shadowRoot.removeEventListener(listener.eventName, listener.handler, true)
              })
            }

            const newListeners = []
            const eventNames = events.split(/\s+/);

            let shadowContainer = null
            for (let i = 0; i < shadowRoot.children.length; i++) {
              const child = shadowRoot.children[i]
              if (child.tagName === 'DIV') {
                shadowContainer = child
                break
              }
            }
            if (!shadowContainer) {
              for (let i = 0; i < shadowRoot.children.length; i++) {
                const child = shadowRoot.children[i]
                if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE' && child.tagName !== 'LINK') {
                  shadowContainer = child
                  break
                }
              }
            }
            if (!shadowContainer) {
              shadowContainer = shadowRoot
            }

            eventNames.forEach(function(eventName) {
              if (eventName) {
                const handler = function(event) {
                  if (shadowRoot.__zcmsAllowDynamicContentInteraction === false) {
                    return
                  }

                  let target = event.target
                  if (!target || !target.matches) {
                    return
                  }

                  const targetRoot = target.getRootNode ? target.getRootNode() : null
                  if (targetRoot !== shadowRoot) {
                    return
                  }

                  while (target && target !== shadowRoot) {
                    if (target.matches && target.matches(actualSelector)) {
                      const $target = $(target)
                      if (actualHandler) {
                        const jqEvent = $.Event(eventName, {
                          originalEvent: event,
                          target: target,
                          currentTarget: target
                        })
                        actualHandler.call(target, jqEvent)
                        if (jqEvent.isDefaultPrevented()) {
                          event.preventDefault()
                        }
                        if (jqEvent.isPropagationStopped()) {
                          event.stopPropagation()
                        }
                      }
                      break
                    }
                    target = target.parentElement
                  }
                }

                if (shadowContainer && shadowContainer.addEventListener) {
                  shadowContainer.addEventListener(eventName, handler, true)
                  newListeners.push({ eventName: eventName, handler: handler })
                }
              }
            })

            shadowRoot.__zcmsEventListeners.set(eventKey, newListeners)
          }

          return originalOn.call(this, events, selector, data, handler)
        }

        shadowRoot.__zcmsJQueryExtended = true
      }

      extendJQuery()
      let checkCount = 0
      const maxChecks = 20
      const checkInterval = setInterval(() => {
        checkCount++
        if (shadowRoot.__zcmsJQueryExtended || checkCount >= maxChecks) {
          clearInterval(checkInterval)
          return
        }
        extendJQuery()
      }, 50)

      if (!shadowRoot.__zcmsNativeAPIExtended) {
        if (!Document.prototype.__zcmsOriginalQuerySelector) {
          Document.prototype.__zcmsOriginalQuerySelector = Document.prototype.querySelector
          Document.prototype.__zcmsOriginalQuerySelectorAll = Document.prototype.querySelectorAll

          Document.prototype.querySelector = function(selector) {
            const result = Document.prototype.__zcmsOriginalQuerySelector.call(this, selector)
            if (result) {
              return result
            }

            if (!selector || typeof selector !== 'string') {
              return null
            }

            const currentScript = document.currentScript
            if (currentScript) {
              const rootNode = currentScript.getRootNode()
              if (rootNode instanceof ShadowRoot) {
                try {
                  const shadowElement = rootNode.querySelector(selector)
                  if (shadowElement) {
                    return shadowElement
                  }
                } catch (e) {
                }
              }
            }

            return null
          }

          Document.prototype.querySelectorAll = function(selector) {
            const result = Document.prototype.__zcmsOriginalQuerySelectorAll.call(this, selector)

            if (!selector || typeof selector !== 'string') {
              return result
            }

            const currentScript = document.currentScript
            if (currentScript) {
              const rootNode = currentScript.getRootNode()
              if (rootNode instanceof ShadowRoot) {
                try {
                  const shadowElements = rootNode.querySelectorAll(selector)
                  if (shadowElements.length > 0) {
                    const merged = new Set([...result, ...shadowElements])
                    return Array.from(merged)
                  }
                } catch (e) {
                }
              }
            }

            return result
          }
        }

        shadowRoot.__zcmsNativeAPIExtended = true
      }

      if (!window.__zcmsShadowHelpers) {
        window.__zcmsShadowHelpers = new Map()
      }
      window.__zcmsShadowHelpers.set(shadowRoot, {
        querySelector: function(selector) {
          return shadowRoot.querySelector(selector)
        },
        querySelectorAll: function(selector) {
          return shadowRoot.querySelectorAll(selector)
        }
      })
    })()
  `;
}

/**
 * Shadow DOM内に拡張スクリプトを注入
 * @param shadowRoot - Shadow DOMのルート要素
 * @param forceReInject - 強制的に再注入するかどうか
 */
export function injectShadowDOMExtension(
  shadowRoot: ShadowRoot,
  forceReInject: boolean = false
): void {
  type ShadowRootWithZCMS = ShadowRoot & {
    __zcmsEventListeners?: Map<string, Array<{ eventName: string; handler: EventListener }>>;
    __zcmsJQueryExtended?: boolean;
    __zcmsNativeAPIExtended?: boolean;
  };

  const zcmsRoot = shadowRoot as ShadowRootWithZCMS;
  const existingExtension = shadowRoot.querySelector('script[data-zcode-shadow-extension]');

  if (existingExtension) {
    if (forceReInject) {
      if (zcmsRoot.__zcmsEventListeners) {
        const listeners = zcmsRoot.__zcmsEventListeners;
        listeners.forEach(function (
          listenerArray: Array<{ eventName: string; handler: EventListener }>
        ) {
          listenerArray.forEach(function (listener) {
            shadowRoot.removeEventListener(listener.eventName, listener.handler, true);
          });
        });
        listeners.clear();
      }

      existingExtension.remove();
      if (zcmsRoot.__zcmsJQueryExtended) {
        delete zcmsRoot.__zcmsJQueryExtended;
      }
      if (zcmsRoot.__zcmsNativeAPIExtended) {
        delete zcmsRoot.__zcmsNativeAPIExtended;
      }
    } else {
      return;
    }
  }

  const extensionScript = document.createElement('script');
  extensionScript.setAttribute('data-zcode-shadow-extension', 'true');
  extensionScript.textContent = createShadowDOMExtensionScript(shadowRoot);

  shadowRoot.insertBefore(extensionScript, shadowRoot.firstChild);
}

/**
 * zcode-toolbarの高さを取得
 * @returns toolbarの高さ（px）。見つからない場合は20を返す（デフォルトオフセット）
 */
export function getToolbarHeight(): number {
  if (typeof window === 'undefined') {
    return 20; // デフォルトオフセット
  }

  try {
    // Light DOM内で検索
    let toolbar = document.querySelector('.zcode-toolbar') as HTMLElement | null;

    // Shadow DOM内でも検索
    if (!toolbar) {
      const webComponents = document.querySelectorAll('zcode-cms, zcode-editor');
      for (const wc of Array.from(webComponents)) {
        const shadowRoot = (wc as HTMLElement).shadowRoot;
        if (shadowRoot) {
          const shadowToolbar = shadowRoot.querySelector('.zcode-toolbar') as HTMLElement | null;
          if (shadowToolbar) {
            toolbar = shadowToolbar;
            break;
          }
        }
      }
    }

    if (!toolbar) {
      return 20; // デフォルトオフセット
    }

    const rect = toolbar.getBoundingClientRect();
    return rect.height > 0 ? rect.height : 20; // 高さが0の場合はデフォルト値
  } catch (error) {
    console.warn('Failed to get toolbar height:', error);
    return 20; // エラー時はデフォルトオフセット
  }
}

/**
 * 要素までスクロール（toolbarの高さを考慮）
 * @param element - スクロール先の要素
 * @param offset - 追加のオフセット（デフォルト: 0）
 */
export function scrollToElement(element: HTMLElement, offset: number = 0): void {
  if (typeof window === 'undefined' || !element) {
    return;
  }

  try {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const toolbarHeight = getToolbarHeight();
    const targetY = rect.top + scrollTop - toolbarHeight - offset;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  } catch (error) {
    console.warn('Failed to scroll to element:', error);
    // フォールバック: 元の方法でスクロール
    try {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = rect.top + scrollTop - 20;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    } catch (fallbackError) {
      console.error('Scroll fallback also failed:', fallbackError);
    }
  }
}
