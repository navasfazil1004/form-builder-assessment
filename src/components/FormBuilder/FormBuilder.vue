<template>
  <div
  v-if="!showFormBuilder"
  class="flex items-center justify-center min-h-screen"
>
  <button
    @click="showFormBuilder = true"
    class="px-6 py-4 text-white bg-blue-600 hover:bg-blue-700 rounded-2xl text-xl shadow-lg transition transform hover:scale-105"
  >
     Start Form Builder
  </button>
</div>

<!-- Form Builder Main Content -->
<div v-else class="min-h-screen flex flex-col bg-gray-100 rounded-2xl shadow-2xl">
    <header
      class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow rounded-2xl shadow-lg"
    >
      <div class="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        <h1 class="text-3xl md:text-4xl font-extrabold drop-shadow">
          Dynamic Form Builder
        </h1>
        <p class="mt-2 text-lg md:text-xl text-white/90">
          Create, configure, and preview forms instantly
        </p>
      </div>
    </header>
    <main class="flex-1 mx-auto w-full p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- LEFT: CONFIG PANEL -->
        <section class="space-y-6 rounded sticky top-6 h-fit">
          <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Field Configuration</h2>

            <fieldset
              class="p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm space-y-6"
            >
              <legend class="font-semibold text-blue-600">Add New Field</legend>
              <transition name="fade-slide" mode="out-in">
                <div v-if="step === 1">
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Type:</label
                  >
                  <select
                    v-model="multiStepField.type"
                    class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="text">Text / Input</option>
                    <option value="select">Select</option>
                    <option value="checkbox-group">Checkbox Group</option>
                    <option value="date">Date</option>
                  </select>
                  <button
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    @click="nextStep"
                    :disabled="!multiStepField.type"
                  >
                    Next
                  </button>
                </div>
                <div v-else-if="step === 2">
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Label:</label
                  >
                  <input
                    v-model="multiStepField.label"
                    class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Field label"
                  />
                 <fieldset class="p-4 border rounded-xl bg-white shadow-md relative" v-if="fieldSuggestions.length>0">
  <legend class="font-semibold text-gray-700">Suggestions</legend>

  <transition-group
    name="fade-slide"
    tag="ul"
    class="space-y-2 mt-2"
  >
    <li
      v-for="suggestion in fieldSuggestions"
      :key="suggestion.name"
      class="p-3 border border-gray-200 rounded-lg hover:shadow-lg hover:bg-blue-50 cursor-pointer transition-all duration-300"
      @click="applySuggestion(suggestion)"
    >
      <div class="font-medium text-gray-800">{{ suggestion.label }}</div>
      <div class="text-sm text-gray-500">{{ suggestion.type }} field</div>
    </li>
  </transition-group>

  <!-- Only show when input > 2 and no matching suggestions -->
  <div
    v-if="newField.label.length > 2 && fieldSuggestions.length === 0"
    class="text-gray-400 text-sm mt-2 text-center italic"
  >
    No suggestions found
  </div>
