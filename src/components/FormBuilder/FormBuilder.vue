<template>
  <form @submit.prevent="handleSubmit" class="form-builder">
    <!-- Existing & dynamic fields -->
    <transition-group name="fade" tag="div">
      <template v-for="field in visibleFields" :key="field.id">
        <component
          :is="getComponent(field.type)"
          :id="field.id"
          :field="field"
          :modelValue="formData[field.name]"
          @update:modelValue="(val) => updateValue(field, val)"
          @focus="onFocus(field)"
          :error="errors[field.name]"
          :options="field.options"
          :searchable="field.searchable"
          :multiple="field.multiple"
          :asyncLoader="field.asyncLoader"
          :isRange="field.isRange"
          :minDate="field.minDate"
          :maxDate="field.maxDate"
          :placeholder="field.placeholder"
          :subType="field.subType"
          :mask="field.mask"
          :class="{ 'field-focused': focusedField?.id === field.id }"
        />
        <button v-if="field.dynamic" type="button" @click="removeFieldById(field.id)">
          Remove
        </button>
      </template>
    </transition-group>

    <!-- Add Field Panel -->
    <fieldset class="add-field-panel">
      <legend>Add New Field</legend>

      <label>
        Label:
        <input v-model="newField.label" placeholder="Field label" />
      </label>

      <label>
        Name:
        <input v-model="newField.name" placeholder="Field name" />
      </label>

      <label>
        Placeholder:
        <input v-model="newField.placeholder" placeholder="Optional placeholder" />
      </label>
      <label>
        Mask (optional, 9=digit, A=letter, *=alphanumeric):
        <input v-model="newField.mask" placeholder="e.g. (999) 999-9999" />
      </label>

      <label>
        Type:
        <select v-model="newField.type">
          <option value="text">Text / Input</option>
          <option value="select">Select</option>
          <option value="checkbox-group">Checkbox Group</option>
          <option value="date">Date</option>
        </select>
      </label>

      <!-- Input Subtype -->
      <label v-if="newField.type === 'text'">
        Input Subtype:
        <select v-model="newField.subType">
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="password">Password</option>
          <option value="number">Number</option>
          <option value="tel">Phone</option>
        </select>
      </label>

      <!-- Validation -->
      <div v-if="newField.type === 'text'" class="validation-controls">
        <label>
          <input type="checkbox" v-model="newFieldValidationRequired" />
          Required
        </label>
        <label>
          Min Length:
          <input type="number" v-model.number="newFieldValidationMinLength" min="0" />
        </label>
        <label>
          Max Length:
          <input type="number" v-model.number="newFieldValidationMaxLength" min="0" />
        </label>
        <label>
          Pattern (Regex):
          <input
            type="text"
            v-model="newFieldValidationPattern"
            placeholder="e.g. ^[A-Za-z]+$"
          />
        </label>
      </div>

      <!-- Options for select / checkbox -->
      <label v-if="newField.type === 'select' || newField.type === 'checkbox-group'">
        Options (comma separated):
        <input v-model="newField.optionsRaw" placeholder="Red,Green,Blue" />
      </label>

      <!-- Checkbox-group layout -->
      <label v-if="newField.type === 'checkbox-group'">
        Layout:
        <select v-model="newField.layout">
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
          <option value="grid">Grid</option>
        </select>
      </label>
      <label v-if="newField.type === 'select'">
        Multiple selection:
        <input type="checkbox" v-model="newField.multiple" />
      </label>

      <!-- Searchable -->
      <label v-if="newField.type === 'select'">
        Searchable:
        <input type="checkbox" v-model="newField.searchable" />
      </label>

      <!-- Async loader URL (optional) -->
      <label v-if="newField.type === 'select'">
        Async options URL (optional):
        <input v-model="asyncUrl" placeholder="Enter API URL" />
        <button type="button" @click="setAsyncLoader">Load Async</button>
      </label>
      <!-- Date-specific options -->
      <template v-if="newField.type === 'date'">
        <label>
          Is Range:
          <input type="checkbox" v-model="newField.isRange" />
        </label>
        <label>
          Min Date:
          <input type="date" v-model="newField.minDate" />
        </label>
        <label>
          Max Date:
          <input type="date" v-model="newField.maxDate" />
        </label>
      </template>
      <!-- Validation for checkbox-group -->
      <div v-if="newField.type === 'checkbox-group'" class="validation-controls">
        <label>
          <input type="checkbox" v-model="newFieldValidationRequired" /> Required
        </label>
        <label>
          Min Selection:
          <input type="number" v-model.number="newFieldValidationMinLength" min="0" />
        </label>
        <label>
          Max Selection:
          <input type="number" v-model.number="newFieldValidationMaxLength" min="0" />
        </label>
      </div>
      <button type="button" @click="addFieldLive">Add Field</button>
    </fieldset>

    <!-- Form Actions -->
    <div class="form-actions">
      <button type="submit" :disabled="submitting">Submit</button>
      <button type="button" @click="undo" :disabled="!canUndo">Undo</button>
      <button type="button" @click="redo" :disabled="!canRedo">Redo</button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, toRaw } from "vue";
