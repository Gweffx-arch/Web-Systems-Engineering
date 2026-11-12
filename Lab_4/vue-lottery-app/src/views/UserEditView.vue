<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { ServiceProvider } from '@/services/service-provider';
import { useUsersStore } from '@/stores/users';

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();
const userId = Number(route.params.id);
const isLoading = ref(true);

const schema = toTypedSchema(
  z.object({
    firstName: z.string().min(1, 'Обов’язкове поле'),
    lastName: z.string().min(1, 'Обов’язкове поле'),
    email: z.string().email('Некоректний email'),
    username: z.string().min(3, 'Мінімум 3 символи'),
    age: z.number().min(1).max(120),
    gender: z.string().min(1),
    phone: z.string().min(5, 'Введіть телефон'),
  })
);

const { handleSubmit, resetForm } = useForm({ validationSchema: schema });
const { value: firstName, errorMessage: fErr } = useField<string>('firstName');
const { value: lastName, errorMessage: lErr } = useField<string>('lastName');
const { value: email, errorMessage: eErr } = useField<string>('email');
const { value: username, errorMessage: uErr } = useField<string>('username');
const { value: age, errorMessage: aErr } = useField<number>('age');
const { value: gender } = useField<string>('gender');
const { value: phone, errorMessage: pErr } = useField<string>('phone');

onMounted(async () => {
  try {
    const existing = usersStore.users.find((u) => u.id === userId) || (await ServiceProvider.users.getById(userId));
    resetForm({
      values: {
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        username: existing.username,
        age: existing.age,
        gender: existing.gender,
        phone: existing.phone,
      },
    });
  } finally {
    isLoading.value = false;
  }
});

const onSubmit = handleSubmit(async (values) => {
  await usersStore.updateUser(userId, values);
  router.push('/users');
});
</script>

<template>
  <div class="modal-backdrop-custom">
    <div class="modal-dialog-custom lottery-card">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold m-0">Редагування #{{ userId }}</h5>
        <button class="btn-close" @click="router.push('/users')"></button>
      </div>

      <div v-if="isLoading" class="text-center py-3">
        <div class="spinner-border spinner-border-sm text-primary"></div>
      </div>

      <form v-else @submit="onSubmit">
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
            <label class="form-label small fw-bold">Age</label>
            <input v-model.number="age" type="number" class="form-control" :class="{ 'is-invalid': aErr }" />
            <div class="invalid-feedback">{{ aErr }}</div>
          </div>
        </div>
        <div class="row">
          <div class="col-6 mb-2">
            <label class="form-label small fw-bold">Gender</label>
            <select v-model="gender" class="form-select">
              <option value="male">male</option>
              <option value="female">female</option>
            </select>
          </div>
          <div class="col-6 mb-2">
            <label class="form-label small fw-bold">Phone</label>
            <input v-model="phone" class="form-control" :class="{ 'is-invalid': pErr }" />
            <div class="invalid-feedback">{{ pErr }}</div>
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button type="button" class="btn btn-secondary" @click="router.push('/users')">Скасувати</button>
          <button type="submit" class="btn btn-primary">Оновити</button>
        </div>
      </form>
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
  z-index: 1060;
}
.modal-dialog-custom {
  width: 100%;
  max-width: 540px;
  margin: 1rem;
}
</style>
