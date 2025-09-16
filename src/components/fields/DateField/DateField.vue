<template>
  <label :for="field.id" class="block mb-4 text-gray-800">
    <span class="font-medium">{{ field.label }}</span>

    <div class="mt-2 flex flex-col gap-2">
      <!-- Single date -->
      <input
        v-if="!isRange"
        :id="field.id"
        type="date"
        :value="internalValue"
        :min="minDate"
        :max="maxDate"
        :disabled="field.disabled"
        @input="onInput($event.target.value)"
        @focus="$emit('focus')"
        class="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
      />

      <!-- Date range -->
      <div v-else class="flex gap-2 items-center">
        <input
          type="date"
          v-model="rangeStart"
          :min="minDate"
          :max="rangeEnd || maxDate"
          @input="onRangeInput"
          class="flex-1 p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
        />
        <span class="text-gray-500">to</span>
        <input
          type="date"
          v-model="rangeEnd"
          :min="rangeStart || minDate"
          :max="maxDate"
          @input="onRangeInput"
          class="flex-1 p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
        />
      </div>
    </div>

    <!-- Error messages -->
    <div v-if="errorMessages.length" class="mt-1 text-red-600 text-sm">
      <div v-for="(err, i) in errorMessages" :key="i">{{ err }}</div>
    </div>
  </label>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import type { FormField } from '@/types/form.types'

const props = defineProps<{
  field: FormField
  modelValue: string | { start: string, end: string } | null
  error?: string | string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'focus'): void
}>()

const isRange = computed(() => !!props.field.isRange)
const minDate = computed(() => props.field.minDate || '')
const maxDate = computed(() => props.field.maxDate || '')

const internalValue = ref<string>(typeof props.modelValue === 'string' ? props.modelValue : '')
const rangeStart = ref<string>('')
const rangeEnd = ref<string>('')

// Initialize range values
if (isRange.value && props.modelValue && typeof props.modelValue === 'object') {
  rangeStart.value = props.modelValue.start || ''
  rangeEnd.value = props.modelValue.end || ''
}

// Watch for prop changes
watch(() => props.modelValue, (v) => {
  if (!isRange.value) internalValue.value = v as string || ''
  else if (v && typeof v === 'object') {
    rangeStart.value = v.start || ''
    rangeEnd.value = v.end || ''
  }
})

const errorMessages = ref<string[]>([])

// Single date input
function onInput(val: string) {
  internalValue.value = val
  errorMessages.value = []
  if (minDate.value && val && val < minDate.value) errorMessages.value.push('Date is before minimum')
  if (maxDate.value && val && val > maxDate.value) errorMessages.value.push('Date is after maximum')
  emit('update:modelValue', val)
}

// Date range input
function onRangeInput() {
  errorMessages.value = []

  if (rangeStart.value && rangeEnd.value && rangeStart.value > rangeEnd.value) {
    errorMessages.value.push('Start date must be before end date')
  }

  if (minDate.value) {
    if (rangeStart.value && rangeStart.value < minDate.value) errorMessages.value.push('Start date before minimum')
    if (rangeEnd.value && rangeEnd.value < minDate.value) errorMessages.value.push('End date before minimum')
  }

  if (maxDate.value) {
    if (rangeStart.value && rangeStart.value > maxDate.value) errorMessages.value.push('Start date after maximum')
    if (rangeEnd.value && rangeEnd.value > maxDate.value) errorMessages.value.push('End date after maximum')
  }

  emit('update:modelValue', { start: rangeStart.value, end: rangeEnd.value })
}
</script>
