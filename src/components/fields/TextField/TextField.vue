<template>
  <label :for="field.id" class="textfield">
    <div class="label-row">
      <span>{{ field.label }}</span>
      <small v-if="field.helpText">{{ field.helpText }}</small>
    </div>

    <div class="input-row">
      <input
        :id="field.id"
        :type="subTypeComputed"
        :placeholder="placeholder"
        :value="internalValue"
        :disabled="field.disabled"
        @input="onInput($event.target.value)"
        @focus="onFocus"
        @blur="onBlur"
        :class="{ 'error-field': errorMessages.length, 'focused-field': isFocused }"
      />
      <button
        v-if="internalValue && !field.disabled"
        type="button"
        @click="clear"
        class="clear-btn"
      >
        ✕
      </button>
    </div>

    <div class="meta-row">
      <small v-if="characterCount">{{ characterCount }}</small>
      <div v-if="errorMessages.length" class="errors">
        <div v-for="(e, i) in errorMessages" :key="i">{{ e }}</div>
      </div>
    </div>
  </label>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
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
function onFocus() { isFocused.value = true; emit("focus"); }
function onBlur() { isFocused.value = false; emit("blur"); }

// Subtype mapping
const subTypeComputed = computed(() => props.subType || "text");

// Placeholder
const placeholder = computed(() => props.placeholder || "");

// Input Masking
function applyMask(value: string) {
  const mask = props.field.mask;
  if (!mask) return value;

  let masked = "";
  let valIndex = 0;

  for (const m of mask) {
    if (valIndex >= value.length) break;

    if (m === "9") {
      // Digit placeholder
      if (/\d/.test(value[valIndex])) {
        masked += value[valIndex++];
      } else {
        break;
      }
    } else if (m === "A") {
      // Letter placeholder
      if (/[A-Za-z]/.test(value[valIndex])) {
        masked += value[valIndex++];
      } else {
        break;
      }
    } else if (m === "*") {
      // Alphanumeric
      if (/[A-Za-z0-9]/.test(value[valIndex])) {
        masked += value[valIndex++];
      } else {
        break;
      }
    } else {
      // Static character in mask
      masked += m;
      if (value[valIndex] === m) valIndex++;
    }
  }

  return masked;
}

// Watch modelValue changes
watch(
  () => props.modelValue,
  (v) => (internalValue.value = v != null ? applyMask(String(v)) : "")
);

// Handle input
function onInput(val: string) {
  let newVal = applyMask(val);

  // Max length enforcement
  const maxLength = props.field.validation?.find(
    (v: ValidationRule) => v.type === "maxLength"
  )?.value;
  if (maxLength) newVal = newVal.slice(0, maxLength);

  internalValue.value = newVal;

  emit(
    "update:modelValue",
    subTypeComputed.value === "number" ? (newVal ? Number(newVal) : null) : newVal
  );
}

// Clear input
function clear() {
  internalValue.value = "";
  emit("update:modelValue", subTypeComputed.value === "number" ? null : "");
}

// Character counter
const characterCount = computed(() => {
  const max = props.field.validation?.find((v: ValidationRule) => v.type === "maxLength")
    ?.value;
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
</script>

<style scoped>
.textfield { display: block; margin-bottom: 12px; }
.label-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
.input-row { display: flex; gap: 8px; align-items: center; position: relative; }
input { flex: 1; padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; outline: none; transition: border 0.2s, box-shadow 0.2s; }
.focused-field { border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,0.2); }
.error-field { border-color: #d00; box-shadow: 0 0 0 2px rgba(208,0,0,0.2); }
.clear-btn { background: none; border: none; cursor: pointer; font-size: 14px; color: #555; }
.meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px; }
.errors { color: #d00; }
</style>
