<template>
  <div
    v-if="deleteConfirmComponent && currentMode === 'delete'"
    class="zcode-delete-panel"
    @click.stop
  >
    <div class="zcode-delete-panel-header">
      <div
        class="zcode-panel-header-title"
        role="heading"
        aria-level="3"
      >
        {{ $t('deletePanel.title') }}
      </div>
      <button
        class="zcode-close-btn"
        :aria-label="$t('common.close')"
        @click="$emit('cancel')"
      >
        <X :size="18" />
      </button>
    </div>

    <!-- 親要素選択ボタン -->
    <div
      v-if="canSelectParent"
      class="zcode-parent-selector"
    >
      <button
        class="zcode-parent-select-btn"
        @click="$emit('select-parent')"
      >
        <ChevronUp :size="16" />
        <span>{{ $t('deletePanel.selectParent') }}</span>
      </button>
    </div>

    <div class="zcode-delete-panel-content">
      <div class="zcode-delete-warning">
        <AlertTriangle
          :size="20"
          class="zcode-delete-warning-icon"
        />
        <div class="zcode-delete-warning-text">
          {{ $t('deletePanel.confirmMessage') }}
        </div>
      </div>

      <div class="zcode-delete-actions">
        <button
          class="zcode-btn-danger"
          @click="$emit('confirm')"
        >
          <Trash2 :size="16" />
          <span>{{ $t('common.delete') }}</span>
        </button>
        <button
          class="zcode-btn-cancel"
          @click="$emit('cancel')"
        >
          <X :size="16" />
          <span>{{ $t('common.cancel') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentData } from '../../../types';
import { ChevronUp, AlertTriangle, Trash2, X } from 'lucide-vue-next';

defineProps<{
  deleteConfirmComponent: ComponentData | null;
  currentMode: 'edit' | 'add' | 'reorder' | 'delete';
  canSelectParent: boolean;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
  'select-parent': [];
}>();
</script>
