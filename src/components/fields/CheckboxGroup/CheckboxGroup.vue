<template>
  <fieldset :aria-labelledby="field.id" class="checkboxgroup">
    <legend>{{ field.label }}</legend>

    <!-- Search input -->
    <input
      v-if="searchable"
      type="search"
      v-model="search"
      placeholder="Search..."
      @focus="$emit('focus')"
    />

    <!-- Checkboxes -->
    <div :class="['controls', layoutClass]">
      <label
        v-for="opt in filteredOptions"
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
      <div v-if="filteredOptions.length === 0" class="empty">No options found</div>
    </div>

    <!-- Select All / Clear All -->
    <div class="meta">
      <label class="select-all">
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate="partialSelected"
          @change="toggleAll($event.target.checked)"
          :disabled="field.disabled || !options.length"
        />
        Select All
      </label>
      <button type="button" @click="clearAll" :disabled="internalValue.length === 0 || field.disabled">
        Clear
      </button>
    </div>

    <!-- Validation errors -->
    <div v-if="errors.length" class="errors">
      <div v-for="(e, i) in errors" :key="i">{{ e }}</div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">Loading...</div>
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

const layoutClass = computed(() => props.field.layout || "vertical");

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

    // Add these for checkbox group
    if (rule.type === "minSelection" && valCount < rule.value) errs.push(rule.message);
    if (rule.type === "maxSelection" && valCount > rule.value) errs.push(rule.message);
  });
  return errs;
});


// Async loader
async function loadOptionsAsync(loader?: () => Promise<Array<{ label: string; value: any }>>) {
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

defineExpose({ loadOptionsAsync });
</script>

<style scoped>
.checkboxgroup { margin-bottom: 12px; border: 1px solid #ccc; padding: 8px; border-radius: 6px; }
.controls { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.controls.vertical { flex-direction: column; }
.controls.horizontal { flex-direction: row; }
.controls.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
.checkbox-option { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 4px; cursor: pointer; transition: background 0.2s; user-select: none; }
.checkbox-option:hover { background-color: rgba(0,0,0,0.05); }
.meta { margin-top: 10px; display: flex; gap: 12px; align-items: center; }
.select-all { display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; }
.errors { color: #d00; font-size: 12px; margin-top: 6px; }
.empty { font-size: 12px; color: #666; margin-top: 4px; }
.loading { font-size: 12px; color: #666; margin-top: 4px; }
input[type='search'] { margin-bottom: 6px; padding: 6px; border: 1px solid #ccc; border-radius: 4px; outline: none; }
</style>
