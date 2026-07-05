<template>
  <Teleport :to="teleportTo">
    <div v-if="show" class="zcode-preview-modal" @click="$emit('close')">
      <div class="zcode-preview-modal-content" @click.stop>
        <div class="zcode-preview-modal-header">
          <div class="zcode-preview-modal-header-title" role="heading" aria-level="4">
            {{ $t('partsManager.preview') }} {{ title }}
          </div>
          <button class="zcode-close-btn" @click="$emit('close')">
            <X :size="18" />
          </button>
        </div>
        <div class="zcode-preview-modal-body" v-html="html" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { useZcodeTeleportTo } from '../../../core/composables/useZcodeTeleportTo';

defineProps<{
  show: boolean;
  title: string;
  html: string;
}>();

defineEmits<{ close: [] }>();

const teleportTo = useZcodeTeleportTo();
</script>
