<template>
  <label :for="field.id" class="selectfield">
    <div class="label-row">
      <span>{{ field.label }}</span>
      <small v-if="field.helpText">{{ field.helpText }}</small>
    </div>

    <div class="select-row">
      <!-- Show selected tags for multi-select -->
      <div v-if="field.multiple && Array.isArray(internalValue) && internalValue.length" class="selected-tags">
        <span v-for="val in internalValue" :key="val" class="selected-tag">
          {{ options.find(o => o.value === val)?.label || val }}
          <button type="button" @click="removeTag(val)">×</button>
        </span>
      </div>

      <!-- Search input for searchable dropdown -->
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

      <!-- Custom dropdown for searchable -->
      <ul v-if="searchable && search" class="dropdown">
        <li
          v-for="(opt, idx) in filteredOptions"
          :key="opt.value"
          :class="{
            focused: focusedIndex === idx,
            selected: field.multiple && Array.isArray(internalValue) && internalValue.includes(opt.value)
          }"
          @click="selectOption(opt)"
        >
          <template v-if="field.multiple">
            <input
              type="checkbox"
              :checked="Array.isArray(internalValue) && internalValue.includes(opt.value)"
              readonly
            />
          </template>
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
            <option v-for="opt in group.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </optgroup>
          <template v-else>
            <option v-for="opt in group.options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </template>
        </template>
      </select>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">Loading...</div>
  </label>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import type { FormField, SelectOption } from "@/types/form.types";

const props = defineProps<{
  field: FormField;
  modelValue: string | string[] | null;
  options?: SelectOption[];
  searchable?: boolean;
  asyncLoader?: () => Promise<SelectOption[]>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | string[] | null): void;
  (e: "focus"): void;
}>();

const internalValue = ref(props.modelValue ?? (props.field.multiple ? [] : ""));
const options = ref<SelectOption[]>(props.options ?? []);
const search = ref("");
const loading = ref(false);
const focusedIndex = ref<number | null>(null);

watch(() => props.modelValue, (v) => {
  internalValue.value = props.field.multiple ? (Array.isArray(v) ? [...v] : []) : v ?? "";
}, { immediate: true });

const searchable = computed(() => props.searchable ?? false);

const filteredOptions = computed(() => {
  if (!search.value) return options.value;
  return options.value.filter((o) => o.label.toLowerCase().includes(search.value.toLowerCase()));
});

const groupedOptions = computed(() => {
  const groups: Record<string, SelectOption[]> = {};
  const ungrouped: { key: string; options: SelectOption[] }[] = [];

  for (const o of filteredOptions.value) {
    if (o.group) {
      groups[o.group] = groups[o.group] ?? [];
      groups[o.group].push(o);
    } else {
      ungrouped.push({ key: `ungroup-${o.value}`, options: [o] });
    }
  }

  const out: { key: string; group?: string; options: SelectOption[] }[] = [];
  for (const g of Object.keys(groups)) out.push({ key: `group-${g}`, group: g, options: groups[g] });

  return [...out, ...ungrouped];
});

function onChange(e: Event) {
  const el = e.target as HTMLSelectElement;
  if (props.field.multiple) {
    const vals = Array.from(el.selectedOptions).map((o) => o.value);
    internalValue.value = vals;
    emit("update:modelValue", vals);
  } else {
    internalValue.value = el.value;
    emit("update:modelValue", el.value);
  }
}

function selectOption(opt: SelectOption) {
  if (props.field.multiple) {
    let current = Array.isArray(internalValue.value) ? [...internalValue.value] : [];
    if (current.includes(opt.value)) {
      current = current.filter((v) => v !== opt.value);
    } else {
      current.push(opt.value);
    }
    internalValue.value = current;
    emit("update:modelValue", current);
  } else {
    internalValue.value = opt.value;
    emit("update:modelValue", opt.value);
  }
  search.value = "";
  focusedIndex.value = null;
}

function removeTag(value: string) {
  if (!props.field.multiple) return;
  const current = Array.isArray(internalValue.value) ? [...internalValue.value] : [];
  internalValue.value = current.filter((v) => v !== value);
  emit("update:modelValue", internalValue.value);
}

async function loadOptionsAsync(loader?: () => Promise<SelectOption[]>) {
  if (!loader) return;
  loading.value = true;
  try {
    options.value = await loader();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.asyncLoader) loadOptionsAsync(props.asyncLoader);
});

// Keyboard navigation
function onArrowDown() {
  if (filteredOptions.value.length === 0) return;
  focusedIndex.value = focusedIndex.value === null || focusedIndex.value >= filteredOptions.value.length - 1
    ? 0
    : focusedIndex.value + 1;
}
function onArrowUp() {
  if (filteredOptions.value.length === 0) return;
  focusedIndex.value = focusedIndex.value === null || focusedIndex.value <= 0
    ? filteredOptions.value.length - 1
    : focusedIndex.value - 1;
}
function onEnter() {
  if (focusedIndex.value === null) return;
  const selected = filteredOptions.value[focusedIndex.value];
  if (!selected) return;
  selectOption(selected);
}

defineExpose({ loadOptionsAsync });
</script>

<style scoped>
.selectfield { display: block; margin-bottom: 12px; }
.label-row { margin-bottom: 4px; }
.select-row { display: flex; flex-direction: column; gap: 4px; }
select, input[type="search"] { padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; outline: none; }

.dropdown { border: 1px solid #ccc; border-radius: 4px; max-height: 150px; overflow-y: auto; list-style: none; padding: 0; margin: 0; }
.dropdown li { padding: 6px 8px; cursor: pointer; }
.dropdown li.focused { background-color: #0077ff33; }
.dropdown li.selected { font-weight: bold; }
.dropdown li.empty { color: #666; cursor: default; }

.loading { font-size: 0.9em; color: #666; }
.selected-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 2px; }
.selected-tag { background: #e0e7ff; color: #1e293b; border-radius: 3px; padding: 2px 6px; font-size: 0.9em; display: flex; align-items: center; }
.selected-tag button { margin-left: 4px; background: transparent; border: none; cursor: pointer; font-size: 0.9em; line-height: 1; }
</style>
