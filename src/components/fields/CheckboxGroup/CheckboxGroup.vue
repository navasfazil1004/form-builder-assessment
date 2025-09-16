<template>
  <fieldset :aria-labelledby="field.id" class="mb-4 border rounded-lg p-4">
    <legend class="font-medium text-gray-800 mb-2">{{ field.label }}</legend>

    <!-- Search input -->
    <input
      v-if="searchable"
      type="search"
      v-model="search"
      placeholder="Search..."
      @focus="$emit('focus')"
      class="w-full mb-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
    />

    <!-- Checkboxes -->
    <div :class="['flex flex-wrap gap-3 mt-2', layoutClassTailwind]">
      <label
        v-for="opt in filteredOptions"
        :key="opt.value"
        class="flex items-center gap-2 p-2 rounded-md cursor-pointer transition hover:bg-blue-50"
        :title="opt.label"
      >
        <input
          type="checkbox"
          :value="opt.value"
          :checked="internalValue.includes(opt.value)"
          @change="toggle(opt.value, $event.target.checked)"
          :disabled="field.disabled"
          class="w-5 h-5 cursor-pointer"
          @focus="$emit('focus')"
        />
        <span class="text-gray-700">{{ opt.label }}</span>
      </label>

      <div v-if="filteredOptions.length === 0" class="text-gray-500 text-sm mt-1">
        No options found
      </div>
    </div>

    <!-- Select All / Clear All -->
    <div class="flex gap-4 items-center mt-3">
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate.prop="partialSelected"
          @change="toggleAll($event.target.checked)"
          :disabled="field.disabled || !options.length"
          class="w-4 h-4 cursor-pointer"
        />
        <span class="text-gray-700 text-sm">Select All</span>
      </label>
      <button
        type="button"
        @click="clearAll"
        :disabled="internalValue.length === 0 || field.disabled"
        class="px-2 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
      >
        Clear
      </button>
    </div>

    <!-- Validation errors -->
    <div v-if="errors.length" class="mt-2 text-red-600 text-sm">
      <div v-for="(e, i) in errors" :key="i">{{ e }}</div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="mt-2 text-gray-500 text-sm">Loading...</div>
  </fieldset>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import type { FormField, ValidationRule } from "@/types/form.types";

const props = defineProps<{
  field: FormField;
  modelValue: any[];
  options?: Array<{ label: string; value: any } | string>;
  searchable?: boolean;
  asyncLoader?: () => Promise<Array<{ label: string; value: any }>>;
}>();

const emit = defineEmits(["update:modelValue", "focus"]);

const internalValue = ref(Array.isArray(props.modelValue) ? [...props.modelValue] : []);
watch(() => props.modelValue, v => internalValue.value = Array.isArray(v) ? [...v] : [], { immediate: true });

const options = ref<Array<{ label: string; value: any }>>(
  (props.options ?? props.field.options ?? []).map(o => typeof o === "string" ? { label: o, value: o } : o)
);

watch(() => props.options, (newOpts) => {
  if (newOpts) options.value = newOpts.map(o => typeof o === "string" ? { label: o, value: o } : o);
});

const search = ref("");
const loading = ref(false);
const searchable = computed(() => props.searchable ?? false);

const filteredOptions = computed(() => {
  if (!search.value) return options.value;
  return options.value.filter(o => o.label.toLowerCase().includes(search.value.toLowerCase()));
});

const layoutClassTailwind = computed(() => {
  switch (props.field.layout) {
    case "horizontal": return "flex-row";
    case "grid": return "grid grid-cols-2 sm:grid-cols-3 gap-3";
    default: return "flex-col";
  }
});

// Toggle individual checkbox
function toggle(val: any, checked: boolean) {
  const set = new Set(internalValue.value);
  if (checked) set.add(val);
  else set.delete(val);
  internalValue.value = Array.from(set);
  emit("update:modelValue", internalValue.value);
}

// Select All / Partial state
const allSelected = computed(() => options.value.length > 0 && options.value.every(o => internalValue.value.includes(o.value)));
const partialSelected = computed(() => options.value.length > 0 && internalValue.value.length > 0 && !allSelected.value);

// Toggle all
function toggleAll(checked: boolean) {
  internalValue.value = checked ? options.value.map(o => o.value) : [];
  emit("update:modelValue", internalValue.value);
}

// Clear all
function clearAll() {
  internalValue.value = [];
  emit("update:modelValue", []);
}

// Validation
const errors = computed(() => {
  const errs: string[] = [];
  const valCount = internalValue.value.length;
  props.field.validation?.forEach((rule: ValidationRule) => {
    if (rule.type === "minLength" && valCount < rule.value) errs.push(rule.message);
    if (rule.type === "maxLength" && valCount > rule.value) errs.push(rule.message);
    if (rule.type === "required" && valCount === 0) errs.push(rule.message);
    if (rule.type === "minSelection" && valCount < rule.value) errs.push(rule.message);
    if (rule.type === "maxSelection" && valCount > rule.value) errs.push(rule.message);
  });
  return errs;
});

// Async loader
async function loadOptionsAsync(loader?: () => Promise<Array<{ label: string; value: any }>>) {
  if (!loader) return;
  loading.value = true;
  try { options.value = await loader(); } 
  finally { loading.value = false; }
}

onMounted(() => { if (props.asyncLoader) loadOptionsAsync(props.asyncLoader); });

defineExpose({ loadOptionsAsync });
</script>
