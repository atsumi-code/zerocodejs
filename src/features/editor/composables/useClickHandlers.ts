import { nextTick, type Ref } from 'vue';
import type { ZeroCodeData, ComponentData } from '../../../types';
import { getComponentByPath } from '../../../core/utils/path-utils';
import {
  setActiveOutline,
  setHoverOutline,
  removeHoverOutline,
  setActiveOutlineForPath
} from './useOutlineManager';
import type { EditorMode } from './useEditorMode';
import { resolveReorderClickPath } from '../../reorder/utils/reorder-target-path';

function findElementByZcodePath(root: HTMLElement, path: string): HTMLElement | null {
  return root.querySelector(`[data-zcode-path="${path}"]`) as HTMLElement | null;
}

/** プレビュー内でパーツ／スロット／空スロット追加ボタン上のクリックか */
export function isPreviewPartOrSlotClick(target: HTMLElement, root: HTMLElement): boolean {
  if (!root.contains(target)) {
    return false;
  }
  return !!(
    target.closest('[data-zcode-path]') ||
    target.closest('[data-zcode-slot-path]') ||
    target.closest('[data-zcode-add-slot]')
  );
}

/** パネル・ツールバーなど、選択解除の対象外 UI */
export function isSelectionClearExcludedClick(target: HTMLElement): boolean {
  return !!(
    target.closest('.zcode-toolbar') ||
    target.closest('.zcode-edit-panel') ||
    target.closest('.zcode-add-panel') ||
    target.closest('.zcode-reorder-panel') ||
    target.closest('.zcode-delete-panel') ||
    target.closest('.zcode-settings-panel-overlay') ||
    target.closest('.zcode-save-controls-fixed') ||
    target.closest('.zcode-save-banner') ||
    target.closest('.zcode-context-menu') ||
    target.closest('.zcode-save-confirm-dialog-overlay') ||
    target.closest('.zcode-part-modal') ||
    target.closest('.zcode-preview-modal') ||
    target.closest('.zcode-help-modal-overlay') ||
    target.closest('.zcode-image-modal')
  );
}

export function isSelectionClearExcludedInComposedPath(event: Event): boolean {
  for (const node of event.composedPath()) {
    if (node instanceof HTMLElement && isSelectionClearExcludedClick(node)) {
      return true;
    }
  }
  return false;
}

/** composedPath 上でプレビュー内のパーツ／スロットクリックか（Shadow DOM 対応） */
export function isPreviewPartOrSlotClickInEvent(event: Event, preview: HTMLElement): boolean {
  for (const node of event.composedPath()) {
    if (!(node instanceof HTMLElement) || !preview.contains(node)) {
      continue;
    }
    if (isPreviewPartOrSlotClick(node, preview)) {
      return true;
    }
  }
  return false;
}

export function shouldClearSelectionOnClick(
  event: Event,
  preview: HTMLElement | null,
  hasActiveSelection: boolean
): boolean {
  if (!hasActiveSelection || !preview) {
    return false;
  }
  if (isSelectionClearExcludedInComposedPath(event)) {
    return false;
  }
  if (isPreviewPartOrSlotClickInEvent(event, preview)) {
    return false;
  }
  return true;
}

