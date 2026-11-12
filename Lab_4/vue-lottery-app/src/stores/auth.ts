import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ServiceProvider } from '@/services/service-provider';
import type { User } from '@/types/user';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const user = ref<User | null>(
    localStorage.getItem('current_user') ? JSON.parse(localStorage.getItem('current_user')!) : null
  );

  const isAuthenticated = computed(() => !!token.value);

  async function login(username: string, password: string) {
    const res = await ServiceProvider.auth.login({ username, password });
    token.value = res.accessToken;
    user.value = {
      id: res.id,
      firstName: res.firstName,
      lastName: res.lastName,
      email: res.email,
      username: res.username,
      age: 0,
      gender: res.gender,
      phone: '',
      image: res.image,
    };

    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('current_user', JSON.stringify(user.value));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  return { token, user, isAuthenticated, login, logout };
});
