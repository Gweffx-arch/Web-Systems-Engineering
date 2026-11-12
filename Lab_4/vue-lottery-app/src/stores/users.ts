import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ServiceProvider } from '@/services/service-provider';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const total = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const createdUsers = ref<User[]>(JSON.parse(localStorage.getItem('local_created_users') || '[]'));
  const updatedUsers = ref<Record<number, UpdateUserDto>>(JSON.parse(localStorage.getItem('local_updated_users') || '{}'));
  const deletedIds = ref<number[]>(JSON.parse(localStorage.getItem('local_deleted_users') || '[]'));

  const syncLocalStorage = () => {
    localStorage.setItem('local_created_users', JSON.stringify(createdUsers.value));
    localStorage.setItem('local_updated_users', JSON.stringify(updatedUsers.value));
    localStorage.setItem('local_deleted_users', JSON.stringify(deletedIds.value));
  };

  async function fetchUsers(params: { limit: number; skip: number; query?: string }) {
    isLoading.value = true;
    error.value = null;
    try {
      const res = params.query
        ? await ServiceProvider.users.search(params.query, params)
        : await ServiceProvider.users.getAll(params);

      const serverItems = res.items
        .filter((u) => !deletedIds.value.includes(u.id))
        .map((u) => (updatedUsers.value[u.id] ? { ...u, ...updatedUsers.value[u.id] } : u));

      const q = (params.query || '').toLowerCase();
      const matchingCreated = createdUsers.value.filter(
        (u) =>
          !q ||
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
      );

      users.value = params.skip === 0 ? [...matchingCreated, ...serverItems] : serverItems;
      total.value = res.total + matchingCreated.length - deletedIds.value.length;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      isLoading.value = false;
    }
  }

  async function createUser(dto: CreateUserDto) {
    const created = await ServiceProvider.users.create(dto);
    const newUser: User = { ...dto, id: Date.now(), image: created.image };
    createdUsers.value.unshift(newUser);
    users.value.unshift(newUser);
    total.value++;
    syncLocalStorage();
    return newUser;
  }

  async function updateUser(id: number, dto: UpdateUserDto) {
    if (id < 1000000) {
      await ServiceProvider.users.update(id, dto);
    }

    const localIdx = createdUsers.value.findIndex((u) => u.id === id);
    if (localIdx !== -1) {
      createdUsers.value[localIdx] = { ...createdUsers.value[localIdx], ...dto };
    } else {
      updatedUsers.value[id] = { ...updatedUsers.value[id], ...dto };
    }

    const index = users.value.findIndex((u) => u.id === id);
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...dto };
    }
    syncLocalStorage();
  }

  async function deleteUser(id: number) {
    if (id < 1000000) {
      await ServiceProvider.users.delete(id);
    }
    createdUsers.value = createdUsers.value.filter((u) => u.id !== id);
    if (!deletedIds.value.includes(id)) {
      deletedIds.value.push(id);
    }
    users.value = users.value.filter((u) => u.id !== id);
    total.value--;
    syncLocalStorage();
  }

  return { users, total, isLoading, error, createdUsers, updatedUsers, fetchUsers, createUser, updateUser, deleteUser };
});
