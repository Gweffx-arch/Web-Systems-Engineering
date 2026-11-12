<script setup lang="ts">
import Logo from './Logo.vue';
import AppNavigation from './AppNavigation.vue';
</script>

<template>
  <header class="bg-white shadow-sm py-3 mb-4">
    <div class="container d-flex justify-content-between align-items-center">
      <Logo />
      <AppNavigation />
    </div>
  </header>
</template>
