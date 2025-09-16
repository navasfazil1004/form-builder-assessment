<script setup lang="ts">
import FormBuilder from "@/components/FormBuilder/FormBuilder.vue";
import { formSchema } from "@/types/formSchema";
</script>

<template>
  <FormBuilder :schema="formSchema" v-model="formData" @submit="handleSubmit" />
</template>
