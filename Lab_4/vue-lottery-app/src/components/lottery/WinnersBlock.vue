<script setup lang="ts">
import type { Participant } from '../../types/participant';
import WinnerItem from './WinnerItem.vue';
import BaseButton from '../ui/BaseButton.vue';

interface Props {
  winners: Participant[];
  canDrawWinner: boolean;
}

defineProps<Props>();
defineEmits<{
  (e: 'draw'): void;
  (e: 'remove-winner', id: string): void;
}>();
</script>

<template>
  <div class="lottery-card d-flex justify-content-between align-items-center flex-wrap gap-3">
    <div class="d-flex align-items-center flex-wrap gap-2">
      <span class="fw-bold text-muted me-2">Winners:</span>
      <template v-if="winners.length > 0">
        <WinnerItem
          v-for="w in winners"
          :key="w.id"
          :winner="w"
          @remove="$emit('remove-winner', $event)"
        />
      </template>
      <span v-else class="text-muted small fst-italic">No winners yet</span>
    </div>

    <BaseButton
      variant="primary"
      :disabled="!canDrawWinner"
      @click="$emit('draw')"
    >
      New winner
    </BaseButton>
  </div>
</template>