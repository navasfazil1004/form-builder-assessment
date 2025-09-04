<template>
  <label :for="field.id" class="selectfield">
    <div class="label-row">
      <span>{{ field.label }}</span>
      <small v-if="field.helpText">{{ field.helpText }}</small>
    </div>

    <div class="select-row">
      <!-- Searchable input -->
      <input
        v-if="searchable"
        type="search"
        v-model="search"
        placeholder="Search..."
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.prevent="onEnter"
        @focus="$emit('focus')"
      />

      <select
        :id="field.id"
        :multiple="field.multiple"
        :value="internalValue"
        :disabled="field.disabled"
        @change="onChange"
        @focus="$emit('focus')"
      >
        <template v-for="group in groupedOptions" :key="group.key">
          <optgroup v-if="group.group" :label="group.group">
            <option
              v-for="opt in group.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </optgroup>

          <template v-else>
            <option
              v-for="opt in group.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </template>
        </template>
      </select>
    </div>

    <!-- Loading & empty states -->
    <div v-if="loading">Loading...</div>
    <div v-else-if="filteredOptions.length === 0">No options</div>
  </label>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { FormField, SelectOption } from '@/types/form.types'

const props = defineProps<{
  field: FormField
  modelValue: string | string[] | null
  options?: SelectOption[]
  searchable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[] | null): void
  (e: 'focus'): void
}>()

// Internal state
const internalValue = ref(props.modelValue ?? (props.field.multiple ? [] : ''))
const options = ref<SelectOption[]>(props.options ?? [])
const search = ref('')
const loading = ref(false)
const focusedIndex = ref<number | null>(null)

// Sync v-model
watch(
  () => props.modelValue,
  v => (internalValue.value = v ?? (props.field.multiple ? [] : ''))
)

// Filtered options based on search
const filteredOptions = computed(() => {
  if (!search.value) return options.value
  return options.value.filter(o =>
    String(o.label).toLowerCase().includes(search.value.toLowerCase())
  )
})

// Grouped options for rendering
const groupedOptions = computed(() => {
  const groups: Record<string, SelectOption[]> = {}
  const ungrouped: { key: string; options: SelectOption[] }[] = []

  for (const o of filteredOptions.value) {
    if (o.group) {
      groups[o.group] = groups[o.group] ?? []
      groups[o.group].push(o)
    } else {
      ungrouped.push({ key: `ungroup-${o.value}`, options: [o] })
    }
  }

  const out: { key: string; group?: string; options: SelectOption[] }[] = []
  for (const g of Object.keys(groups)) {
    out.push({ key: `group-${g}`, group: g, options: groups[g] })
  }

  return [...out, ...ungrouped]
})

// Handle change
function onChange(e: Event) {
  const el = e.target as HTMLSelectElement
  if (props.field.multiple) {
    const vals = Array.from(el.selectedOptions).map(o => o.value)
    emit('update:modelValue', vals)
  } else {
    emit('update:modelValue', el.value)
  }
}

// Async option loader
async function loadOptionsAsync(loader?: () => Promise<SelectOption[]>) {
  if (!loader) return
  loading.value = true
  try {
    options.value = await loader()
  } finally {
    loading.value = false
  }
}

// Keyboard navigation for search
function onArrowDown() {
  if (filteredOptions.value.length === 0) return
  focusedIndex.value =
    focusedIndex.value === null || focusedIndex.value >= filteredOptions.value.length - 1
      ? 0
      : focusedIndex.value + 1
}

function onArrowUp() {
  if (filteredOptions.value.length === 0) return
  focusedIndex.value =
    focusedIndex.value === null || focusedIndex.value <= 0
      ? filteredOptions.value.length - 1
      : focusedIndex.value - 1
}

function onEnter() {
  if (focusedIndex.value === null) return
  const selected = filteredOptions.value[focusedIndex.value]
  if (!selected) return
  if (props.field.multiple) {
    const current = Array.isArray(internalValue.value) ? internalValue.value : []
    if (!current.includes(selected.value)) current.push(selected.value)
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', selected.value)
  }
  search.value = ''
  focusedIndex.value = null
}

defineExpose({ loadOptionsAsync })
</script>

<style scoped>
.selectfield {
  display: block;
  margin-bottom: 12px;
}
.label-row {
  margin-bottom: 4px;
}
.select-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
select,
input[type='search'] {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}
</style>
