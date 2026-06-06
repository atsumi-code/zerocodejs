import { type Ref } from 'vue';
import type { EditorMode } from './useEditorMode';
import { DISCOVERY_PULSE_DURATION_MS } from './useDiscoveryOutlines';
import {
  clearAllReorderTargetOutlines,
  clearAllReorderTargetPulse,
  REORDER_TARGET_PULSE_CLASS,
  setReorderTargetOutline
} from './useOutlineManager';

export type SyncReorderTargetOutlinesOptions = {
  /** true のとき移動元選択直後の数秒だけ移動先枠を点滅 */
  pulse?: boolean;
};

export function useReorderTargetOutlines(
  previewArea: Ref<HTMLElement | null>,
  viewMode: Ref<'preview' | 'manage'>,
  currentMode: Ref<EditorMode>,
  reorderSourcePath: Ref<string>,
  canReorderWith: (sourcePath: string, targetPath: string) => boolean
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
    clearAllReorderTargetPulse(root);
  }

  function isReorderTargetPulseAnimation(event: AnimationEvent): boolean {
    return event.animationName === 'zcode-discovery-pulse-reorder';
  }

  function schedulePulseEnd(root: HTMLElement) {
    clearPulseEndListeners(root);

    pulseAnimationEndHandler = (event: AnimationEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      if (!event.target.classList.contains(REORDER_TARGET_PULSE_CLASS)) return;
      if (!isReorderTargetPulseAnimation(event)) return;
      finishPulse(root);
    };
    root.addEventListener('animationend', pulseAnimationEndHandler);

    pulseTimer = setTimeout(() => {
      finishPulse(root);
    }, DISCOVERY_PULSE_DURATION_MS + 50);
  }

  function syncReorderTargetOutlines(options: SyncReorderTargetOutlinesOptions = {}) {
    const root = previewArea.value;
    if (!root) return;

    clearPulseEndListeners(root);
    clearAllReorderTargetOutlines(root);

    if (
      viewMode.value !== 'manage' ||
      currentMode.value !== 'reorder' ||
      !reorderSourcePath.value
    ) {
      return;
    }

    const sourcePath = reorderSourcePath.value;
    const withPulse = options.pulse === true;
    let targetCount = 0;
    const targets = root.querySelectorAll('[data-zcode-path]');

    targets.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const path = htmlEl.getAttribute('data-zcode-path');
      if (!path || path === sourcePath) {
        return;
      }
      if (htmlEl.classList.contains('zcode-outline-active')) {
        return;
      }
      if (canReorderWith(sourcePath, path)) {
        setReorderTargetOutline(htmlEl, withPulse);
        targetCount += 1;
      }
    });

    if (withPulse && targetCount > 0) {
      schedulePulseEnd(root);
    }
  }

  return {
    syncReorderTargetOutlines
  };
}