export function useClickHandlers(
  cmsData: ZeroCodeData,
  previewArea: Ref<HTMLElement | null>,
  interactionRoot: Ref<HTMLElement | null>,
  currentMode: Ref<EditorMode>,
  editingComponentPath: Ref<string>,
  addTargetPath: Ref<string | null>,
  reorderSourcePath: Ref<string>,
  deleteConfirmPath: Ref<string>,
  handleEditClick: (path: string, component: ComponentData) => void,
  handleAddClick: (path: string) => void,
  handleReorderClick: (path: string) => void,
  handleDeleteClick: (path: string, component: ComponentData) => void,
  canReorderWith: (sourcePath: string, targetPath: string) => boolean,
  switchMode: (mode: EditorMode) => void,
  allowDynamicContentInteraction: Ref<boolean>,
  closeEditPanel: () => void,
  cancelAdd: () => void,
  cancelDelete: () => void,
  cancelReorder: () => void,
  onAfterHandlersSetup?: () => void
) {
  const eventListeners = new Map<
    HTMLElement,
    Array<{ type: string; listener: EventListener; options?: boolean | AddEventListenerOptions }>
  >();
  const documentListeners: Array<{
    type: string;
    listener: EventListener;
    options?: boolean | AddEventListenerOptions;
  }> = [];

  function hasActiveSelection(): boolean {
    switch (currentMode.value) {
      case 'edit':
        return !!editingComponentPath.value;
      case 'add':
        return addTargetPath.value !== null;
      case 'delete':
        return !!deleteConfirmPath.value;
      case 'reorder':
        return !!reorderSourcePath.value;
      default:
        return false;
    }
  }

  function clearActiveSelection() {
    switch (currentMode.value) {
      case 'edit':
        if (editingComponentPath.value) {
          closeEditPanel();
        }
        break;
      case 'add':
        if (addTargetPath.value) {
          cancelAdd();
        }
        break;
      case 'delete':
        if (deleteConfirmPath.value) {
          cancelDelete();
        }
        break;
      case 'reorder':
        if (reorderSourcePath.value) {
          cancelReorder();
        }
        break;
    }
  }

  function setupClickHandlers() {
    if (!previewArea.value || !interactionRoot.value) return;

    const clearAllHoverOutlines = () => {
      const allActive = previewArea.value?.querySelectorAll(
        '[data-zcode-id], [data-zcode-slot-path]'
      );
      if (!allActive) return;
      allActive.forEach((el) => {
        removeHoverOutline(el as HTMLElement);
      });
    };

    cleanupEventListeners();

    const editableElements = previewArea.value.querySelectorAll('[data-zcode-id]');

    // 空スロットの「+ パーツを追加」ボタンは、z-slot処理で後からDOMに注入されることがあるため
    // 個別にクリックを付けず、previewAreaでイベント委譲して常に拾う（captureで親要素より先に処理）
    const delegatedAddSlotClick: EventListener = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const addSlotButton = target.closest('[data-zcode-add-slot]') as HTMLElement | null;
      if (!addSlotButton) return;

      const slotElement = addSlotButton.closest('[data-zcode-slot-path]') as HTMLElement | null;
      const slotPath = slotElement?.getAttribute('data-zcode-slot-path');
      if (!slotPath) return;

      // 親の[data-zcode-id]クリックより確実に優先させる
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // 追加対象スロットを強調表示
      // ※ モード切替が発生するとプレビューDOMが差し替えられて、直前に付けたアウトラインが消えることがあるため
      //    DOM更新後にも再度アウトラインを付ける
      const highlightSlot = () => {
        const currentSlotEl = previewArea.value?.querySelector(
          `[data-zcode-slot-path="${slotPath}"]`
        ) as HTMLElement | null;
        if (currentSlotEl) {
          removeHoverOutline(currentSlotEl);
          setActiveOutline(currentSlotEl, 'add');
        }
      };

      if (slotElement) {
        removeHoverOutline(slotElement);
      }

      if (currentMode.value !== 'add') {
        switchMode('add');
        nextTick(() => {
          handleAddClick(slotPath);
          nextTick(() => {
            highlightSlot();
          });
        });
        return;
      }

      // addモード中はDOM差し替えが少ないので即時+次tickで強調
      highlightSlot();
      nextTick(() => {
        handleAddClick(slotPath);
        nextTick(() => {
          highlightSlot();
        });
      });
    };

    // スロット要素のホバーもイベント委譲にする（z-slotで後から生成されても必ず効く）
    let hoveredSlotEl: HTMLElement | null = null;
    const isSlotActive = (slotPath: string) =>
      editingComponentPath.value === slotPath ||
      addTargetPath.value === slotPath ||
      reorderSourcePath.value === slotPath ||
      deleteConfirmPath.value === slotPath;

    const delegatedSlotMouseOver: EventListener = (e: Event) => {
      const me = e as PointerEvent;
      if (me.pointerType !== 'mouse') {
        return;
      }
      const target = me.target as HTMLElement | null;
      if (!target) return;

      const slotEl = target.closest('[data-zcode-slot-path]') as HTMLElement | null;
      if (!slotEl) {
        if (hoveredSlotEl) {
          const prevPath = hoveredSlotEl.getAttribute('data-zcode-slot-path') || '';
          if (!prevPath || !isSlotActive(prevPath)) {
            removeHoverOutline(hoveredSlotEl);
          }
          hoveredSlotEl = null;
        }
        return;
      }

      if (hoveredSlotEl === slotEl) return;

      if (hoveredSlotEl) {
        const prevPath = hoveredSlotEl.getAttribute('data-zcode-slot-path') || '';
        if (!prevPath || !isSlotActive(prevPath)) {
          removeHoverOutline(hoveredSlotEl);
        }
      }

      hoveredSlotEl = slotEl;
      const slotPath = slotEl.getAttribute('data-zcode-slot-path') || '';
      if (slotPath && !isSlotActive(slotPath)) {
        setHoverOutline(slotEl, currentMode.value);
      }
    };

    const delegatedSlotMouseOut: EventListener = (e: Event) => {
      const me = e as PointerEvent;
      if (me.pointerType !== 'mouse') {
        return;
      }
      const target = me.target as HTMLElement | null;
      if (!target) return;
      const related = me.relatedTarget as HTMLElement | null;

      const slotEl = target.closest('[data-zcode-slot-path]') as HTMLElement | null;
      if (!slotEl) return;

      // 同一slot内の移動は無視
      if (related && slotEl.contains(related)) return;

      const slotPath = slotEl.getAttribute('data-zcode-slot-path') || '';
      if (!slotPath || !isSlotActive(slotPath)) {
        removeHoverOutline(slotEl);
      }
      if (hoveredSlotEl === slotEl) {
        hoveredSlotEl = null;
      }
    };

    let hoveredReorderTargetPath: string | null = null;

    const clearReorderTargetHover = () => {
      if (!previewArea.value || !hoveredReorderTargetPath) {
        hoveredReorderTargetPath = null;
        previewArea.value?.style.removeProperty('cursor');
        return;
      }
      const prevEl = findElementByZcodePath(previewArea.value, hoveredReorderTargetPath);
      if (
        prevEl &&
        reorderSourcePath.value !== hoveredReorderTargetPath &&
        editingComponentPath.value !== hoveredReorderTargetPath &&
        addTargetPath.value !== hoveredReorderTargetPath &&
        deleteConfirmPath.value !== hoveredReorderTargetPath
      ) {
        removeHoverOutline(prevEl);
      }
      hoveredReorderTargetPath = null;
      previewArea.value.style.removeProperty('cursor');
    };

    const delegatedReorderTargetClick: EventListener = (e: Event) => {
      if (currentMode.value !== 'reorder' || !reorderSourcePath.value || !previewArea.value) {
        return;
      }

      const target = e.target as HTMLElement;
      const resolved = resolveReorderClickPath(
        reorderSourcePath.value,
        target,
        canReorderWith,
        previewArea.value
      );

      if (!resolved) {
        return;
      }

      if (!allowDynamicContentInteraction.value) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }

      handleReorderClick(resolved);
    };

    const delegatedReorderPointerOver: EventListener = (e: Event) => {
      if (currentMode.value !== 'reorder' || !reorderSourcePath.value || !previewArea.value) {
        return;
      }

      const me = e as PointerEvent;
      if (me.pointerType !== 'mouse') {
        return;
      }

      const resolved = resolveReorderClickPath(
        reorderSourcePath.value,
        me.target as HTMLElement,
        canReorderWith,
        previewArea.value
      );

      if (resolved === hoveredReorderTargetPath) {
        return;
      }

      if (hoveredReorderTargetPath) {
        const prevEl = findElementByZcodePath(previewArea.value, hoveredReorderTargetPath);
        if (prevEl && reorderSourcePath.value !== hoveredReorderTargetPath) {
          removeHoverOutline(prevEl);
        }
      }

      hoveredReorderTargetPath = resolved;

      if (resolved) {
        const el = findElementByZcodePath(previewArea.value, resolved);
        if (el) {
          setHoverOutline(el, 'reorder');
        }
        previewArea.value.style.cursor = 'move';
      } else {
        previewArea.value.style.cursor = 'not-allowed';
      }
    };

    const delegatedReorderPointerOut: EventListener = (e: Event) => {
      if (currentMode.value !== 'reorder' || !reorderSourcePath.value || !previewArea.value) {
        return;
      }

      const me = e as PointerEvent;
      if (me.pointerType !== 'mouse') {
        return;
      }

      const related = me.relatedTarget as HTMLElement | null;
      if (related && previewArea.value.contains(related)) {
        return;
      }

      clearReorderTargetHover();
    };

    const delegatedClearSelectionClick: EventListener = (e: Event) => {
      const preview = previewArea.value;
      if (!shouldClearSelectionOnClick(e, preview, hasActiveSelection())) {
        return;
      }
      clearActiveSelection();
    };

    previewArea.value.addEventListener('click', delegatedAddSlotClick, true);
    previewArea.value.addEventListener('click', delegatedReorderTargetClick, true);
    document.addEventListener('click', delegatedClearSelectionClick, true);
    documentListeners.push({
      type: 'click',
      listener: delegatedClearSelectionClick,
      options: true
    });
    previewArea.value.addEventListener('pointerdown', clearAllHoverOutlines, true);
    previewArea.value.addEventListener('pointerover', delegatedSlotMouseOver, true);
    previewArea.value.addEventListener('pointerover', delegatedReorderPointerOver, true);
    previewArea.value.addEventListener('pointerout', delegatedSlotMouseOut, true);
    previewArea.value.addEventListener('pointerout', delegatedReorderPointerOut, true);
    eventListeners.set(previewArea.value, [
      { type: 'click', listener: delegatedAddSlotClick, options: true },
      { type: 'click', listener: delegatedReorderTargetClick, options: true },
      { type: 'pointerover', listener: delegatedSlotMouseOver, options: true },
      { type: 'pointerover', listener: delegatedReorderPointerOver, options: true },
      { type: 'pointerout', listener: delegatedSlotMouseOut, options: true },
      { type: 'pointerout', listener: delegatedReorderPointerOut, options: true },
      { type: 'pointerdown', listener: clearAllHoverOutlines, options: true }
    ]);
    editableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const path = htmlElement.getAttribute('data-zcode-path');

      if (!path) return;

      const clickListener = (e: Event) => {
        const target = e.target as HTMLElement;

        const clickedElement = target?.closest('[data-zcode-path]') as HTMLElement;
        const clickedPath = clickedElement?.getAttribute('data-zcode-path');

        if (clickedPath && clickedPath !== path) {
          return;
        }

        const linkElement = target?.closest('a[href]') as HTMLAnchorElement | null;
        if (linkElement) {
          if (!allowDynamicContentInteraction.value) {
            e.preventDefault();
          }
        }

        if (!allowDynamicContentInteraction.value) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        const component = getComponentByPath(path, cmsData);
        if (!component) {
          return;
        }

        removeHoverOutline(htmlElement);

        switch (currentMode.value) {
          case 'edit':
            handleEditClick(path, component);
            break;
          case 'add':
            handleAddClick(path);
            break;
          case 'reorder':
            if (reorderSourcePath.value) {
              if (path === reorderSourcePath.value && clickedPath === path) {
                handleReorderClick(path);
              }
              return;
            }
            handleReorderClick(path);
            break;
          case 'delete':
            handleDeleteClick(path, component);
            break;
        }
      };

      const isActive = (checkPath: string): boolean => {
        const isActivePath =
          editingComponentPath.value === checkPath ||
          addTargetPath.value === checkPath ||
          reorderSourcePath.value === checkPath ||
          deleteConfirmPath.value === checkPath;

        if (isActivePath) {
          return true;
        }

        if (checkPath.includes('.slots.')) {
          const pathParts = checkPath.split('.');
          let lastSlotIndex = -1;
          for (let i = pathParts.length - 1; i >= 0; i--) {
            if (pathParts[i] === 'slots') {
              lastSlotIndex = i;
              break;
            }
          }
          if (lastSlotIndex !== -1 && lastSlotIndex + 1 < pathParts.length) {
            const slotPath = pathParts.slice(0, lastSlotIndex + 2).join('.');
            return (
              addTargetPath.value === slotPath ||
              editingComponentPath.value === slotPath ||
              reorderSourcePath.value === slotPath ||
              deleteConfirmPath.value === slotPath
            );
          }
        }

        return false;
      };

      const mouseenterListener = (event: Event) => {
        const pointerEvent = event as PointerEvent;
        if ('pointerType' in pointerEvent && pointerEvent.pointerType !== 'mouse') {
          return;
        }
        if (currentMode.value === 'reorder' && reorderSourcePath.value) {
          return;
        }

        if (!isActive(path)) {
          setHoverOutline(htmlElement, currentMode.value);
        }

        if (currentMode.value === 'reorder') {
          htmlElement.style.cursor = 'move';
        } else {
          htmlElement.style.cursor = 'pointer';
        }
      };

      const mouseleaveListener = (event: Event) => {
        const pointerEvent = event as PointerEvent;
        if ('pointerType' in pointerEvent && pointerEvent.pointerType !== 'mouse') {
          return;
        }
        if (!isActive(path)) {
          removeHoverOutline(htmlElement);
        }
        htmlElement.style.cursor = '';
      };

      htmlElement.addEventListener('click', clickListener, true);
      htmlElement.addEventListener('pointerenter', mouseenterListener);
      htmlElement.addEventListener('pointerleave', mouseleaveListener);

      eventListeners.set(htmlElement, [
        { type: 'click', listener: clickListener, options: true },
        { type: 'pointerenter', listener: mouseenterListener },
        { type: 'pointerleave', listener: mouseleaveListener }
      ]);
    });

    nextTick(() => {
      nextTick(() => {
        if (currentMode.value === 'edit' && editingComponentPath.value && previewArea.value) {
          setActiveOutlineForPath(previewArea.value, editingComponentPath.value, 'edit');
        }

        if (currentMode.value === 'add' && addTargetPath.value && previewArea.value) {
          const addElements = previewArea.value.querySelectorAll(
            `[data-zcode-path="${addTargetPath.value}"]`
          );
          if (addElements.length > 0) {
            setActiveOutlineForPath(previewArea.value, addTargetPath.value, 'add');
          } else {
            const slotElement = previewArea.value.querySelector(
              `[data-zcode-slot-path="${addTargetPath.value}"]`
            ) as HTMLElement;
            if (slotElement) {
              setActiveOutline(slotElement, 'add');
            }
          }
        }

        if (currentMode.value === 'reorder' && reorderSourcePath.value && previewArea.value) {
          setActiveOutlineForPath(previewArea.value, reorderSourcePath.value, 'reorder');
        }

        if (currentMode.value === 'delete' && deleteConfirmPath.value && previewArea.value) {
          setActiveOutlineForPath(previewArea.value, deleteConfirmPath.value, 'delete');
        }

        onAfterHandlersSetup?.();
      });
    });
  }

  function cleanupEventListeners() {
    eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ type, listener, options }) => {
        element.removeEventListener(type, listener, options as any);
      });
    });
    eventListeners.clear();
    documentListeners.forEach(({ type, listener, options }) => {
      document.removeEventListener(type, listener, options as any);
    });
    documentListeners.length = 0;
  }

  return {
    setupClickHandlers,
    cleanupEventListeners
  };
}
