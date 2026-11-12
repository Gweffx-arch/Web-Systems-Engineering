<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ServiceProvider } from '@/services/service-provider';
import { useUsersStore } from '@/stores/users';
import type { User } from '@/types/user';

const props = defineProps<{ id: string }>();
const router = useRouter();
const usersStore = useUsersStore();

const user = ref<User | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  const numericId = Number(props.id);
  try {
    const localUser = usersStore.createdUsers.find((u) => u.id === numericId);
    if (localUser) {
      user.value = { ...localUser };
    } else {
      const fetched = await ServiceProvider.users.getById(numericId);
      user.value = usersStore.updatedUsers[numericId]
        ? { ...fetched, ...usersStore.updatedUsers[numericId] }
        : fetched;
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="lottery-card">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fw-bold m-0">Профіль користувача #{{ id }}</h3>
      <button class="btn btn-secondary btn-sm" @click="router.back()">← Назад</button>
    </div>

    <div v-if="isLoading" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="user" class="row align-items-center">
      <div class="col-md-3 text-center">
        <img :src="user.image || 'https://dummyjson.com/icon/emilys/128'" class="rounded-circle border p-1" width="120" height="120" alt="avatar" />
      </div>
      <div class="col-md-9">
        <h4>{{ user.firstName }} {{ user.lastName }}</h4>
        <p class="text-muted">@{{ user.username }}</p>
        <p class="mb-1"><strong>Email:</strong> {{ user.email }}</p>
        <p class="mb-1"><strong>Телефон:</strong> {{ user.phone }}</p>
        <p class="mb-1"><strong>Вік:</strong> {{ user.age }} | <strong>Стать:</strong> {{ user.gender }}</p>
        <router-link :to="`/users/${user.id}/edit`" class="btn btn-primary btn-sm mt-2">
          Редагувати
        </router-link>
      </div>
    </div>
  </div>
</template>
