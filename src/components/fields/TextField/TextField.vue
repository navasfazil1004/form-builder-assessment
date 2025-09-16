<template>
  <label :for="field.id" class="block mb-3">
    <!-- Label -->
    <div class="flex justify-between mb-1">
      <span class="font-medium text-gray-800">{{ field.label }}</span>
      <small v-if="field.helpText" class="text-gray-500 text-xs">{{ field.helpText }}</small>
    </div>

    <!-- Input Row -->
    <div class="relative flex items-center gap-2">
      <input
        ref="inputRef"
        :id="field.id"
        :type="subTypeComputed"
        :placeholder="placeholder"
        :value="internalValue"
        :disabled="field.disabled"
        @input="onInput($event.target.value)"
        @focus="onFocus"
        @blur="onBlur"
        :class="[
          'w-full mt-2 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          errorMessages.length ? 'border-red-600 ring-1 ring-red-400' : '',
          isFocused ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-300'
        ]"
      />
      <!-- Clear button -->
      <button
        v-if="internalValue && !field.disabled"
        type="button"
        @click="clear"
        class="absolute right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>

    <!-- Meta Row: character count + errors -->
    <div class="flex justify-between mt-1 text-xs">
      <span v-if="characterCount" class="text-gray-500">{{ characterCount }}</span>
      <div v-if="errorMessages.length" class="text-red-600">
        <div v-for="(e, i) in errorMessages" :key="i">{{ e }}</div>
      </div>
    </div>
  </label>
</template>

<script lang="ts" setup>
import { ref, computed, watch, defineExpose } from "vue";
import type { FormField, ValidationRule } from "@/types/form.types";

const props = defineProps<{
  field: FormField;
  modelValue: string | number | null;
  error?: string | string[];
  placeholder?: string;
  subType?: "text" | "email" | "password" | "number" | "tel";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "focus"): void;
  (e: "blur"): void;
}>();

const internalValue = ref(props.modelValue ?? "");
const isFocused = ref(false);

// Focus & Blur
function onFocus() {
  isFocused.value = true;
  emit("focus");
}
function onBlur() {
  isFocused.value = false;
  emit("blur");
}

// Subtype & placeholder
const subTypeComputed = computed(() => props.subType || "text");
const placeholder = computed(() => props.placeholder || "");

// Input Mask
function applyMask(value: string) {
  const mask = props.field.mask;
  if (!mask) return value;
  let masked = "", valIndex = 0;
  for (const m of mask) {
    if (valIndex >= value.length) break;
    if (m === "9" && /\d/.test(value[valIndex])) masked += value[valIndex++];
    else if (m === "A" && /[A-Za-z]/.test(value[valIndex])) masked += value[valIndex++];
    else if (m === "*" && /[A-Za-z0-9]/.test(value[valIndex])) masked += value[valIndex++];
    else { masked += m; if (value[valIndex] === m) valIndex++; }
  }
  return masked;
}

// Watch modelValue
watch(() => props.modelValue, (v) => internalValue.value = v != null ? applyMask(String(v)) : "");

// Handle input
function onInput(val: string) {
  let newVal = applyMask(val);
  const maxLength = props.field.validation?.find((v: ValidationRule) => v.type === "maxLength")?.value;
  if (maxLength) newVal = newVal.slice(0, maxLength);
  internalValue.value = newVal;
  emit("update:modelValue", subTypeComputed.value === "number" ? (newVal ? Number(newVal) : null) : newVal);
}

// Clear input
function clear() {
  internalValue.value = "";
  emit("update:modelValue", subTypeComputed.value === "number" ? null : "");
}

// Character count
const characterCount = computed(() => {
  const max = props.field.validation?.find((v: ValidationRule) => v.type === "maxLength")?.value;
  return max ? `${String(internalValue.value).length}/${max}` : null;
});

// Validation messages
const errorMessages = computed(() => {
  if (props.error) return Array.isArray(props.error) ? props.error : [props.error];
  const errors: string[] = [];
  const val = internalValue.value;
  props.field.validation?.forEach((rule: ValidationRule) => {
    if (rule.type === "required" && (!val || val === "")) errors.push(rule.message || "This field is required.");
    if (rule.type === "minLength" && String(val).length < rule.value) errors.push(rule.message || `Minimum length is ${rule.value}.`);
    if (rule.type === "maxLength" && String(val).length > rule.value) errors.push(rule.message || `Maximum length is ${rule.value}.`);
    if (rule.type === "pattern" && rule.value instanceof RegExp && !rule.value.test(String(val))) errors.push(rule.message || "Invalid format.");
  });
  return errors;
});

const inputRef = ref<HTMLInputElement | null>(null);
defineExpose({ focus: () => { inputRef.value?.focus(); } });
</script>
