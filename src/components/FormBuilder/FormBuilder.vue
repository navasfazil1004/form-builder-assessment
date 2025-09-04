<template>
  <form
    @submit.prevent="handleSubmit"
    class="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-6"
  >
    <!-- Dynamic Fields -->
    <transition-group name="fade" tag="div" class="space-y-4">
      <template v-for="field in visibleFields" :key="field.id">
        <div class="flex items-start space-x-3" :ref="(el) => (fieldRefs[field.id] = el)">
          <component
            :is="getComponent(field.type)"
            :id="field.id"
            :field="field"
            :modelValue="formData[field.name] ?? ''"
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
            :class="{ 'ring-2 ring-blue-500': focusedField?.id === field.id }"
            class="flex-1 p-2 border rounded"
          />
          <button
            v-if="field.dynamic"
            type="button"
            @click="removeFieldById(field.id)"
            class="mt-2 text-red-500 hover:text-red-700 text-sm"
          >
            Remove
          </button>
        </div>
      </template>
    </transition-group>

    <!-- Conditional Display Panel -->
    <fieldset v-if="fieldsRef.length" class="p-4 border rounded space-y-3">
      <legend class="font-semibold">Conditional Display (optional)</legend>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="block">
          Depends on Field:
          <select
            v-model="newField.conditionalField"
            class="mt-1 w-full border rounded p-2"
          >
            <option value="">None</option>
            <option v-for="f in fieldsRef" :key="f.id" :value="f.name">
              {{ f.label }}
            </option>
          </select>
        </label>

        <label v-if="newField.conditionalField" class="block">
          Operator:
          <select
            v-model="newField.conditionalOperator"
            class="mt-1 w-full border rounded p-2"
          >
            <option value="equals">Equals</option>
            <option value="notEquals">Not Equals</option>
            <option value="contains">Contains</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
        </label>

        <label v-if="newField.conditionalField" class="block">
          Value:
          <input
            v-model="newField.conditionalValue"
            placeholder="Value to compare"
            class="mt-1 w-full border rounded p-2"
          />
        </label>
      </div>
    </fieldset>

    <!-- Add New Field Panel -->
    <fieldset class="p-4 border rounded space-y-4">
      <legend class="font-semibold">Add New Field</legend>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column: Basic Field Info -->
        <div class="space-y-3">
          <label class="block">
            Label:
            <input
              v-model="newField.label"
              placeholder="Field label"
              class="mt-1 w-full border rounded p-2"
            />
          </label>

          <label class="block">
            Name:
            <input
              v-model="newField.name"
              placeholder="Field name"
              class="mt-1 w-full border rounded p-2"
            />
          </label>

          <label class="block">
            Placeholder:
            <input
              v-model="newField.placeholder"
              placeholder="Optional placeholder"
              class="mt-1 w-full border rounded p-2"
            />
          </label>

          <label class="block">
            Mask:
            <input
              v-model="newField.mask"
              placeholder="e.g. (999) 999-9999"
              class="mt-1 w-full border rounded p-2"
            />
          </label>

          <label class="block">
            Type:
            <select v-model="newField.type" class="mt-1 w-full border rounded p-2">
              <option value="text">Text / Input</option>
              <option value="select">Select</option>
              <option value="checkbox-group">Checkbox Group</option>
              <option value="date">Date</option>
            </select>
          </label>
        </div>

        <!-- Right Column: Type-specific Options -->
        <div class="space-y-3">
          <!-- Text Subtype & Validation -->
          <div v-if="newField.type === 'text'" class="space-y-2">
            <label class="block">
              Input Subtype:
              <select v-model="newField.subType" class="mt-1 w-full border rounded p-2">
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="password">Password</option>
                <option value="number">Number</option>
                <option value="tel">Phone</option>
              </select>
            </label>

            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="newFieldValidationRequired" />
              Required</label
            >
            <label class="block">
              Min Length:
              <input
                type="number"
                v-model.number="newFieldValidationMinLength"
                min="0"
                class="mt-1 w-full border rounded p-2"
              />
            </label>
            <label class="block">
              Max Length:
              <input
                type="number"
                v-model.number="newFieldValidationMaxLength"
                min="0"
                class="mt-1 w-full border rounded p-2"
              />
            </label>
            <label class="block">
              Pattern (Regex):
              <input
                type="text"
                v-model="newFieldValidationPattern"
                placeholder="e.g. ^[A-Za-z]+$"
                class="mt-1 w-full border rounded p-2"
              />
            </label>
          </div>

          <!-- Select / Checkbox Options -->
          <div
            v-if="newField.type === 'select' || newField.type === 'checkbox-group'"
            class="space-y-2"
          >
            <label class="block">
              Options (comma separated):
              <input
                v-model="newField.optionsRaw"
                placeholder="Red,Green,Blue"
                class="mt-1 w-full border rounded p-2"
              />
            </label>
          </div>

          <div v-if="newField.type === 'checkbox-group'">
            <label class="block">
              Layout:
              <select v-model="newField.layout" class="mt-1 w-full border rounded p-2">
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
                <option value="grid">Grid</option>
              </select>
            </label>
          </div>

          <div v-if="newField.type === 'select'" class="space-y-2">
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="newField.multiple" /> Multiple
              selection</label
            >
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="newField.searchable" /> Searchable</label
            >
            <label class="block">
              Async URL:
              <input
                v-model="asyncUrl"
                placeholder="Enter API URL"
                class="mt-1 w-full border rounded p-2"
              />
              <button
                type="button"
                @click="setAsyncLoader"
                class="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load
              </button>
            </label>
          </div>

          <div v-if="newField.type === 'date'" class="space-y-2">
            <label class="flex items-center gap-2"
              ><input type="checkbox" v-model="newField.isRange" /> Is Range</label
            >
            <label class="block">
              Min Date:
              <input
                type="date"
                v-model="newField.minDate"
                class="mt-1 w-full border rounded p-2"
              />
            </label>
            <label class="block">
              Max Date:
              <input
                type="date"
                v-model="newField.maxDate"
                class="mt-1 w-full border rounded p-2"
              />
            </label>
          </div>
        </div>
      </div>

      <button
        type="button"
        @click="addFieldLive"
        class="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Add Field
      </button>
    </fieldset>

    <!-- Suggestions Panel -->
    <fieldset class="p-4 border rounded bg-gray-50">
      <legend class="font-semibold text-gray-700">Suggestions</legend>
      <div v-if="fieldSuggestions.length">
        <ul class="space-y-2">
          <li
            v-for="suggestion in fieldSuggestions"
            :key="suggestion.name"
            class="p-2 border rounded hover:bg-gray-100 cursor-pointer"
            @click="applySuggestion(suggestion)"
          >
            <div class="font-medium">{{ suggestion.label }}</div>
            <div class="text-sm text-gray-500">{{ suggestion.type }} field</div>
          </li>
        </ul>
      </div>
      <div v-else class="text-gray-400 text-sm">No suggestions yet.</div>
    </fieldset>

    <!-- Form Actions -->
    <div class="flex flex-wrap gap-3 mt-4">
      <button
        type="submit"
        :disabled="submitting"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Submit
      </button>
      <button
        type="button"
        @click="undo"
        :disabled="!canUndo"
        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Undo
      </button>
      <button
        type="button"
        @click="redo"
        :disabled="!canRedo"
        class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Redo
      </button>
      <button
        type="button"
        @click="resetForm"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Reset
      </button>
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
const fieldRefs = reactive<Record<string, HTMLElement | null>>({});
const asyncUrl = ref("");
function setAsyncLoader() {
  if (!asyncUrl.value) return;

  newField.asyncLoader = async () => {
    try {
      const res = await fetch(asyncUrl.value);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched async options:", data);

      // Map to the format your select component expects
      return data.map((o: any) => ({
        label: o.label ?? o.name ?? o.title ?? "Unknown",
        value: o.value ?? o.id ?? o.name ?? "unknown",
      }));
    } catch (error) {
      console.error("Error fetching async options:", error);
      return [];
    }
  };
}