</fieldset>

                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Name:</label
                  >
                  <input
                    v-model="multiStepField.name"
                    class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Field name"
                  />
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Placeholder:</label
                  >
                  <input
                    v-model="multiStepField.placeholder"
                    class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional placeholder"
                  />
                  <button
                    class="mt-4 px-4 py-2 bg-gray-300 rounded mr-2"
                    @click="prevStep"
                  >
                    Back
                  </button>
                  <button
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    @click="nextStep"
                    :disabled="!multiStepField.label || !multiStepField.name"
                  >
                    Next
                  </button>
                </div>
                <div v-else-if="step === 3">
                  <!-- TEXT FIELD OPTIONS -->
                  <div
                    v-if="multiStepField.type === 'text'"
                    class="grid grid-cols-1 md:grid-cols-1 gap-4"
                  >
                    <div class="flex flex-col md:flex-row gap-4 w-full">
                      <!-- Subtype -->
                      <div class="flex flex-col flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2"
                          >Subtype:</label
                        >
                        <select
                          v-model="multiStepField.subType"
                          class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="password">Password</option>
                          <option value="number">Number</option>
                          <option value="tel">Phone</option>
                        </select>
                      </div>

                      <!-- Mask -->
                      <div class="flex flex-col flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-2"
                          >Mask:</label
                        >
                        <input
                          v-model="multiStepField.mask"
                          placeholder="e.g. (999) 999-9999"
                          class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <!-- Required + Min + Max in one row -->
                    <div class="flex flex-wrap md:flex-nowrap items-end w-full gap-6">
                      <!-- Required -->
                      <label class="flex items-center gap-2 cursor-pointer min-w-[120px]">
                        <input
                          type="checkbox"
                          v-model="multiStepField.required"
                          class="accent-blue-500"
                        />
                        <span class="text-sm font-medium text-gray-700 select-none"
                          >Required</span
                        >
                      </label>

                      <!-- Min Length -->
                      <div class="flex flex-col min-w-[120px]">
                        <label class="text-sm font-medium text-gray-700 mb-1"
                          >Min Length:</label
                        >
                        <input
                          type="number"
                          v-model.number="multiStepField.minLength"
                          min="0"
                          class="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <!-- Max Length -->
                      <div class="flex flex-col min-w-[120px]">
                        <label class="text-sm font-medium text-gray-700 mb-1"
                          >Max Length:</label
                        >
                        <input
                          type="number"
                          v-model.number="multiStepField.maxLength"
                          min="0"
                          class="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <!-- Pattern -->
                    <div class="flex flex-col">
                      <label class="block text-sm font-medium text-gray-700 mb-2"
                        >Pattern (Regex):</label
                      >
                      <input
                        v-model="multiStepField.pattern"
                        placeholder="e.g. ^[A-Za-z]+$"
                        class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <!-- SELECT / CHECKBOX-GROUP OPTIONS -->
                  <div
                    v-if="
                      multiStepField.type === 'select' ||
                      multiStepField.type === 'checkbox-group'
                    "
                  >
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Options (comma separated):</label
                    >
                    <input
                      v-model="multiStepField.optionsRaw"
                      class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Red, Green, Blue"
                    />
                  </div>

                  <!-- Checkbox layout -->
                  <div v-if="multiStepField.type === 'checkbox-group'">
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Layout:</label
                    >
                    <select
                      v-model="multiStepField.layout"
                      class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="vertical">Vertical</option>
                      <option value="horizontal">Horizontal</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>

                  <!-- Select specific options -->
                  <div v-if="multiStepField.type === 'select'">
                    <label
                      class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <input
                        type="checkbox"
                        v-model="multiStepField.multiple"
                        class="accent-blue-500"
                      />
                      Multiple selection
                    </label>
                    <label
                      class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <input
                        type="checkbox"
                        v-model="multiStepField.searchable"
                        class="accent-blue-500"
                      />
                      Searchable
                    </label>
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Async URL:</label
                    >
                    <input
                      v-model="multiStepField.asyncUrl"
                      class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter API URL"
                    />
                    <button
                      type="button"
                      @click="setMultiStepAsyncLoader"
                      class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-2"
                    >
                      Load
                    </button>
                  </div>

                  <!-- DATE FIELD OPTIONS -->
                  <div v-if="multiStepField.type === 'date'">
                    <label
                      class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
                    >
                      <input
                        type="checkbox"
                        v-model="multiStepField.isRange"
                        class="accent-blue-500"
                      />
                      Is Range
                    </label>
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Min Date:</label
                    >
                    <input
                      type="date"
                      v-model="multiStepField.minDate"
                      class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <label class="block text-sm font-medium text-gray-700 mb-2"
                      >Max Date:</label
                    >
                    <input
                      type="date"
                      v-model="multiStepField.maxDate"
                      class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <!-- CONDITIONAL DISPLAY -->
                  <div v-if="fieldsRef.length" class="mt-6">
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">
                      Conditional Display
                    </h4>

                    <div
                      class="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4"
                    >
                      <!-- Depends on Field -->
                      <div class="flex flex-col md:flex-row md:items-center gap-4">
                        <label
                          class="block text-sm font-medium text-gray-700 w-full md:w-1/3"
                        >
                          Depends on Field:
                        </label>
                        <select
                          v-model="multiStepField.conditionalField"
                          class="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">None</option>
                          <option v-for="f in fieldsRef" :key="f.id" :value="f.name">
                            {{ f.label }}
                          </option>
                        </select>
                      </div>

                      <!-- Operator & Value: Only show if a field is selected -->
                      <div
                        v-if="multiStepField.conditionalField"
                        class="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <!-- Operator -->
                        <div class="flex flex-col">
                          <label class="text-sm font-medium text-gray-700 mb-1"
                            >Operator:</label
                          >
                          <select
                            v-model="multiStepField.conditionalOperator"
                            class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="equals">Equals</option>
                            <option value="notEquals">Not Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greaterThan">Greater Than</option>
                            <option value="lessThan">Less Than</option>
                          </select>
                        </div>

                        <!-- Value -->
                        <div class="flex flex-col">
                          <label class="text-sm font-medium text-gray-700 mb-1"
                            >Value:</label
                          >
                          <input
                            v-model="multiStepField.conditionalValue"
                            placeholder="Value to compare"
                            class="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step Buttons -->
                  <div class="flex gap-2 mt-4">
                    <button class="px-4 py-2 bg-gray-300 rounded" @click="prevStep">
                      Back
                    </button>
                    <button
                      class="px-4 py-2 bg-blue-500 text-white rounded"
                      @click="nextStep"
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div v-else-if="step === 4" class="text-gray-800">
                  <h3 class="font-semibold mb-2">Review</h3>
                  <div class="mb-2"><b>Type:</b> {{ multiStepField.type }}</div>
                  <div class="mb-2"><b>Label:</b> {{ multiStepField.label }}</div>
                  <div class="mb-2"><b>Name:</b> {{ multiStepField.name }}</div>
                  <div v-if="multiStepField.placeholder">
                    <b>Placeholder:</b> {{ multiStepField.placeholder }}
                  </div>
                  <div v-if="multiStepField.optionsRaw">
                    <b>Options:</b> {{ multiStepField.optionsRaw }}
                  </div>
                  <div v-if="multiStepField.required"><b>Required</b></div>
                  <div v-if="multiStepField.subType">
                    <b>Subtype:</b> {{ multiStepField.subType }}
                  </div>
                  <div v-if="multiStepField.mask">
                    <b>Mask:</b> {{ multiStepField.mask }}
                  </div>
                  <div v-if="multiStepField.minLength">
                    <b>Min Length:</b> {{ multiStepField.minLength }}
                  </div>
                  <div v-if="multiStepField.maxLength">
                    <b>Max Length:</b> {{ multiStepField.maxLength }}
                  </div>
                  <div v-if="multiStepField.pattern">
                    <b>Pattern:</b> {{ multiStepField.pattern }}
                  </div>
                  <div v-if="multiStepField.layout">
                    <b>Layout:</b> {{ multiStepField.layout }}
                  </div>
                  <div v-if="multiStepField.multiple"><b>Multiple:</b> Yes</div>
                  <div v-if="multiStepField.searchable"><b>Searchable:</b> Yes</div>
                  <div v-if="multiStepField.asyncUrl">
                    <b>Async URL:</b> {{ multiStepField.asyncUrl }}
                  </div>
                  <div v-if="multiStepField.isRange"><b>Is Range:</b> Yes</div>
                  <div v-if="multiStepField.minDate">
                    <b>Min Date:</b> {{ multiStepField.minDate }}
                  </div>
                  <div v-if="multiStepField.maxDate">
                    <b>Max Date:</b> {{ multiStepField.maxDate }}
                  </div>
                  <div v-if="multiStepField.conditionalField">
                    <b>Conditional:</b> {{ multiStepField.conditionalField }}
                    {{ multiStepField.conditionalOperator }}
                    {{ multiStepField.conditionalValue }}
                  </div>
                  <button
                    class="mt-4 px-4 py-2 bg-gray-300 rounded mr-2"
                    @click="prevStep"
                  >
                    Back
                  </button>
                  <button
                    class="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                    @click="addMultiStepField"
                  >
                    Add Field
                  </button>
                </div>
                <div v-else>
                  <button
                    class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    @click="resetMultiStep"
                  >
                    Add Another Field
                  </button>
                </div>
              </transition>
            </fieldset>
          </div>
        </section>

        <!-- RIGHT: PREVIEW FORM -->
        <section class="space-y-6">
          <!-- Preview Header -->
          <div class="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Form Preview</h2>
            <p class="text-gray-500 mb-6">
              This section shows a live preview of your form. You can interact with it and
              see validations in action.
            </p>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <draggable
                :list="visibleFields"
                item-key="id"
                handle=".drag-handle"
                class="space-y-4"
              >
                <template #item="{ element: field, index }">
                  <transition-group
                    name="fade"
                    tag="div"
                    enter-active-class="transition duration-500 ease-out"
                    leave-active-class="transition duration-300 ease-in"
                  >
                    <div v-if="visibleFields.includes(field)">
                      <div
                        class="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition"
                        :ref="(el) => (fieldRefs[field.id] = el)"
                      >
                        <!-- Field component -->
                        <div class="flex-1 w-full md:mr-4">
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
                            class="w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <!-- Actions: Drag handle + Remove -->
                        <div class="flex items-center gap-2 mt-2 md:mt-0">
                          <span
                            class="drag-handle cursor-move p-2 text-gray-500 hover:text-gray-700"
                            >⠿</span
                          >
                          <button
                            type="button"
                            @click="removeFieldById(field.id)"
                            class="p-2 rounded-lg text-red-500 hover:bg-red-100 transition"
                            title="Remove field"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </transition-group>
                </template>
              </draggable>

              <!-- Form Actions -->
              <div class="flex flex-wrap justify-end gap-3 mt-6">
                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition disabled:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Submit
                </button>

                <button
                  type="button"
                  @click="undo"
                  :disabled="!canUndo"
                  class="px-5 py-2 rounded-lg transition text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  ⬅ Undo
                </button>

                <button
                  type="button"
                  @click="redo"
                  :disabled="!canRedo"
                  class="px-5 py-2 rounded-lg transition text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Redo ➡
                </button>

                <button
                  type="button"
                  @click="resetForm"
                  class="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition"
                >
                  🔄 Reset
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>

    <!-- Submission Modal -->
    <div
      v-if="showSubmitModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        <h3 class="text-xl font-bold mb-4 text-green-900">Form Submitted!</h3>
        <button
          @click="showSubmitModal = false"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
        >
          ✕
        </button>

        <div class="mb-4">
          <h4 class="font-semibold mb-1 text-red-800">JSON Response:</h4>
          <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto text-gray-800">{{
            submittedData?.json
          }}</pre>
        </div>

        <div>
          <h4 class="font-semibold mb-1 text-red-800">Preview:</h4>
          <pre
            class="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap text-gray-800"
            >{{ submittedData?.email }}</pre
          >
        </div>

        <button
          @click="showSubmitModal = false"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Close
        </button>
      </div>
    </div>

    <!-- FOOTER -->
    <footer class="bg-gray-900 text-white text-center py-6 rounded-b-2xl mt-6">
      <p class="text-sm">© 2025 Dynamic Form Builder.</p>
    </footer>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, watch, toRaw } from "vue";
