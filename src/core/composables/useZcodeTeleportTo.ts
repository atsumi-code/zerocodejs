import { computed, inject, type ComputedRef, type Ref } from 'vue';
import { zcodeTeleportTargetKey } from '../injectionKeys';

/**
 * モーダル等の Teleport 先。祖先で `zcodeTeleportTargetKey` が provide されていれば
 * Shadow DOM 内ホスト、なければ `body`。
 */
export function useZcodeTeleportTo(): ComputedRef<string | HTMLElement> {
  const targetRef = inject<Ref<HTMLElement | null> | null>(zcodeTeleportTargetKey, null);
  return computed(() => targetRef?.value ?? 'body');
}
