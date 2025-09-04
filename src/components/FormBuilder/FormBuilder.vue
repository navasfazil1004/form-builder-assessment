<template>
  <form @submit.prevent="handleSubmit" class="form-builder">
    <transition-group name="fade" tag="div">
      <component
        v-for="field in visibleFields"
        :key="field.id"
        :is="getComponent(field.type)"
        :id="field.id"
        :field="field"
        :modelValue="formData[field.name]"
        @update:modelValue="(val) => updateValue(field, val)"
        @focus="onFocus(field)"
        :error="errors[field.name]"
        :options="field.options"
        :class="{ 'field-focused': focusedField?.id === field.id }"
      />
    </transition-group>

    <div class="form-actions">
      <button type="submit" :disabled="submitting">Submit</button>
      <button type="button" @click="undo" :disabled="!canUndo">Undo</button>
      <button type="button" @click="redo" :disabled="!canRedo">Redo</button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, watchEffect, toRaw } from 'vue'
import type { FormField, FieldType, ConditionalRule } from '@/types/form.types'
import TextField from '@/components/fields/TextField/TextField.vue'
import SelectField from '@/components/fields/SelectField/SelectField.vue'
import CheckboxGroup from '@/components/fields/CheckboxGroup/CheckboxGroup.vue'
import DateField from '@/components/fields/DateField/DateField.vue'
import { useFormValidation } from '@/composables/useFormValidation'

/** Props & Emits */
const props = defineProps<{ schema: FormField[], initialValues?: Record<string, any> }>()
const emits = defineEmits<{
  (e: 'submit', payload: { valid: boolean; data: Record<string, any> }): void
  (e: 'change', payload: { name: string; value: any; data: Record<string, any> }): void
  (e: 'dirty', isDirty: boolean): void
  (e: 'fieldFocus', payload: { field: FormField; data: Record<string, any> }): void
}>()

/** Reactive State */
const fieldsRef = ref<FormField[]>([...(props.schema ?? [])])
const formData = reactive<Record<string, any>>({ ...(props.initialValues ?? {}) })
const submitting = ref(false)
const focusedField = ref<FormField | null>(null)
const isDirty = ref(false)

/** Undo/Redo */
const undoStack: Record<string, any>[] = []
const redoStack: Record<string, any>[] = []
const canUndo = computed(() => undoStack.length > 0)
const canRedo = computed(() => redoStack.length > 0)
function pushUndoSnapshot() {
  undoStack.push(JSON.parse(JSON.stringify(toRaw(formData))))
  if (undoStack.length > 50) undoStack.shift()
  redoStack.length = 0
}
function undo() {
  if (!canUndo.value) return
  redoStack.push(JSON.parse(JSON.stringify(toRaw(formData))))
  const snap = undoStack.pop()!
  Object.keys(formData).forEach(k => delete formData[k])
  Object.assign(formData, snap)
}
function redo() {
  if (!canRedo.value) return
  undoStack.push(JSON.parse(JSON.stringify(toRaw(formData))))
  const snap = redoStack.pop()!
  Object.keys(formData).forEach(k => delete formData[k])
  Object.assign(formData, snap)
}

/** Validation */
let validation = useFormValidation([...fieldsRef.value], formData)
watchEffect(() => { validation = useFormValidation([...fieldsRef.value], formData) })
const { validateAll, validateField, errors } = validation

/** Watch formData for dirty state */
watch(formData, () => {
  if (!isDirty.value) { isDirty.value = true; emits('dirty', true) }
}, { deep: true })

/** Dynamic Field Value Updates */
function updateValue(field: FormField, value: any) {
  const prev = formData[field.name]
  const changed = prev !== value && JSON.stringify(prev) !== JSON.stringify(value)
  if (changed) {
    pushUndoSnapshot()
    formData[field.name] = value
    try { validateField(field) } catch {}
    emits('change', { name: field.name, value, data: toRaw(formData) })
  }
}

/** Focus Handling */
function onFocus(field: FormField) {
  focusedField.value = field
  const el = document.getElementById(field.id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  emits('fieldFocus', { field, data: toRaw(formData) })
}

/** Component Mapping */
const getComponent = (type: FieldType | string) => {
  switch (type) {
    case 'text': return TextField
    case 'select': return SelectField
    case 'checkbox-group': return CheckboxGroup
    case 'date': return DateField
    default: return TextField
  }
}

/** Conditional Display – Supports Nested AND/OR Logic */
function evalConditional(rule: ConditionalRule | any): boolean {
  if (!rule) return true
  if (Array.isArray(rule)) {
    let result = true
    let op: 'AND' | 'OR' = 'AND'
    for (const part of rule) {
      if (part?.op) { op = part.op; continue }
      const r = evalConditional(part)
      result = op === 'AND' ? result && r : result || r
    }
    return result
  }
  if (rule.op && rule.rules) {
    return rule.rules.reduce((acc, r, idx) => {
      const val = evalConditional(r)
      if (idx === 0) return val
      return rule.op === 'AND' ? acc && val : acc || val
    }, true)
  }
  const left = formData[rule.field]
  switch (rule.operator) {
    case 'equals': return left === rule.value
    case 'notEquals': return left !== rule.value
    case 'contains': return Array.isArray(left) && left.includes(rule.value)
    case 'greaterThan': return left > rule.value
    case 'lessThan': return left < rule.value
    default: return true
  }
}

/** Computed: Visible Fields */
const visibleFields = computed(() => fieldsRef.value.filter(f => evalConditional(f.conditionalDisplay)))

/** Add/Remove Fields Dynamically */
function addField(f: FormField) { fieldsRef.value.push(f) }
function removeFieldById(id: string) {
  const idx = fieldsRef.value.findIndex(f => f.id === id)
  if (idx >= 0) fieldsRef.value.splice(idx, 1)
}

/** Submit Handler */
async function handleSubmit() {
  submitting.value = true
  try {
    const valid = await validateAll()
    if (!valid) {
      const firstError = fieldsRef.value.find(f => errors[f.name])
      if (firstError) document.getElementById(firstError.id)?.focus()
    }
    emits('submit', { valid, data: JSON.parse(JSON.stringify(toRaw(formData))) })
  } finally { submitting.value = false }
}

/** Expose API */
defineExpose({ addField, removeFieldById, formData, undo, redo, canUndo, canRedo })
</script>

<style scoped>
.form-builder { display: flex; flex-direction: column; gap: 12px }
.form-actions { display: flex; gap: 0.5rem }
.field-focused { outline: 2px solid #4f46e5; transition: outline 0.2s }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
