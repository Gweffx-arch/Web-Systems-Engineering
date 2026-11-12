<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';

const route = useRoute();

const layouts = {
  default: DefaultLayout,
  auth: AuthLayout,
};

const currentLayout = computed(() => {
  const name = (route.meta.layout as 'default' | 'auth') || 'default';
  return layouts[name];
});
</script>

<template>
  <component :is="currentLayout">
    <RouterView />
  </component>
</template>
