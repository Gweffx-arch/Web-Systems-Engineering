<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const serverError = ref<string | null>(null);
const isLoading = ref(false);

const validationSchema = toTypedSchema(
  z.object({
    username: z.string().min(1, 'Обов’язкове поле'),
    password: z.string().min(6, 'Пароль має містити мінімум 6 символів'),
  })
);

const { handleSubmit } = useForm({ validationSchema });
const { value: username, errorMessage: usernameError } = useField<string>('username');
const { value: password, errorMessage: passwordError } = useField<string>('password');

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  serverError.value = null;
  try {
    await authStore.login(values.username, values.password);
    const redirect = (route.query.redirect as string) || '/users';
    router.push(redirect);
  } catch (err) {
    serverError.value = (err as Error).message || 'Помилка авторизації';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="lottery-card">
    <h3 class="fw-bold text-center mb-4">Вхід у систему</h3>

    <div v-if="serverError" class="alert alert-danger py-2 small">
      {{ serverError }}
    </div>

    <form @submit="onSubmit" novalidate>
      <div class="mb-3">
        <label class="form-label small fw-bold">Username</label>
        <input v-model="username" type="text" class="form-control" :class="{ 'is-invalid': usernameError }" placeholder="emilys" />
        <div class="invalid-feedback">{{ usernameError }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">Password</label>
        <input v-model="password" type="password" class="form-control" :class="{ 'is-invalid': passwordError }" placeholder="emilyspass" />
        <div class="invalid-feedback">{{ passwordError }}</div>
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
        {{ isLoading ? 'Вхід...' : 'Увійти' }}
      </button>
    </form>

    <div class="mt-3 p-2 bg-light border rounded small text-muted">
      Тестові дані: <code>emilys</code> / <code>emilyspass</code>
    </div>
  </div>
</template>
