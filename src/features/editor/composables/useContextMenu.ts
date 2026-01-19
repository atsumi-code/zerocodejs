import { ref, type Ref } from 'vue';
import type { EditorMode } from './useEditorMode';

export function useContextMenu(
  previewArea: Ref<HTMLElement | null>,
  enabled: Ref<boolean>,
  switchMode: (mode: EditorMode) => void
) {
  const isVisible = ref(false);
  const position = ref({ x: 0, y: 0 });

  function handleContextMenu(event: MouseEvent) {
    if (!enabled.value || !previewArea.value) return;

    const target = event.target as HTMLElement;
    const element = target.closest('[data-zcode-path]') as HTMLElement;

    if (!element) return;

    event.preventDefault();
    event.stopPropagation();

    position.value = {
      x: event.clientX,
      y: event.clientY
    };
    isVisible.value = true;
  }

  function handleModeSelect(mode: EditorMode) {
    switchMode(mode);
    isVisible.value = false;
  }

  function closeMenu() {
    isVisible.value = false;
  }

  function handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.zcode-context-menu')) {
      closeMenu();
    }
  }

  function handleDocumentContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.zcode-context-menu')) {
      closeMenu();
    }
  }

  function setupContextMenu() {
    if (!previewArea.value || !enabled.value) return;

    previewArea.value.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('contextmenu', handleDocumentContextMenu);
  }

  function cleanupContextMenu() {
    if (!previewArea.value) return;
    previewArea.value.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('contextmenu', handleDocumentContextMenu);
  }

  return {
    isVisible,
    position,
    handleModeSelect,
    closeMenu,
    setupContextMenu,
    cleanupContextMenu
  };
}
