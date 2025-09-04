<script setup lang="ts">
import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import { formSchema } from '@/types/formSchema'
import { ref } from 'vue'

// Reactive form state
const formData = ref<Record<string, any>>({})

// Handle submit from FormBuilder
function handleSubmit(data: Record<string, any>) {
  console.log('✅ Form Submitted:', data)
  alert('Form submitted! Check console for data.')
}
</script>

<template>
  <main class="p-6">
    <h1 class="text-2xl font-bold mb-6">Dynamic Form Builder Demo</h1>

    <!-- Pass schema + v-model to FormBuilder -->
    <FormBuilder
      :schema="formSchema"
      v-model="formData"
      @submit="handleSubmit"
    />

  </main>
</template>

<style scoped>
main {
  max-width: 640px;
  margin: auto;
  font-family: sans-serif;
}
</style>
