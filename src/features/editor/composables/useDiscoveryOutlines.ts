import { type Ref } from 'vue';
import type { EditorMode } from './useEditorMode';
import {
  clearAllDiscoveryOutlines,
  clearAllDiscoveryPulse,
  DISCOVERY_PULSE_CLASS,
  setDiscoveryOutline
} from './useOutlineManager';

/** モード切替直後のみ、ディスカバリー枠をこの時間だけ点滅させる（CSS 1.2s × 2 回と同期） */
export const DISCOVERY_PULSE_DURATION_MS = 2400;

function hasSelectionInCurrentMode(
  mode: EditorMode,
  editingComponentPath: string,
  addTargetPath: string | null,
  reorderSourcePath: string,
  deleteConfirmPath: string
): boolean {
  switch (mode) {
    case 'edit':
      return editingComponentPath.length > 0;
    case 'add':
      return addTargetPath != null && addTargetPath.length > 0;
    case 'reorder':
      return reorderSourcePath.length > 0;
    case 'delete':
      return deleteConfirmPath.length > 0;
    default:
      return false;
  }
}

export type SyncDiscoveryOutlinesOptions = {
  /** true のときモード切替直後の数秒だけ枠を点滅（未選択時のみ） */
  pulse?: boolean;
};

export function useDiscoveryOutlines(
  previewArea: Ref<HTMLElement | null>,
  viewMode: Ref<'preview' | 'manage'>,
  currentMode: Ref<EditorMode>,
  showPartDiscoveryOutlines: Ref<boolean>,
  editingComponentPath: Ref<string>,
  addTargetPath: Ref<string | null>,
  reorderSourcePath: Ref<string>,
  deleteConfirmPath: Ref<string>
) {
  let pulseTimer: ReturnType<typeof setTimeout> | null = null;
  let pulseAnimationEndHandler: ((event: AnimationEvent) => void) | null = null;

  function clearPulseEndListeners(root: HTMLElement) {
    if (pulseTimer != null) {
      clearTimeout(pulseTimer);
      pulseTimer = null;
    }
    if (pulseAnimationEndHandler != null) {
      root.removeEventListener('animationend', pulseAnimationEndHandler);
      pulseAnimationEndHandler = null;
    }
  }

  function finishPulse(root: HTMLElement) {
    clearPulseEndListeners(root);
    clearAllDiscoveryPulse(root);
  }

  function isDiscoveryPulseAnimation(event: AnimationEvent): boolean {
    return event.animationName.startsWith('zcode-discovery-pulse-');
  }

  function schedulePulseEnd(root: HTMLElement) {
    clearPulseEndListeners(root);

    pulseAnimationEndHandler = (event: AnimationEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (!event.target.classList.contains(DISCOVERY_PULSE_CLASS)) return;
      if (!isDiscoveryPulseAnimation(event)) return;
      finishPulse(root);
    };
    root.addEventListener('animationend', pulseAnimationEndHandler);

    pulseTimer = setTimeout(() => {
      finishPulse(root);
    }, DISCOVERY_PULSE_DURATION_MS + 50);
  }

  function syncDiscoveryOutlines(options: SyncDiscoveryOutlinesOptions = {}) {
    const root = previewArea.value;
    if (!root) return;

    clearPulseEndListeners(root);
    clearAllDiscoveryOutlines(root);

    if (viewMode.value !== 'manage' || !showPartDiscoveryOutlines.value) {
      return;
    }

    if (
      hasSelectionInCurrentMode(
        currentMode.value,
        editingComponentPath.value,
        addTargetPath.value,
        reorderSourcePath.value,
        deleteConfirmPath.value
      )
    ) {
      return;
    }

    const mode = currentMode.value;
    const withPulse = options.pulse === true;
    const targets = root.querySelectorAll('[data-zcode-id], [data-zcode-slot-path]');
    targets.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.classList.contains('zcode-outline-active')) {
        return;
      }
      setDiscoveryOutline(htmlEl, mode, withPulse);
    });

    if (withPulse && targets.length > 0) {
      schedulePulseEnd(root);
    }
  }

  return {
    syncDiscoveryOutlines
  };
}
