import { ref } from 'vue';

export type EditorMode = 'edit' | 'add' | 'reorder' | 'delete';

export function useEditorMode() {
  const currentMode = ref<EditorMode>('edit');
  // 動的コンテンツ（アコーディオン、タブ、モーダルなど）の動作を許可するかどうか（デフォルトはfalse：編集モードを優先）
  const allowDynamicContentInteraction = ref<boolean>(false);

  function switchMode(mode: EditorMode) {
    currentMode.value = mode;
  }

  return {
    currentMode,
    switchMode,
    allowDynamicContentInteraction
  };
}
