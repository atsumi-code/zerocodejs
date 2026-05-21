import type { InjectionKey, Ref } from 'vue';

/** Teleport 先（Shadow 内ホスト）。未提供時は各所で `body` にフォールバック */
export const zcodeTeleportTargetKey: InjectionKey<Ref<HTMLElement | null>> =
  Symbol('zcodeTeleportTarget');
