import { ref, watch, onUnmounted, type Ref } from 'vue';

function isInteractionInsideAnchor(event: Event, anchor: HTMLElement): boolean {
  if (event.composedPath().includes(anchor)) {
    return true;
  }
  const target = event.target;
  return target instanceof Node && anchor.contains(target);
}

export function usePanelOptionsPopover(anchorRef: Ref<HTMLElement | null>) {
  const optionsPopoverOpen = ref(false);
  let outsideInteractionCleanup: (() => void) | null = null;
  let outsideInteractionTimer: number | null = null;

  function toggleOptionsPopover() {
    optionsPopoverOpen.value = !optionsPopoverOpen.value;
  }

  function closeOptionsPopover() {
    optionsPopoverOpen.value = false;
  }

  function clearOutsideListeners() {
    if (outsideInteractionTimer !== null) {
      clearTimeout(outsideInteractionTimer);
      outsideInteractionTimer = null;
    }
    outsideInteractionCleanup?.();
    outsideInteractionCleanup = null;
  }

  watch(optionsPopoverOpen, (open) => {
    clearOutsideListeners();
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeOptionsPopover();
      }
    };

    const onOutsideInteraction = (event: Event) => {
      const anchor = anchorRef.value;
      if (!anchor || isInteractionInsideAnchor(event, anchor)) {
        return;
      }
      closeOptionsPopover();
    };

    document.addEventListener('keydown', onKeyDown);

    outsideInteractionTimer = window.setTimeout(() => {
      outsideInteractionTimer = null;
      document.addEventListener('pointerdown', onOutsideInteraction, true);
    }, 0);

    outsideInteractionCleanup = () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onOutsideInteraction, true);
    };
  });

  onUnmounted(() => {
    clearOutsideListeners();
    closeOptionsPopover();
  });

  return {
    optionsPopoverOpen,
    toggleOptionsPopover,
    closeOptionsPopover
  };
}
