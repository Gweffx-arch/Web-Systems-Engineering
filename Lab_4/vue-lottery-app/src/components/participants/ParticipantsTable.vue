<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { Participant, SortField, SortOrder, FormErrors } from '../../types/participant';
import BaseButton from '../ui/BaseButton.vue';
import BaseModal from '../ui/BaseModal.vue';
import BaseInput from '../ui/BaseInput.vue';

interface Props {
  participants: Participant[];
  sortField: SortField;
  sortOrder: SortOrder;
  allParticipants: Participant[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'sort', field: SortField): void;
  (e: 'update-participant', updated: Participant): void;
  (e: 'delete-participant', id: string): void;
}>();

// --- Видалення ---
const isDeleteModalOpen = ref(false);
const participantToDelete = ref<Participant | null>(null);

const openDeleteModal = (p: Participant) => {
  participantToDelete.value = p;
  isDeleteModalOpen.value = true;
};

const confirmDelete = () => {
  if (participantToDelete.value) {
    emit('delete-participant', participantToDelete.value.id);
  }
  isDeleteModalOpen.value = false;
};

// --- Редагування ---
const isEditModalOpen = ref(false);
const editData = reactive<Participant>({
  id: '',
  name: '',
  dateOfBirth: '',
  email: '',
  phone: ''
});

const editErrors = reactive<FormErrors>({});
const editTouched = reactive({
  name: false,
  dateOfBirth: false,
  email: false,
  phone: false
});

const openEditModal = (p: Participant) => {
  Object.assign(editData, p);
  (Object.keys(editTouched) as Array<keyof typeof editTouched>).forEach((k) => {
    editTouched[k] = false;
    editErrors[k] = '';
  });
  isEditModalOpen.value = true;
};

const validateEdit = (): boolean => {
  editErrors.name = editData.name.trim() ? '' : 'Name is required';

  if (!editData.dateOfBirth) {
    editErrors.dateOfBirth = 'Date of birth is required';
  } else {
    const selected = new Date(editData.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    editErrors.dateOfBirth = selected > today ? 'Cannot be in the future' : '';
  }

  const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!editData.email.trim()) {
    editErrors.email = 'Email is required';
  } else if (!EMAIL_REGEXP.test(editData.email.trim())) {
    editErrors.email = 'Invalid email';
  } else {
    // Власний email не вважається дублікатом при редагуванні
    const emailExists = props.allParticipants.some(
      (p) => p.id !== editData.id && p.email.toLowerCase() === editData.email.trim().toLowerCase()
    );
    editErrors.email = emailExists ? 'Email already taken' : '';
  }

  const PHONE_REGEXP = /^\+380\d{9}$/;
  if (!editData.phone.trim()) {
    editErrors.phone = 'Phone is required';
  } else if (!PHONE_REGEXP.test(editData.phone.trim())) {
    editErrors.phone = 'Format: +380XXXXXXXXX';
  }

  return !Object.values(editErrors).some((err) => !!err);
};

const handleUpdate = () => {
  (Object.keys(editTouched) as Array<keyof typeof editTouched>).forEach((k) => (editTouched[k] = true));
  if (!validateEdit()) return;

  emit('update-participant', { ...editData });
  isEditModalOpen.value = false;
};
</script>

<template>
  <div class="lottery-card">
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr class="text-muted small text-uppercase">
            <th>#</th>
            <th class="cursor-pointer" @click="emit('sort', 'name')">
              Name
              <span v-if="sortField === 'name'">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th class="cursor-pointer" @click="emit('sort', 'dateOfBirth')">
              Date of Birth
              <span v-if="sortField === 'dateOfBirth'">
                {{ sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th>Email</th>
            <th>Phone number</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, index) in participants" :key="p.id">
            <td class="text-muted">{{ index + 1 }}</td>
            <td class="fw-semibold">{{ p.name }}</td>
            <td>{{ p.dateOfBirth }}</td>
            <td>{{ p.email }}</td>
            <td>{{ p.phone }}</td>
            <td class="text-end">
              <BaseButton variant="outline-secondary" class="btn-sm me-2" @click="openEditModal(p)">
                Edit
              </BaseButton>
              <BaseButton variant="danger" class="btn-sm" @click="openDeleteModal(p)">
                Delete
              </BaseButton>
            </td>
          </tr>
          <tr v-if="participants.length === 0">
            <td colspan="6" class="text-center py-4 text-muted">
              No participants found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальне вікно видалення -->
    <BaseModal :is-open="isDeleteModalOpen" title="Confirm Delete" @close="isDeleteModalOpen = false">
      <p v-if="participantToDelete">
        Do you really want to delete participant <strong>"{{ participantToDelete.name }}"</strong>,
        <em>{{ participantToDelete.email }}</em>?
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="isDeleteModalOpen = false">No</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">Yes</BaseButton>
      </template>
    </BaseModal>

    <!-- Модальне вікно редагування -->
    <BaseModal :is-open="isEditModalOpen" title="Edit Participant" @close="isEditModalOpen = false">
      <form @submit.prevent="handleUpdate">
        <BaseInput
          v-model="editData.name"
          label="Name"
          :error="editErrors.name"
          :is-touched="editTouched.name"
          @blur="editTouched.name = true"
        />
        <BaseInput
          v-model="editData.dateOfBirth"
          type="date"
          label="Date of Birth"
          :error="editErrors.dateOfBirth"
          :is-touched="editTouched.dateOfBirth"
          @blur="editTouched.dateOfBirth = true"
        />
        <BaseInput
          v-model="editData.email"
          type="email"
          label="Email"
          :error="editErrors.email"
          :is-touched="editTouched.email"
          @blur="editTouched.email = true"
        />
        <BaseInput
          v-model="editData.phone"
          label="Phone number"
          :error="editErrors.phone"
          :is-touched="editTouched.phone"
          @blur="editTouched.phone = true"
        />
        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton variant="secondary" @click="isEditModalOpen = false">Cancel</BaseButton>
          <BaseButton type="submit" variant="primary">Update</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}
</style>