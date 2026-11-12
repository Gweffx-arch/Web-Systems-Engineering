<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

interface Props {
  isOpen: boolean;
  title?: string;
}

defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="modal-backdrop-custom" @click.self="emit('close')">
        <div class="modal-dialog-custom">
          <div class="modal-content-custom">
            <div class="modal-header d-flex justify-content-between align-items-center mb-3">
              <slot name="header">
                <h5 class="m-0 fw-bold">{{ title }}</h5>
              </slot>
              <button type="button" class="btn-close" @click="emit('close')"></button>
            </div>
            
            <div class="modal-body mb-4">
              <slot />
            </div>

            <div class="modal-footer d-flex justify-content-end gap-2">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-dialog-custom {
  width: 100%;
  max-width: 520px;
  margin: 1rem;
}
.modal-content-custom {
  background: white;
  border-radius: 6px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>