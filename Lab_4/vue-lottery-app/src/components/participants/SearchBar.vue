<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits<{
  (e: 'filter-by-name', query: string): void;
}>();

const searchTerm = ref('');
let timeoutId: number | undefined = undefined;

watch(searchTerm, (newVal) => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = window.setTimeout(() => {
    emit('filter-by-name', newVal.trim());
  }, 300);
});
</script>

<template>
  <div class="mb-3">
    <input
      v-model="searchTerm"
      type="text"
      class="form-control"
      placeholder="Search participants by name..."
    />
  </div>
</template>

<style scoped lang="scss">
.form-control {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.6rem 0.8rem;
  &:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
  }
}
</style>