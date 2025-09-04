<template>
  <label :for="field.id" class="datefield">
    <span>{{ field.label }}</span>

    <div class="date-inputs">
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
      />

      <!-- Date range -->
      <div v-else class="range-wrapper">
        <input
          type="date"
          v-model="rangeStart"
          :min="minDate"
          :max="rangeEnd || maxDate"
          @input="onRangeInput"
        />
        <span>to</span>
        <input
          type="date"
          v-model="rangeEnd"
          :min="rangeStart || minDate"
          :max="maxDate"
          @input="onRangeInput"
        />
      </div>
    </div>

    <div v-if="errorMessages.length" class="errors">
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

const internalValue = ref<string>(typeof props.modelValue === 'string' ? props.modelValue : '')
const rangeStart = ref<string>('')
const rangeEnd = ref<string>('')

const isRange = computed(() => !!props.field.isRange)
const minDate = computed(() => props.field.minDate || '')
const maxDate = computed(() => props.field.maxDate || '')

// Initialize range if modelValue is object
if (isRange.value && props.modelValue && typeof props.modelValue === 'object') {
  rangeStart.value = props.modelValue.start || ''
  rangeEnd.value = props.modelValue.end || ''
}

// Watch for prop changes
watch(
  () => props.modelValue,
  (v) => {
    if (!isRange.value) internalValue.value = v as string || ''
    else if (v && typeof v === 'object') {
      rangeStart.value = v.start || ''
      rangeEnd.value = v.end || ''
    }
  }
)

const errorMessages = ref<string[]>([])

function onInput(val: string) {
  internalValue.value = val
  errorMessages.value = []
  if (minDate.value && val < minDate.value) errorMessages.value.push('Date is before minimum')
  if (maxDate.value && val > maxDate.value) errorMessages.value.push('Date is after maximum')
  emit('update:modelValue', val)
}

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

<style scoped>
.datefield { display:block; margin-bottom:12px }
.range-wrapper { display:flex; gap:0.5rem; align-items:center }
.errors { color:#d00; font-size:12px; margin-top:4px }
</style>
