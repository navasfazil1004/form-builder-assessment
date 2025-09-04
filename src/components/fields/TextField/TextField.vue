<template>
  <label :for="field.id" class="textfield">
    <div class="label-row">
      <span>{{ field.label }}</span>
      <small v-if="field.helpText">{{ field.helpText }}</small>
    </div>

    <div class="input-row">
      <input
        :id="field.id"
        :type="inputType"
        :placeholder="field.placeholder"
        :value="internalValue"
        :disabled="field.disabled"
        @input="onInput(($event.target as HTMLInputElement).value)"
        @focus="onFocus"
        @blur="onBlur"
        :class="{
          'error-field': errorMessages.length,
          'focused-field': isFocused
        }"
      />
      <button
        v-if="internalValue !== ''"
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
        <div v-for="(e, i) in errorMessages" :key="i" class="error">{{ e }}</div>
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
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "focus"): void;
  (e: "blur"): void;
}>()

const internalValue = ref(props.modelValue ?? "");
const isFocused = ref(false);

// Focus / blur
function onFocus() {
  isFocused.value = true;
  emit("focus");
}
function onBlur() {
  isFocused.value = false;
  emit("blur");
}

// Input type
const inputType = computed(() => {
  const allowed = ["text", "email", "password", "number", "tel"] as const;
  return allowed.includes(props.field.type as any)
    ? (props.field.type as string)
    : "text";
});

// Input mask (optional)
function applyMask(value: string): string {
  if (!props.field.mask) return value;

  let masked = "";
  let valueIndex = 0;
  for (let i = 0; i < props.field.mask.length; i++) {
    const maskChar = props.field.mask[i];
    if (maskChar === "9") {
      if (/\d/.test(value[valueIndex])) {
        masked += value[valueIndex];
        valueIndex++;
      } else {
        break;
      }
    } else {
      masked += maskChar;
      if (value[valueIndex] === maskChar) valueIndex++;
    }
  }
  return masked;
}

// Sync local value with v-model
watch(
  () => props.modelValue,
  (v) => (internalValue.value = v ? applyMask(String(v)) : "")
);

// Input handler
function onInput(val: string) {
  const masked = applyMask(val);
  internalValue.value = masked;
  emit("update:modelValue", masked);
}

// Clear button
function clear() {
  internalValue.value = "";
  emit("update:modelValue", "");
}

// Character counter
const characterCount = computed(() => {
  const max = props.field.validation?.find((v: ValidationRule) => v.type === "maxLength")?.value;
  if (max) return `${String(internalValue.value).length}/${max}`;
  return null;
});

// Validation messages
const errorMessages = computed(() => {
  if (props.error) return Array.isArray(props.error) ? props.error : [props.error];

  const errors: string[] = [];
  const val = internalValue.value;

  if (props.field.validation) {
    props.field.validation.forEach((rule: ValidationRule) => {
      if (rule.type === "required" && (!val || val === "")) errors.push("This field is required.");
      if (rule.type === "minLength" && String(val).length < rule.value)
        errors.push(`Minimum length is ${rule.value}.`);
      if (rule.type === "maxLength" && String(val).length > rule.value)
        errors.push(`Maximum length is ${rule.value}.`);
      if (rule.type === "pattern" && rule.value instanceof RegExp && !rule.value.test(String(val)))
        errors.push("Invalid format.");
    });
  }

  return errors;
});
</script>

<style scoped>
.textfield {
  display: block;
  margin-bottom: 12px;
}
.label-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
  position: relative;
}
input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}
.focused-field {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}
.error-field {
  border-color: #d00;
  box-shadow: 0 0 0 2px rgba(208, 0, 0, 0.2);
}
.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 4px;
}
.errors {
  color: #d00;
}
</style>
