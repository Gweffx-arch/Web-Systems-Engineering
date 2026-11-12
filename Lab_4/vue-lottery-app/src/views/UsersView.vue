<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useUsersStore } from '@/stores/users';

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();

const LIMIT = 10;
const searchInput = ref((route.query.q as string) || '');
const showCreateModal = ref(false);
let debounceTimer: number | undefined;

const currentPage = computed(() => Number(route.query.page) || 1);
const totalPages = computed(() => Math.ceil(usersStore.total / LIMIT) || 1);

const loadData = () => {
  const page = Number(route.query.page) || 1;
  const q = (route.query.q as string) || '';
  const skip = (page - 1) * LIMIT;
  usersStore.fetchUsers({ limit: LIMIT, skip, query: q });
};

onMounted(loadData);
watch(() => [route.query.page, route.query.q], loadData);

const onSearchInput = (val: string) => {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    router.push({
      path: '/users',
      query: { ...route.query, q: val.trim() || undefined, page: 1 },
    });
  }, 300);
};

const changePage = (page: number) => {
  router.push({
    path: '/users',
    query: { ...route.query, page: page.toString() },
  });
};

const createSchema = toTypedSchema(
  z.object({
    firstName: z.string().min(1, 'Обов’язкове поле'),
    lastName: z.string().min(1, 'Обов’язкове поле'),
    email: z.string().email('Некоректний email'),
    username: z.string().min(3, 'Мінімум 3 символи'),
    password: z.string().min(6, 'Мінімум 6 символів'),
    age: z.number({ invalid_type_error: 'Вкажіть число' }).min(1).max(120),
    gender: z.string().min(1, 'Оберіть стать'),
    phone: z.string().min(5, 'Введіть телефон'),
  })
);

const { handleSubmit, resetForm } = useForm({ validationSchema: createSchema, initialValues: { gender: 'male' } });
const { value: firstName, errorMessage: fErr } = useField<string>('firstName');
const { value: lastName, errorMessage: lErr } = useField<string>('lastName');
const { value: email, errorMessage: eErr } = useField<string>('email');
const { value: username, errorMessage: uErr } = useField<string>('username');
const { value: password, errorMessage: passErr } = useField<string>('password');
const { value: age, errorMessage: ageErr } = useField<number>('age');
const { value: gender, errorMessage: gErr } = useField<string>('gender');
const { value: phone, errorMessage: pErr } = useField<string>('phone');

const onCreateSubmit = handleSubmit(async (values) => {
  await usersStore.createUser(values);
  resetForm();
  showCreateModal.value = false;
});
</script>

<template>
  <div>
    <RouterView />

    <div class="lottery-card">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 class="fw-bold m-0">Користувачі</h3>
        <div class="d-flex gap-2">
          <input
            v-model="searchInput"
            type="text"
            class="form-control"
            placeholder="Пошук користувачів..."
            @input="onSearchInput(($event.target as HTMLInputElement).value)"
          />
          <button class="btn btn-primary text-nowrap" @click="showCreateModal = true">
            + Додати юзера
          </button>
        </div>
      </div>

      <div v-if="usersStore.isLoading" class="text-center py-4">
        <div class="spinner-border text-primary"></div>
      </div>

      <div v-else-if="usersStore.error" class="alert alert-danger">
        {{ usersStore.error }}
      </div>

      <div v-else class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr class="text-muted small text-uppercase">
              <th>ID</th>
              <th>Ім'я</th>
              <th>Email</th>
              <th>Username</th>
              <th>Вік</th>
              <th>Телефон</th>
              <th class="text-end">Дії</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usersStore.users" :key="user.id">
              <td>{{ user.id }}</td>
              <td class="fw-semibold">
                <router-link :to="`/users/${user.id}`">{{ user.firstName }} {{ user.lastName }}</router-link>
              </td>
              <td>{{ user.email }}</td>
              <td>@{{ user.username }}</td>
              <td>{{ user.age }}</td>
              <td>{{ user.phone }}</td>
              <td class="text-end text-nowrap">
                <router-link :to="`/users/${user.id}`" class="btn btn-sm btn-outline-info me-1">Деталі</router-link>
                <router-link :to="`/users/${user.id}/edit`" class="btn btn-sm btn-outline-secondary me-1">Edit</router-link>
                <button class="btn btn-sm btn-outline-danger" @click="usersStore.deleteUser(user.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px;">
  <button class="btn btn-sm btn-outline-primary" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
    ← Попередня
  </button>
  <span class="text-muted small">Сторінка <strong>{{ currentPage }}</strong> з <strong>{{ totalPages }}</strong></span>
  <button class="btn btn-sm btn-outline-primary" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
    Наступна →
  </button>
</div>
    </div>

    <div v-if="showCreateModal" class="modal-backdrop-custom">
      <div class="modal-dialog-custom lottery-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold m-0">Новий користувач</h5>
          <button class="btn-close" @click="showCreateModal = false"></button>
        </div>
        <form @submit="onCreateSubmit">
          <div class="row">
            <div class="col-6 mb-2">
              <label class="form-label small fw-bold">First Name</label>
              <input v-model="firstName" class="form-control" :class="{ 'is-invalid': fErr }" />
              <div class="invalid-feedback">{{ fErr }}</div>
            </div>
            <div class="col-6 mb-2">
              <label class="form-label small fw-bold">Last Name</label>
              <input v-model="lastName" class="form-control" :class="{ 'is-invalid': lErr }" />
              <div class="invalid-feedback">{{ lErr }}</div>
            </div>
          </div>
          <div class="mb-2">
            <label class="form-label small fw-bold">Email</label>
            <input v-model="email" class="form-control" :class="{ 'is-invalid': eErr }" />
            <div class="invalid-feedback">{{ eErr }}</div>
          </div>
          <div class="row">
            <div class="col-6 mb-2">
              <label class="form-label small fw-bold">Username</label>
              <input v-model="username" class="form-control" :class="{ 'is-invalid': uErr }" />
              <div class="invalid-feedback">{{ uErr }}</div>
            </div>
            <div class="col-6 mb-2">
              <label class="form-label small fw-bold">Password</label>
              <input v-model="password" type="password" class="form-control" :class="{ 'is-invalid': passErr }" />
              <div class="invalid-feedback">{{ passErr }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col-4 mb-2">
              <label class="form-label small fw-bold">Age</label>
              <input v-model.number="age" type="number" class="form-control" :class="{ 'is-invalid': ageErr }" />
              <div class="invalid-feedback">{{ ageErr }}</div>
            </div>
            <div class="col-4 mb-2">
              <label class="form-label small fw-bold">Gender</label>
              <select v-model="gender" class="form-select" :class="{ 'is-invalid': gErr }">
                <option value="male">male</option>
                <option value="female">female</option>
              </select>
              <div class="invalid-feedback">{{ gErr }}</div>
            </div>
            <div class="col-4 mb-2">
              <label class="form-label small fw-bold">Phone</label>
              <input v-model="phone" class="form-control" :class="{ 'is-invalid': pErr }" />
              <div class="invalid-feedback">{{ pErr }}</div>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button type="button" class="btn btn-secondary" @click="showCreateModal = false">Скасувати</button>
            <button type="submit" class="btn btn-primary">Створити</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-dialog-custom {
  width: 100%;
  max-width: 540px;
  margin: 1rem;
}
</style>

