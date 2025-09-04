<template>
  <fieldset :aria-labelledby="field.id" class="checkboxgroup">
    <legend>{{ field.label }}</legend>

    <div
      class="controls"
      :class="layoutClass"
    >
      <!-- individual checkboxes -->
      <label
        v-for="opt in field.options || []"
        :key="opt.value"
        class="checkbox-option"
        :title="opt.label"
      >
        <input
          type="checkbox"
          :value="opt.value"
          :checked="internalValue.includes(opt.value)"
          @change="toggle(opt.value, $event.target.checked)"
          :disabled="field.disabled"
          @focus="$emit('focus')"
        />
        <span>{{ opt.label }}</span>
      </label>
    </div>

    <!-- Select All / Clear All -->
    <div class="meta">
      <button
        type="button"
        @click="selectAll"
        :disabled="allSelected || field.disabled"
      >
        Select All
      </button>
      <button
        type="button"
        @click="clearAll"
        :disabled="internalValue.length === 0 || field.disabled"
      >
        Clear
      </button>
    </div>

    <!-- Error / validation messages -->
    <div v-if="errors.length" class="errors">
      <div v-for="(e,i) in errors" :key="i">{{ e }}</div>
    </div>
  </fieldset>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import type { FormField, ValidationRule } from '@/types/form.types'

const props = defineProps<{ field: FormField; modelValue: any[] }>()
const emit = defineEmits(['update:modelValue', 'focus'])

const internalValue = ref<Array<any>>(Array.isArray(props.modelValue) ? props.modelValue : [])
watch(() => props.modelValue, v => internalValue.value = Array.isArray(v) ? v : [])

// Layout: vertical / horizontal / grid
const layoutClass = computed(() => {
  return props.field.layout || 'vertical' // default vertical
})

// Toggle checkbox
function toggle(val: any, checked: boolean) {
  const set = new Set(internalValue.value)
  if (checked) set.add(val)
  else set.delete(val)
  internalValue.value = Array.from(set)
  emit('update:modelValue', internalValue.value)
}

// Select All / Clear All
const allSelected = computed(() => {
  const options = props.field.options || []
  return options.length > 0 && options.every(o => internalValue.value.includes(o.value))
})

function selectAll() {
  internalValue.value = (props.field.options || []).map(o => o.value)
  emit('update:modelValue', internalValue.value)
}

function clearAll() {
  internalValue.value = []
  emit('update:modelValue', [])
}

// Min/max validation
const errors = computed(() => {
  const errs: string[] = []
  const valCount = internalValue.value.length
  props.field.validation?.forEach((rule: ValidationRule) => {
    if (rule.type === 'minLength' && valCount < rule.value) errs.push(rule.message)
    if (rule.type === 'maxLength' && valCount > rule.value) errs.push(rule.message)
    if (rule.type === 'required' && valCount === 0) errs.push(rule.message)
  })
  return errs
})
</script>

<style scoped>
.checkboxgroup {
  margin-bottom: 12px;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.controls.vertical {
  flex-direction: column;
}
.controls.horizontal {
  flex-direction: row;
}
.controls.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.checkbox-option:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.meta {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.errors {
  color: #d00;
  font-size: 12px;
  margin-top: 4px;
}
</style>
