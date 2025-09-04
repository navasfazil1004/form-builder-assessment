<template>
  <label :for="field.id" class="selectfield">
    <div class="label-row">
      <span>{{ field.label }}</span>
      <small v-if="field.helpText">{{ field.helpText }}</small>
    </div>

    <div class="select-row">
      <!-- Search input (for searchable dropdown) -->
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

      <!-- Dropdown for searchable mode -->
      <ul v-if="searchable && search" class="dropdown">
        <li
          v-for="(opt, idx) in filteredOptions"
          :key="opt.value"
          :class="{ focused: focusedIndex === idx }"
          @click="selectOption(opt)"
        >
          {{ opt.label }}
        </li>
        <li v-if="filteredOptions.length === 0" class="empty">No options found</li>
      </ul>

      <!-- Native select for non-searchable mode -->
      <select
        v-else
        :id="field.id"
        :multiple="field.multiple"
        :value="internalValue"
        :disabled="field.disabled || loading"
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

    <!-- Loading indicator -->
    <div v-if="loading" class="loading">Loading...</div>
  </label>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import type { FormField, SelectOption } from '@/types/form.types'

const props = defineProps<{
  field: FormField
  modelValue: string | string[] | null
  options?: SelectOption[]
  searchable?: boolean
  asyncLoader?: () => Promise<SelectOption[]>
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

// Filtered options for search
const filteredOptions = computed(() => {
  if (!search.value) return options.value
  return options.value.filter(o =>
    String(o.label).toLowerCase().includes(search.value.toLowerCase())
  )
})

// Grouped options for native select
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

// Native select change handler
function onChange(e: Event) {
  const el = e.target as HTMLSelectElement
  if (props.field.multiple) {
    const vals = Array.from(el.selectedOptions).map(o => o.value)
    emit('update:modelValue', vals)
  } else {
    emit('update:modelValue', el.value)
  }
}

// Select option in custom searchable dropdown
function selectOption(opt: SelectOption) {
  if (props.field.multiple) {
    const current = Array.isArray(internalValue.value) ? [...internalValue.value] : []
    if (!current.includes(opt.value)) current.push(opt.value)
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', opt.value)
  }
  search.value = ''
  focusedIndex.value = null
}

// Async options loader
async function loadOptionsAsync(loader?: () => Promise<SelectOption[]>) {
  if (!loader) return
  loading.value = true
  try {
    options.value = await loader()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.asyncLoader) loadOptionsAsync(props.asyncLoader)
})

// Keyboard navigation
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
  selectOption(selected)
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

.dropdown {
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown li {
  padding: 6px 8px;
  cursor: pointer;
}

.dropdown li.focused {
  background-color: #0077ff33;
}

.dropdown li.empty {
  color: #666;
  cursor: default;
}

.loading {
  font-size: 0.9em;
  color: #666;
}
</style>
