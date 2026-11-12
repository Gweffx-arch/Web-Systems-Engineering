<script setup lang="ts">
import { reactive } from 'vue';
import type { Participant, FormErrors } from '../../types/participant';
import BaseInput from '../ui/BaseInput.vue';
import BaseButton from '../ui/BaseButton.vue';

const props = defineProps<{
  existingEmails: string[];
}>();

const emit = defineEmits<{
  (e: 'add-participant', participant: Omit<Participant, 'id'>): void;
}>();

const formData = reactive({
  name: '',
  dateOfBirth: '',
  email: '',
  phone: ''
});

const errors = reactive<FormErrors>({});
const touched = reactive({
  name: false,
  dateOfBirth: false,
  email: false,
  phone: false
});

const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEXP = /^\+380\d{9}$/;

const validateField = (field: keyof typeof formData) => {
  errors[field] = '';

  if (!formData[field].trim()) {
    errors[field] = 'This value is required';
    return;
  }

  if (field === 'dateOfBirth') {
    const selectedDate = new Date(formData.dateOfBirth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      errors.dateOfBirth = 'Date of birth cannot be in the future';
    }
  }

  if (field === 'email') {
    if (!EMAIL_REGEXP.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    } else if (props.existingEmails.includes(formData.email.trim().toLowerCase())) {
      errors.email = 'Participant with this email already exists';
    }
  }

  if (field === 'phone') {
    if (!PHONE_REGEXP.test(formData.phone.trim())) {
      errors.phone = 'Format: +380XXXXXXXXX (9 digits)';
    }
  }
};

const validateAll = (): boolean => {
  (Object.keys(formData) as Array<keyof typeof formData>).forEach((field) => {
    touched[field] = true;
    validateField(field);
  });
  return !Object.values(errors).some((err) => !!err);
};

const resetForm = () => {
  formData.name = '';
  formData.dateOfBirth = '';
  formData.email = '';
  formData.phone = '';

  (Object.keys(touched) as Array<keyof typeof touched>).forEach((field) => {
    touched[field] = false;
    errors[field] = '';
  });
};

const handleSubmit = () => {
  if (!validateAll()) return;

  emit('add-participant', {
    name: formData.name.trim(),
    dateOfBirth: formData.dateOfBirth,
    email: formData.email.trim(),
    phone: formData.phone.trim()
  });

  resetForm();
};
</script>

<template>
  <div class="lottery-card" @keydown.enter.prevent="handleSubmit">
    <h5 class="fw-bold mb-1">REGISTER FORM</h5>
    <p class="text-muted small mb-4">Please fill in all the fields.</p>

    <form @submit.prevent="handleSubmit" novalidate>
      <BaseInput
        v-model="formData.name"
        label="Name"
        placeholder="Enter user name"
        :error="errors.name"
        :is-touched="touched.name"
        @blur="touched.name = true; validateField('name')"
      />

      <BaseInput
        v-model="formData.dateOfBirth"
        type="date"
        label="Date of Birth"
        :error="errors.dateOfBirth"
        :is-touched="touched.dateOfBirth"
        @blur="touched.dateOfBirth = true; validateField('dateOfBirth')"
      />

      <BaseInput
        v-model="formData.email"
        type="email"
        label="Email"
        placeholder="Enter email"
        :error="errors.email"
        :is-touched="touched.email"
        @blur="touched.email = true; validateField('email')"
      />

      <BaseInput
        v-model="formData.phone"
        type="tel"
        label="Phone number"
        placeholder="+380XXXXXXXXX"
        :error="errors.phone"
        :is-touched="touched.phone"
        @blur="touched.phone = true; validateField('phone')"
      />

      <div class="d-flex justify-content-end">
        <BaseButton type="submit" variant="primary" class="px-4">
          Save
        </BaseButton>
      </div>
    </form>
  </div>
</template>