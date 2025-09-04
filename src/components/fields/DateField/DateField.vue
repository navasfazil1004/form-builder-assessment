<template>
  <label :for="field.id" class="datefield">
    <span>{{ field.label }}</span>
    <input
      :id="field.id"
      type="date"
      :value="internalValue"
      @input="onInput($event.target.value)"
      :min="minDate"
      :max="maxDate"
      :required="field.required"
      @focus="$emit('focus')"
    />
    <div v-if="errorMessages.length" class="errors">
      <div v-for="(e,i) in errorMessages" :key="i">{{ e }}</div>
    </div>
  </label>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import type { FormField, ValidationRule } from '@/types/form.types'

const props = defineProps<{ field: FormField; modelValue: string | null }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
  (e: 'focus'): void
}>()

const internalValue = ref(props.modelValue ?? '')
watch(() => props.modelValue, v => (internalValue.value = v ?? ''))

// Simple min/max date from validation rules
const minDate = computed(() => props.field.validation?.find(r => r.type === 'minDate')?.value ?? undefined)
const maxDate = computed(() => props.field.validation?.find(r => r.type === 'maxDate')?.value ?? undefined)

function onInput(val: string) {
  internalValue.value = val
  emit('update:modelValue', val)
}

// Simple error messages
const errorMessages = computed(() => {
  const errs: string[] = []
  if (props.field.required && !internalValue.value) errs.push('This field is required.')
  if (minDate.value && internalValue.value < minDate.value) errs.push(`Date must be on or after ${minDate.value}`)
  if (maxDate.value && internalValue.value > maxDate.value) errs.push(`Date must be on or before ${maxDate.value}`)
  return errs
})
</script>

<style scoped>
.datefield {
  display: block;
  margin-bottom: 12px;
}
input[type="date"] {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}
.errors {
  color: #d00;
  font-size: 12px;
  margin-top: 4px;
}
</style>