import { nanoid } from "nanoid";
import type {
  FormField,
  FieldType,
  SelectOption,
  ValidationRule,
} from "@/types/form.types";
import TextField from "@/components/fields/TextField/TextField.vue";
import SelectField from "@/components/fields/SelectField/SelectField.vue";
import CheckboxGroup from "@/components/fields/CheckboxGroup/CheckboxGroup.vue";
import DateField from "@/components/fields/DateField/DateField.vue";
import { useFormValidation } from "@/composables/useFormValidation";

// --- Validation refs for new field
const newFieldValidationRequired = ref(false);
const newFieldValidationMinLength = ref<number | null>(null);
const newFieldValidationMaxLength = ref<number | null>(null);
const newFieldValidationPattern = ref<string>("");
const asyncUrl = ref("");
function setAsyncLoader() {
  if (!asyncUrl.value) return;
  newField.asyncLoader = async () => {
    const res = await fetch(asyncUrl.value);
    const data = await res.json();
    return data.map((o: any) => ({ label: o.label, value: o.value }));
  };
}
// --- Props & emits
const props = defineProps<{ schema: FormField[]; initialValues?: Record<string, any> }>();
const emits = defineEmits<{
  (e: "submit", payload: { valid: boolean; data: Record<string, any> }): void;
  (e: "change", payload: { name: string; value: any; data: Record<string, any> }): void;
  (e: "dirty", isDirty: boolean): void;
}>();

// --- State
const fieldsRef = ref<FormField[]>([...(props.schema || [])]);
const formData = reactive<Record<string, any>>({ ...(props.initialValues ?? {}) });
const submitting = ref(false);
const isDirty = ref(false);
const focusedField = ref<FormField | null>(null);

const undoStack = ref<Record<string, any>[]>([]);
const redoStack = ref<Record<string, any>[]>([]);
const canUndo = computed(() => undoStack.value.length > 0);
const canRedo = computed(() => redoStack.value.length > 0);

// --- Undo / redo
function pushUndoSnapshot() {
  const snapshot = {
    formData: JSON.parse(JSON.stringify(toRaw(formData))),
    fields: JSON.parse(JSON.stringify(toRaw(fieldsRef.value))),
  };
  undoStack.value.push(snapshot);
  if (undoStack.value.length > 50) undoStack.value.shift();
  redoStack.value.length = 0;
}
function restoreSnapshot(snapshot: { formData: any; fields: any[] }) {
  Object.keys(formData).forEach((key) => delete formData[key]);
  Object.assign(formData, snapshot.formData);
  fieldsRef.value.splice(0, fieldsRef.value.length, ...snapshot.fields);
}
function undo() {
  if (!canUndo.value) return;
  redoStack.value.push({
    formData: JSON.parse(JSON.stringify(toRaw(formData))),
    fields: JSON.parse(JSON.stringify(toRaw(fieldsRef.value))),
  });
  const snapshot = undoStack.value.pop()!;
  restoreSnapshot(snapshot);
}
function redo() {
  if (!canRedo.value) return;
  undoStack.value.push({
    formData: JSON.parse(JSON.stringify(toRaw(formData))),
    fields: JSON.parse(JSON.stringify(toRaw(fieldsRef.value))),
  });
  const snapshot = redoStack.value.pop()!;
  restoreSnapshot(snapshot);
}

// --- Conditional display
function evalConditional(rule: any): boolean {
  if (!rule) return true;
  if (Array.isArray(rule)) {
    let result = true;
    let currentOp: "AND" | "OR" = "AND";
    for (const part of rule) {
      if (part && part.op) {
        currentOp = part.op;
        continue;
      }
      const r = evalConditional(part);
      result = currentOp === "AND" ? result && r : result || r;
    }
    return result;
  }
  const left = formData[rule.field];
  switch (rule.operator) {
    case "equals":
      return left === rule.value;
    case "notEquals":
      return left !== rule.value;
    case "contains":
      return Array.isArray(left) && left.includes(rule.value);
    case "greaterThan":
      return left > rule.value;
    case "lessThan":
      return left < rule.value;
    default:
      return true;
  }
}
const visibleFields = computed(() =>
  fieldsRef.value.filter((f) => evalConditional(f.conditionalDisplay))
);

// --- Component mapping
const getComponent = (type: FieldType | string) => {
  switch (type) {
    case "text":
      return TextField;
    case "select":
      return SelectField;
    case "checkbox-group":
      return CheckboxGroup;
    case "date":
      return DateField;
    default:
      return TextField;
  }
};

