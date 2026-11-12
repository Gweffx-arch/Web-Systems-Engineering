<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue';
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <AppHeader />
    <main class="container flex-grow-1 pb-4">
      <slot />
    </main>
  </div>
</template>
