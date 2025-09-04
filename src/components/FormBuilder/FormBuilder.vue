<template>
  <form @submit.prevent="handleSubmit" class="form-builder">
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
          :isRange="field.isRange"
          :minDate="field.minDate"
          :maxDate="field.maxDate"
          :class="{ 'field-focused': focusedField?.id === field.id }"
        />

        <button type="button" @click="removeFieldById(field.id)" v-if="field.dynamic">
          Remove
        </button>
      </template>
    </transition-group>
    <!-- Live Add Field Panel -->
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
        Type:
        <select v-model="newField.type">
          <option value="text">Text</option>
          <option value="select">Select</option>
          <option value="checkbox-group">Checkbox Group</option>
          <option value="date">Date</option>
        </select>
      </label>

      <!-- Options for select or checkbox -->
      <label v-if="newField.type === 'select' || newField.type === 'checkbox-group'">
        Options (comma separated):
        <input v-model="newField.optionsRaw" placeholder="Red,Green,Blue" />
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

      <button type="button" @click="addFieldLive">Add Field</button>
    </fieldset>

    <div class="form-actions">
      <button type="submit" :disabled="submitting">Submit</button>
      <button type="button" @click="undo" :disabled="!canUndo">Undo</button>
      <button type="button" @click="redo" :disabled="!canRedo">Redo</button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { nanoid } from "nanoid";
import { debounce } from "lodash";

import { ref, reactive, computed, watch, toRaw } from "vue";
import type { FormField, FieldType, SelectOption } from "@/types/form.types";
import TextField from "@/components/fields/TextField/TextField.vue";
import SelectField from "@/components/fields/SelectField/SelectField.vue";
import CheckboxGroup from "@/components/fields/CheckboxGroup/CheckboxGroup.vue";
import DateField from "@/components/fields/DateField/DateField.vue";
import { useFormValidation } from "@/composables/useFormValidation";

/** Props & Emits */
const props = defineProps<{ schema: FormField[]; initialValues?: Record<string, any> }>();
const emits = defineEmits<{
  (e: "submit", payload: { valid: boolean; data: Record<string, any> }): void;
  (e: "change", payload: { name: string; value: any; data: Record<string, any> }): void;
  (e: "dirty", isDirty: boolean): void;
}>();

/** Reactive state */
const fieldsRef = ref<FormField[]>([...(props.schema || [])]);
const formData = reactive<Record<string, any>>({ ...(props.initialValues ?? {}) });
const submitting = ref(false);
const isDirty = ref(false);
const focusedField = ref<FormField | null>(null);

const undoStack = ref<Record<string, any>[]>([]);
const redoStack = ref<Record<string, any>[]>([]);

function pushUndoSnapshot() {
  const snapshot = {
    formData: JSON.parse(JSON.stringify(toRaw(formData))),
    fields: JSON.parse(JSON.stringify(toRaw(fieldsRef.value))),
  };
  undoStack.value.push(snapshot);
  if (undoStack.value.length > 50) undoStack.value.shift();
  redoStack.value.length = 0;
}

const canUndo = computed(() => undoStack.value.length > 0);
const canRedo = computed(() => redoStack.value.length > 0);

function restoreSnapshot(snapshot: { formData: any; fields: any[] }) {
  // Clear old formData
  Object.keys(formData).forEach((key) => delete formData[key]);
  // Assign cloned values
  Object.assign(formData, snapshot.formData);

  // Replace fieldsRef array while keeping it reactive
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

/** Conditional logic */
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

/** Component mapping */
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

/** Validation */
let validation = useFormValidation([...fieldsRef.value], formData);
watch(
  () => fieldsRef.value,
  () => {
    validation = useFormValidation([...fieldsRef.value], formData);
  },
  { deep: true }
);
const { validateAll, validateField, errors } = validation;

/** Watch formData for dirty state */
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

function updateValue(field: FormField, value: any) {
  const prev = formData[field.name];
  if (prev !== value) {
    pushUndoSnapshot(); // before change
    formData[field.name] = value;
    try {
      validateField(field);
    } catch {}
    emits("change", { name: field.name, value, data: toRaw(formData) });
  }
}

/** Add/Remove dynamic fields */
function addField(f: FormField) {
  pushUndoSnapshot();

  fieldsRef.value.push(f);
}
function removeFieldById(id: string) {
  const idx = fieldsRef.value.findIndex((f) => f.id === id);
  if (idx >= 0) {
    pushUndoSnapshot(); // before removing
    fieldsRef.value.splice(idx, 1);
  }
}

/** Focus */
function onFocus(field: FormField) {
  focusedField.value = field;
  document
    .getElementById(field.id)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/** Submit */
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

/** Live Add Field Panel */
const newField = reactive<{
  label: string;
  name: string;
  type: FieldType;
  optionsRaw: string;
  options?: SelectOption[];
  dynamic?: boolean;
  isRange?: boolean;
  minDate?: string;
  maxDate?: string;
  validation?: any[];
}>({
  label: "",
  name: "",
  type: "text",
  optionsRaw: "",
  options: [],
  dynamic: true,
  isRange: false,
  minDate: "",
  maxDate: "",
  validation: [],
});

function addFieldLive() {
  if (!newField.label || !newField.name) return;

  const options =
    newField.type === "select" || newField.type === "checkbox-group"
      ? newField.optionsRaw.split(",").map((o) => ({ value: o.trim(), label: o.trim() }))
      : [];

  const field: FormField = {
    ...newField,
    id: `field-${nanoid()}`,
    dynamic: true,
    validation: newField.validation || [],
    options,
    isRange: newField.isRange || false,
    minDate: newField.minDate || "",
    maxDate: newField.maxDate || "",
  };

  pushUndoSnapshot(); // before adding
  fieldsRef.value.push(field);

  Object.assign(newField, {
    label: "",
    name: "",
    type: "text",
    optionsRaw: "",
    options: [],
    validation: [],
    isRange: false,
    minDate: "",
    maxDate: "",
  });
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
