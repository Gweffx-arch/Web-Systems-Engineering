<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <nav style="display: flex; align-items: center; gap: 16px;">
    <router-link to="/" class="nav-link-item" active-class="active-link">Home</router-link>
    <router-link to="/about" class="nav-link-item" active-class="active-link">About author</router-link>
    <router-link to="/users" class="nav-link-item" active-class="active-link">Users</router-link>

    <button v-if="authStore.isAuthenticated" class="btn btn-outline-danger btn-sm" @click="handleLogout">
      Logout
    </button>
    <router-link v-else to="/login" class="btn btn-primary btn-sm">
      Login
    </router-link>
  </nav>
</template>

<style scoped>
.nav-link-item {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}
.nav-link-item:hover {
  background-color: #f1f3f5;
  color: #0d6efd;
}
.active-link {
  background-color: #0d6efd;
  color: #fff !important;
}
</style>