// --- Validation
let validation = useFormValidation([...fieldsRef.value], formData);
watch(
  () => fieldsRef.value,
  () => {
    validation = useFormValidation([...fieldsRef.value], formData);
  },
  { deep: true }
);
const { validateAll, validateField, errors } = validation;

// --- Dirty check
watch(
  [formData, fieldsRef],
  () => {
    if (!isDirty.value) {
      isDirty.value = true;
      emits("dirty", true);
    }
  },
  { deep: true }
);

// --- Update field value
function updateValue(field: FormField, value: any) {
  if (formData[field.name] !== value) {
    pushUndoSnapshot();
    formData[field.name] = value;
    try {
      validateField(field);
    } catch {}
    emits("change", { name: field.name, value, data: toRaw(formData) });
  }
}

// --- Focus
function onFocus(field: FormField) {
  focusedField.value = field;
  document
    .getElementById(field.id)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

// --- Submit
async function handleSubmit() {
  submitting.value = true;
  try {
    const valid = await validateAll();
    if (!valid) {
      const firstError = fieldsRef.value.find((f) => errors[f.name]);
      if (firstError)
        document.getElementById(firstError.id)?.focus({ preventScroll: false });
    }
    emits("submit", { valid, data: JSON.parse(JSON.stringify(toRaw(formData))) });
  } finally {
    submitting.value = false;
  }
}

const newField = reactive<FormField & { optionsRaw: string }>({
  id: "",
  label: "",
  name: "",
  placeholder: "",
  type: "text",
  subType: "text",
  optionsRaw: "",
  options: [],
  dynamic: true,
  isRange: false,
  minDate: "",
  maxDate: "",
  validation: [],
  mask: "",
  multiple: false, // default single
  searchable: false, // default no search
  asyncLoader: null, // default no async
  layout: "vertical",
});
function removeFieldById(id: string) {
  const index = fieldsRef.value.findIndex((f) => f.id === id);
  if (index !== -1) {
    pushUndoSnapshot(); // optional: keep undo/redo working
    fieldsRef.value.splice(index, 1);
    // Also remove the value from formData
    const field = fieldsRef.value[index];
    if (field?.name && formData[field.name] !== undefined) {
      delete formData[field.name];
    }
  }
}

// --- Add new field live
function addFieldLive() {
  if (!newField.label || !newField.name) return;

  const validation: ValidationRule[] = [];
  if (newField.type === "text") {
    if (newFieldValidationRequired.value)
      validation.push({ type: "required", message: "This field is required." });
    if (newFieldValidationMinLength.value !== null)
      validation.push({
        type: "minLength",
        value: newFieldValidationMinLength.value,
        message: `Minimum length is ${newFieldValidationMinLength.value}.`,
      });
    if (newFieldValidationMaxLength.value !== null)
      validation.push({
        type: "maxLength",
        value: newFieldValidationMaxLength.value,
        message: `Maximum length is ${newFieldValidationMaxLength.value}.`,
      });
    if (newFieldValidationPattern.value)
      validation.push({
        type: "pattern",
        value: new RegExp(newFieldValidationPattern.value),
        message: "Invalid format.",
      });
  }
  if (newField.type === "checkbox-group") {
    if (newFieldValidationRequired.value)
      validation.push({ type: "required", message: "This field is required." });
    if (newFieldValidationMinLength.value !== null)
      validation.push({
        type: "minSelection",
        value: newFieldValidationMinLength.value,
        message: `Select at least ${newFieldValidationMinLength.value} option(s).`,
      });
    if (newFieldValidationMaxLength.value !== null)
      validation.push({
        type: "maxSelection",
        value: newFieldValidationMaxLength.value,
        message: `Select no more than ${newFieldValidationMaxLength.value} option(s).`,
      });
  }

  const field: FormField = {
    ...newField,
    id: `field-${nanoid()}`,
    options:
      newField.type === "select" || newField.type === "checkbox-group"
        ? newField.optionsRaw
            .split(",")
            .map((o) => ({ label: o.trim(), value: o.trim() }))
        : [],
    validation,
    dynamic: true,
  };

  pushUndoSnapshot();
  fieldsRef.value.push(field);

  // Reset newField form
  Object.assign(newField, {
    label: "",
    name: "",
    type: "text",
    subType: "text",
    placeholder: "",
    optionsRaw: "",
    options: [],
    validation: [],
    isRange: false,
    minDate: "",
    maxDate: "",
  });
  newFieldValidationRequired.value = false;
  newFieldValidationMinLength.value = null;
  newFieldValidationMaxLength.value = null;
  newFieldValidationPattern.value = "";
}
</script>

<style scoped>
.form-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}
.field-focused {
  outline: 2px solid #4f46e5;
  transition: outline 0.2s ease-in-out;
}
.add-field-panel {
  margin: 1rem 0;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.add-field-panel label {
  display: block;
  margin-bottom: 0.5rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
