import { nextTick, type Ref } from 'vue';
import type { ZeroCodeData, ComponentData } from '../../../types';
import { getComponentByPath } from '../../../core/utils/path-utils';
import { setActiveOutline, setHoverOutline, removeHoverOutline } from './useOutlineManager';
import type { EditorMode } from './useEditorMode';

export function useClickHandlers(
  cmsData: ZeroCodeData,
  previewArea: Ref<HTMLElement | null>,
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
  allowDynamicContentInteraction: Ref<boolean>
) {
  const eventListeners = new Map<
    HTMLElement,
    Array<{ type: string; listener: EventListener; options?: boolean | AddEventListenerOptions }>
  >();

  function setupClickHandlers() {
    if (!previewArea.value) return;

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
      const me = e as MouseEvent;
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
      const me = e as MouseEvent;
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

    previewArea.value.addEventListener('click', delegatedAddSlotClick, true);
    previewArea.value.addEventListener('mouseover', delegatedSlotMouseOver, true);
    previewArea.value.addEventListener('mouseout', delegatedSlotMouseOut, true);
    eventListeners.set(previewArea.value, [
      { type: 'click', listener: delegatedAddSlotClick, options: true },
      { type: 'mouseover', listener: delegatedSlotMouseOver, options: true },
      { type: 'mouseout', listener: delegatedSlotMouseOut, options: true }
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
              const sourceParts = reorderSourcePath.value.split('.');
              const targetParts = path.split('.');

              if (sourceParts.length !== targetParts.length) {
                const sourceRowsIndex = sourceParts.indexOf('rows');
                if (sourceRowsIndex !== -1) {
                  const targetCellsIndex = targetParts.indexOf('cells');
                  if (targetCellsIndex !== -1) {
                    let slotsIndex = -1;
                    for (let i = targetCellsIndex - 1; i >= 0; i--) {
                      if (targetParts[i] === 'slots') {
                        slotsIndex = i;
                        break;
                      }
                    }
                    if (slotsIndex !== -1) {
                      const rowPath = targetParts.slice(0, slotsIndex).join('.');
                      if (rowPath && canReorderWith(reorderSourcePath.value, rowPath)) {
                        handleReorderClick(rowPath);
                        return;
                      }
                    }
                  }
                }
              }
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

      const mouseenterListener = () => {
        if (!isActive(path)) {
          if (currentMode.value === 'reorder' && reorderSourcePath.value) {
            if (canReorderWith(reorderSourcePath.value, path)) {
              setHoverOutline(htmlElement, currentMode.value);
            }
          } else {
            setHoverOutline(htmlElement, currentMode.value);
          }
        }

        if (currentMode.value === 'reorder') {
          htmlElement.style.cursor =
            reorderSourcePath.value && canReorderWith(reorderSourcePath.value, path)
              ? 'move'
              : reorderSourcePath.value
                ? 'not-allowed'
                : 'move';
        } else {
          htmlElement.style.cursor = 'pointer';
        }
      };

      const mouseleaveListener = () => {
        if (!isActive(path)) {
          removeHoverOutline(htmlElement);
        }
        htmlElement.style.cursor = '';
      };

      htmlElement.addEventListener('click', clickListener, true);
      htmlElement.addEventListener('mouseenter', mouseenterListener);
      htmlElement.addEventListener('mouseleave', mouseleaveListener);

      eventListeners.set(htmlElement, [
        { type: 'click', listener: clickListener, options: true },
        { type: 'mouseenter', listener: mouseenterListener },
        { type: 'mouseleave', listener: mouseleaveListener }
      ]);
    });

    nextTick(() => {
      nextTick(() => {
        if (currentMode.value === 'edit' && editingComponentPath.value && previewArea.value) {
          const editingElement = previewArea.value.querySelector(
            `[data-zcode-path="${editingComponentPath.value}"]`
          ) as HTMLElement;
          if (editingElement) {
            setActiveOutline(editingElement, 'edit');
          }
        }

        if (currentMode.value === 'add' && addTargetPath.value && previewArea.value) {
          const addElement = previewArea.value.querySelector(
            `[data-zcode-path="${addTargetPath.value}"]`
          ) as HTMLElement;
          if (addElement) {
            setActiveOutline(addElement, 'add');
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
          const reorderElement = previewArea.value.querySelector(
            `[data-zcode-path="${reorderSourcePath.value}"]`
          ) as HTMLElement;
          if (reorderElement) {
            setActiveOutline(reorderElement, 'reorder');
          }
        }

        if (currentMode.value === 'delete' && deleteConfirmPath.value && previewArea.value) {
          const deleteElement = previewArea.value.querySelector(
            `[data-zcode-path="${deleteConfirmPath.value}"]`
          ) as HTMLElement;
          if (deleteElement) {
            setActiveOutline(deleteElement, 'delete');
          }
        }
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
  }

  return {
    setupClickHandlers,
    cleanupEventListeners
  };
}