import { nanoid } from "nanoid";
import draggable from "vuedraggable";
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
const showSubmitModal = ref(false);
const submittedData = ref<{
  json: Record<string, any>;
  email: string;
  errors?: Record<string, string>;
} | null>(null);
const showFormBuilder = ref(false);

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
    name: "First Name",
    type: "text",
    subType: "text",
    validation: [{ type: "required", message: "Required" }],
  },
  { label: "Last Name", name: "Last tName", type: "text", subType: "text" },
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
  const input = multiStepField.label.toLowerCase().trim();
  if (!input) return [];
  return commonFieldSuggestions.filter((s) => s.label.toLowerCase().includes(input));
});

// Apply suggestion to Add Field form
function applySuggestion(suggestion: any) {
  Object.assign(multiStepField, {
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
    const { isValid } = await validateAll();
    const formJson = JSON.parse(JSON.stringify(toRaw(formData)));

    if (!isValid) {
      // Prepare error list
      const errorMessages: Record<string, string> = {};
      Object.entries(errors).forEach(([key, val]) => {
        if (val) errorMessages[key] = val;
      });

      submittedData.value = {
        json: formJson,
        email: Object.entries(formData)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n"),
        errors: errorMessages,
      };

      showSubmitModal.value = true;

      // Scroll to first error
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

      return; // Stop submission
    }

    // Valid submission
    submittedData.value = {
      json: formJson,
      email: Object.entries(formData)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n"),
    };
    showSubmitModal.value = true;

    emits("submit", {
      valid: isValid,
      data: formJson,
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

// --- Multistep field addition
const step = ref(1);
const multiStepField = reactive({
  type: "",
  label: "",
  name: "",
  placeholder: "",
  subType: "text",
  mask: "",
  required: false,
  minLength: null as number | null,
  maxLength: null as number | null,
  pattern: "",
  optionsRaw: "",
  options: [],
  layout: "vertical",
  multiple: false,
  searchable: false,
  asyncUrl: "",
  asyncLoader: null as null | (() => Promise<any[]>),
  isRange: false,
  minDate: "",
  maxDate: "",
  conditionalField: "",
  conditionalOperator: "equals",
  conditionalValue: "",
});

function nextStep() {
  if (step.value < 4) step.value++;
}
function prevStep() {
  if (step.value > 1) step.value--;
}
function resetMultiStep() {
  step.value = 1;
  Object.assign(multiStepField, {
    type: "",
    label: "",
    name: "",
    placeholder: "",
    subType: "text",
    mask: "",
    required: false,
    minLength: null,
    maxLength: null,
    pattern: "",
    optionsRaw: "",
    options: [],
    layout: "vertical",
    multiple: false,
    searchable: false,
    asyncUrl: "",
    asyncLoader: null,
    isRange: false,
    minDate: "",
    maxDate: "",
    conditionalField: "",
    conditionalOperator: "equals",
    conditionalValue: "",
  });
}
function setMultiStepAsyncLoader() {
  if (!multiStepField.asyncUrl) return;
  multiStepField.asyncLoader = async () => {
    try {
      const res = await fetch(multiStepField.asyncUrl);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
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
function addMultiStepField() {
  const validation: ValidationRule[] = [];
  if (multiStepField.type === "text") {
    if (multiStepField.required)
      validation.push({ type: "required", message: "This field is required." });
    if (multiStepField.minLength !== null)
      validation.push({
        type: "minLength",
        value: multiStepField.minLength,
        message: `Minimum length is ${multiStepField.minLength}.`,
      });
    if (multiStepField.maxLength !== null)
      validation.push({
        type: "maxLength",
        value: multiStepField.maxLength,
        message: `Maximum length is ${multiStepField.maxLength}.`,
      });
    if (multiStepField.pattern)
      validation.push({
        type: "pattern",
        value: new RegExp(multiStepField.pattern),
        message: "Invalid format.",
      });
  }
  if (multiStepField.type === "checkbox-group") {
    if (multiStepField.required)
      validation.push({ type: "required", message: "This field is required." });
    if (multiStepField.minLength !== null)
      validation.push({
        type: "minSelection",
        value: multiStepField.minLength,
        message: `Select at least ${multiStepField.minLength} option(s).`,
      });
    if (multiStepField.maxLength !== null)
      validation.push({
        type: "maxSelection",
        value: multiStepField.maxLength,
        message: `Select no more than ${multiStepField.maxLength} option(s).`,
      });
  }
  const field: FormField = {
    id: `field-${nanoid()}`,
    type: multiStepField.type,
    label: multiStepField.label,
    name: multiStepField.name,
    placeholder: multiStepField.placeholder,
    subType: multiStepField.subType,
    mask: multiStepField.mask,
    options:
      multiStepField.type === "select" || multiStepField.type === "checkbox-group"
        ? multiStepField.optionsRaw
            .split(",")
            .map((o) => ({ label: o.trim(), value: o.trim() }))
        : [],
    layout: multiStepField.layout,
    multiple: multiStepField.multiple,
    searchable: multiStepField.searchable,
    asyncLoader: multiStepField.asyncLoader,
    isRange: multiStepField.isRange,
    minDate: multiStepField.minDate,
    maxDate: multiStepField.maxDate,
    validation,
    dynamic: true,
  };
  if (multiStepField.conditionalField) {
    field.conditionalDisplay = {
      field: multiStepField.conditionalField,
      operator: multiStepField.conditionalOperator,
      value: multiStepField.conditionalValue,
    };
  }
  fieldsRef.value.push(field);
  resetMultiStep();
  step.value = 5;
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
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.fade-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
