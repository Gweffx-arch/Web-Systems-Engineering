<script setup lang="ts">
import type { Participant } from '../../types/participant';

interface Props {
  winner: Participant;
}

defineProps<Props>();
defineEmits<{
  (e: 'remove', id: string): void;
}>();
</script>

<template>
  <span class="badge winner-badge d-inline-flex align-items-center gap-1 px-3 py-2">
    {{ winner.name }}
    <button
      type="button"
      class="btn-close btn-close-white ms-1"
      aria-label="Remove"
      @click="$emit('remove', winner.id)"
    ></button>
  </span>
</template>

<style scoped lang="scss">
.winner-badge {
  background-color: #0284c7;
  color: #fff;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  .btn-close {
    font-size: 0.65rem;
  }
}
</style>