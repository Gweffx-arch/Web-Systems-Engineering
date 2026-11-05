<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Participant, SortField, SortOrder } from './types/participant';
import WinnersBlock from './components/lottery/WinnersBlock.vue';
import RegisterForm from './components/participants/RegisterForm.vue';
import SearchBar from './components/participants/SearchBar.vue';
import ParticipantsTable from './components/participants/ParticipantsTable.vue';

const STORAGE_KEY = 'vue_lottery_participants_data';
const WINNERS_STORAGE_KEY = 'vue_lottery_winners_data';

const participants = ref<Participant[]>([]);
const winners = ref<Participant[]>([]);

const searchQuery = ref('');
const sortField = ref<SortField>('name');
const sortOrder = ref<SortOrder>('asc');

// Відновлення даних при старті застосунку
onMounted(() => {
  const savedParticipants = localStorage.getItem(STORAGE_KEY);
  if (savedParticipants) {
    try {
      participants.value = JSON.parse(savedParticipants);
    } catch (e) {
      console.error('Failed to parse participants from storage', e);
    }
  }

  const savedWinners = localStorage.getItem(WINNERS_STORAGE_KEY);
  if (savedWinners) {
    try {
      winners.value = JSON.parse(savedWinners);
    } catch (e) {
      console.error('Failed to parse winners from storage', e);
    }
  }
});

// Watcher з опцією deep для синхронізації з localStorage
watch(
  participants,
  (newVal) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

watch(
  winners,
  (newVal) => {
    localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true }
);

// Список існуючих email (lowercase) для валідації унікальності
const existingEmails = computed(() =>
  participants.value.map((p) => p.email.toLowerCase())
);

// Учасники, які ще не стали переможцями
const eligibleParticipants = computed(() =>
  participants.value.filter((p) => !winners.value.some((w) => w.id === p.id))
);

// Кнопка New winner активна, коли переможців < 3 і є доступні учасники
const canDrawWinner = computed(() =>
  winners.value.length < 3 && eligibleParticipants.value.length > 0
);

// Випадковий вибір переможця
const drawWinner = () => {
  if (!canDrawWinner.value) return;
  const pool = eligibleParticipants.value;
  const randomIndex = Math.floor(Math.random() * pool.length);
  winners.value.push(pool[randomIndex]);
};

const removeWinner = (id: string) => {
  winners.value = winners.value.filter((w) => w.id !== id);
};

// Додавання нового учасника
const addParticipant = (data: Omit<Participant, 'id'>) => {
  const newParticipant: Participant = {
    ...data,
    id: Date.now().toString()
  };
  participants.value.push(newParticipant);
};

// Оновлення даних учасника
const updateParticipant = (updated: Participant) => {
  const index = participants.value.findIndex((p) => p.id === updated.id);
  if (index !== -1) {
    participants.value[index] = updated;
    // Оновлюємо ім'я і в списку переможців, якщо учасник там є
    const wIndex = winners.value.findIndex((w) => w.id === updated.id);
    if (wIndex !== -1) {
      winners.value[wIndex] = updated;
    }
  }
};

// Видалення учасника (видаляється і з переможців)
const deleteParticipant = (id: string) => {
  participants.value = participants.value.filter((p) => p.id !== id);
  winners.value = winners.value.filter((w) => w.id !== id);
};

// Перемикання сортування
const handleSort = (field: SortField) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

// Спочатку фільтрація, потім сортування (computed)
const filteredAndSortedParticipants = computed(() => {
  let result = [...participants.value];

  // 1. Фільтрація за іменем
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  // 2. Сортування
  result.sort((a, b) => {
    const fieldA = a[sortField.value];
    const fieldB = b[sortField.value];

    const comparison = fieldA.localeCompare(fieldB);
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });

  return result;
});
</script>

<template>
  <div class="container py-4" style="max-width: 900px;">
    <!-- 1. Блок переможців -->
    <WinnersBlock
      :winners="winners"
      :can-draw-winner="canDrawWinner"
      @draw="drawWinner"
      @remove-winner="removeWinner"
    />

    <!-- 2. Блок реєстрації -->
    <RegisterForm
      :existing-emails="existingEmails"
      @add-participant="addParticipant"
    />

    <!-- 3. Пошук та таблиця учасників -->
    <SearchBar @filter-by-name="searchQuery = $event" />

    <ParticipantsTable
      :participants="filteredAndSortedParticipants"
      :all-participants="participants"
      :sort-field="sortField"
      :sort-order="sortOrder"
      @sort="handleSort"
      @update-participant="updateParticipant"
      @delete-participant="deleteParticipant"
    />
  </div>
</template>