function resetForm() {
  pushUndoSnapshot();
  Object.keys(formData).forEach((key) => (formData[key] = ""));
  fieldsRef.value.forEach((f) => {
    if (f.type === "checkbox-group") formData[f.name] = [];
  });
  isDirty.value = false;
  emits("dirty", false);
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

// --- Field Suggestions Logic
const commonFieldSuggestions = [
  {
    label: "First Name",
    name: "firstName",
    type: "text",
    subType: "text",
    validation: [{ type: "required", message: "Required" }],
  },
  { label: "Last Name", name: "lastName", type: "text", subType: "text" },
  {
    label: "Email",
    name: "email",
    type: "text",
    subType: "email",
    validation: [{ type: "required", message: "Required" }],
  },
  { label: "Phone Number", name: "phone", type: "text", subType: "tel" },
  {
    label: "Country",
    name: "country",
    type: "select",
    options: [
      { label: "USA", value: "USA" },
      { label: "Canada", value: "Canada" },
    ],
  },
];

const fieldSuggestions = computed(() => {
  const input = newField.label.toLowerCase().trim();
  if (!input) return [];
  return commonFieldSuggestions.filter((s) => s.label.toLowerCase().includes(input));
});

// Apply suggestion to Add Field form
function applySuggestion(suggestion: any) {
  Object.assign(newField, {
    label: suggestion.label,
    name: suggestion.name,
    type: suggestion.type,
    subType: suggestion.subType ?? "text",
    options: suggestion.options ?? [],
    validation: suggestion.validation ?? [],
  });
}

// --- Conditional display
function evalConditional(rule: any): boolean {
  if (!rule) return true; // No condition = always visible

  if (Array.isArray(rule)) {
    let result = true;
    let currentOp: "AND" | "OR" = "AND";

    for (const part of rule) {
      if (part && part.op) {
        currentOp = part.op; // Set AND/OR
        continue;
      }
      const r = evalConditional(part); // Recursive
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
    pushUndoSnapshot(); // preserve undo
    formData[field.name] = value;

    // Revalidate conditional fields
    // visibleFields is reactive, so it updates automatically

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
    const { isValid } = await validateAll(); // <-- destructure here
    if (!isValid) {
      const firstError = fieldsRef.value.find((f) => errors[f.name]);
      if (firstError) {
        const el = fieldRefs[firstError.id];
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        setTimeout(() => {
          const input = document.getElementById(firstError.id);
          if (input) input.focus();
        }, 300);
      }
    }
    emits("submit", {
      valid: isValid,
      data: JSON.parse(JSON.stringify(toRaw(formData))),
    });
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
    pushUndoSnapshot();
    const field = fieldsRef.value[index]; // <--- move this line before splice
    fieldsRef.value.splice(index, 1);
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
    asyncLoader: newField.asyncLoader || null,
  };
  if (newField.conditionalField) {
    field.conditionalDisplay = {
      field: newField.conditionalField,
      operator: newField.conditionalOperator,
      value: newField.conditionalValue,
    };
  }
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
    asyncLoader: null,
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
</style>
