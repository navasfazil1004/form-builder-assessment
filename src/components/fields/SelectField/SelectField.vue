<template>
  <label :for="field.id" class="block mb-3">
    <div class="flex justify-between mb-1">
      <span class="font-medium text-gray-800">{{ field.label }}</span>
      <small v-if="field.helpText" class="text-gray-500 text-xs">{{ field.helpText }}</small>
    </div>

    <div class="flex flex-col gap-2 relative">
      <!-- Multi-select tags -->
      <div v-if="field.multiple && Array.isArray(internalValue) && internalValue.length" class="flex flex-wrap gap-2 mb-1">
        <span v-for="val in internalValue" :key="val" class="bg-indigo-100 text-indigo-700 rounded px-2 py-1 text-sm flex items-center">
          {{ options.find(o => o.value === val)?.label || val }}
          <button type="button" @click="removeTag(val)" class="ml-1 text-indigo-600 hover:text-indigo-800">×</button>
        </span>
      </div>

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
        class="border text-gray-800 border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <!-- Searchable dropdown -->
      <ul v-if="searchable && search" class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-auto shadow-lg text-gray-900">
        <li
          v-for="(opt, idx) in filteredOptions"
          :key="opt.value"
          @click="selectOption(opt)"
          :class="[
            'p-2 cursor-pointer',
            focusedIndex === idx ? 'bg-blue-100' : '',
            field.multiple && Array.isArray(internalValue) && internalValue.includes(opt.value) ? 'font-semibold text-blue-700' : ''
          ]"
        >
          <template v-if="field.multiple">
            <input type="checkbox" :checked="Array.isArray(internalValue) && internalValue.includes(opt.value)" readonly class="mr-2"/>
          </template>
          {{ opt.label }}
        </li>
        <li v-if="filteredOptions.length === 0" class="p-2 text-gray-400 cursor-default">No options found</li>
      </ul>

      <!-- Native select -->
      <select
        v-else
        :id="field.id"
        :multiple="field.multiple"
        :value="internalValue"
        :disabled="field.disabled || loading"
        @change="onChange"
        @focus="$emit('focus')"
        class="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
      >
        <template v-for="group in groupedOptions" :key="group.key">
          <optgroup v-if="group.group" :label="group.group">
            <option v-for="opt in group.options" :key="opt.value" :value="opt.value"  class="text-gray-800">{{ opt.label }}</option>
          </optgroup>
          <template v-else>
            <option v-for="opt in group.options" :key="opt.value" :value="opt.value" class="text-gray-800">{{ opt.label }}</option>
          </template>
        </template>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mt-1 text-gray-500 text-sm">Loading...</div>
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
  return options.value.filter(o => o.label.toLowerCase().includes(search.value.toLowerCase()));
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
    const vals = Array.from(el.selectedOptions).map(o => o.value);
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
    current.includes(opt.value) ? current.splice(current.indexOf(opt.value), 1) : current.push(opt.value);
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
  internalValue.value = current.filter(v => v !== value);
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
  focusedIndex.value = focusedIndex.value === null || focusedIndex.value >= filteredOptions.value.length - 1 ? 0 : focusedIndex.value + 1;
}
function onArrowUp() {
  if (filteredOptions.value.length === 0) return;
  focusedIndex.value = focusedIndex.value === null || focusedIndex.value <= 0 ? filteredOptions.value.length - 1 : focusedIndex.value - 1;
}
function onEnter() {
  if (focusedIndex.value === null) return;
  const selected = filteredOptions.value[focusedIndex.value];
  if (!selected) return;
  selectOption(selected);
}

defineExpose({ loadOptionsAsync });
</script>
