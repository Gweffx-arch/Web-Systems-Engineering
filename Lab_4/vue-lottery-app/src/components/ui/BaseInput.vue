<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  isTouched?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  error: '',
  isTouched: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'blur'): void;
}>();

const isValid = computed(() => props.isTouched && !props.error && props.modelValue.trim() !== '');
const isInvalid = computed(() => props.isTouched && !!props.error);
</script>

<template>
  <div class="mb-3 position-relative">
    <label v-if="label" class="form-label fw-bold small text-muted text-uppercase mb-1">
      {{ label }}
    </label>
    <div class="input-wrapper position-relative">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :class="[
          'form-control',
          { 'is-invalid': isInvalid, 'is-valid': isValid }
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur')"
      />
      <span v-if="isValid" class="valid-icon position-absolute end-0 top-50 translate-middle-y me-3 text-success">
        ✓
      </span>
    </div>
    <div v-if="isInvalid" class="invalid-feedback d-block small mt-1">
      {{ error }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-control {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.6rem 0.8rem;
  &:focus {
    background-color: #fff;
    border-color: #0ea5e9;
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
  }
}
.valid-icon {
  font-weight: bold;
}
</style>