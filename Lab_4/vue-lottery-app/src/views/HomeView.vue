<template>
  <div class="lottery-card">
    <h2 class="fw-bold mb-3">Про проєкт vue-lottery-app</h2>
    <p class="text-muted">
      Вебзастосунок для проведення розіграшів та керування базою учасників із використанням зовнішнього REST API DummyJSON.
    </p>
    <h5 class="fw-bold mt-4 mb-3">Використані технології:</h5>
    <ul>
      <li>Vue 3 (Composition API, <code>&lt;script setup&gt;</code>) + TypeScript</li>
      <li>Vue Router 4 (динамічні та вкладені маршрути, Navigation Guards, Layouts)</li>
      <li>Pinia (керування станом авторизації та списком користувачів)</li>
      <li>Repository Pattern + Fetch HTTP-клієнт із JWT Refresh Interceptor</li>
      <li>VeeValidate + Zod для декларативної валідації форм</li>
      <li>Bootstrap 5 + SCSS</li>
    </ul>
    <a href="https://github.com/Gweffx-arch/Web-Systems-Engineering" target="_blank" class="btn btn-dark mt-3">
      Репозиторій проєкту на GitHub
    </a>
  </div>
</template>
