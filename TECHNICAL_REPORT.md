# Form Builder Assessment - Technical Report

## 1. Project Overview

The Form Builder Assessment project is a **dynamic Vue 3 form builder** that allows developers and end-users to build complex forms with minimal effort. It supports multiple field types, dynamic addition/removal, conditional visibility, validation, asynchronous data loading, and undo/redo functionality.

### Goals
- Enable rapid form creation and modification
- Support reactive data binding
- Provide robust validation and conditional display
- Offer extensibility for future enhancements


## 2. Architecture & Design

The project follows a **component-based architecture** using Vue 3 with the Composition API. Key design patterns include:
- **Reactive State Management**: Form data is stored in a reactive object, ensuring automatic updates.
- **Composable Functions**: Validation logic is encapsulated in `useFormValidation` for reuse and separation of concerns.
- **Dynamic Component Mapping**: Field types map to their respective Vue components dynamically.

**Tech Stack:**
- Vue 3, TypeScript, Vite
- Pinia (optional state management)
- nanoid (unique IDs)
- date-fns (date utilities)
- imask (input masking)


## 3. Component Breakdown

### DynamicFormBuilder.vue
- Core component that renders the form
- Handles dynamic fields, conditional rendering, validation, and event emission
- Manages undo/redo stacks

### Fields Components
- **TextField.vue** – Standard text inputs with subtype support
- **SelectField.vue** – Single/multi-select with async option support
- **CheckboxGroup.vue** – Checkbox groups with layout options and min/max selection
- **DateField.vue** – Single date or range selection

### Composables
- `useFormValidation.ts` – Provides field-level and form-level validation logic

### Types
- `form.types.ts` – TypeScript interfaces for FormField, FieldType, SelectOption, and ValidationRule


## 4. Data Flow & State Management

- **Reactive `formData` object** stores current field values.
- **FieldsRef array** stores all field definitions including dynamic fields.
- **Undo/Redo stacks** store snapshots of `formData` and field definitions.
- **Computed properties** (like `visibleFields`) determine which fields should be rendered based on conditional logic.
- **Emits** events (`submit`, `change`, `dirty`) for parent components or external handlers.


## 5. Dynamic Field Logic

- Users can add new fields via the Add Field panel.
- Each new field receives a **unique ID** using `nanoid`.
- Validation, options, conditional display, and other properties are set at runtime.
- Removal updates both the fields array and form data.


## 6. Conditional Display Implementation

- Fields can be conditionally displayed based on another field's value.
- Operators supported: `equals`, `notEquals`, `contains`, `greaterThan`, `lessThan`
- Supports recursive/nested conditions with AND/OR logic.
- Computed property `visibleFields` automatically recalculates when dependencies change.


## 7. Validation Strategy

- Validation rules are defined per field:
  - Required
  - Min/Max length for text
  - Regex patterns
  - Min/Max selection for checkbox groups
- Validation is reactive; errors are displayed inline.
- `useFormValidation` composable handles both field-level and form-level validation.
- On submit, all fields are validated, and the first error field is focused.


## 8. Undo/Redo Mechanism

- **Undo stack**: stores snapshots of `formData` and fields (up to 50 states)
- **Redo stack**: allows reapplying undone changes
- Adding or removing fields, or updating values, pushes a new snapshot to the undo stack
- Undo/Redo actions restore both field definitions and form values


## 9. Asynchronous Features

- Select fields can fetch options from an **API endpoint** using `asyncLoader`.
- Supports both static options and dynamic, asynchronous option loading.


## 10. Testing Approach

- **Unit tests** via Vitest
- **UI tests** with @testing-library/vue
- Storybook is used for interactive component testing
- Validation, dynamic fields, conditional display, and undo/redo flows are covered


## 11. Development Tools & Dependencies

**Core:**
- Vue 3, TypeScript, Vite
- nanoid, date-fns, imask, lodash, lodash.debounce

**Development:**
- Vitest, @vue/test-utils, Storybook
- vue-tsc for type checking


## 12. Future Improvements / Considerations

- Add more complex conditional logic (nested AND/OR groups) via UI
- Integrate with backend form schema storage
- Add drag-and-drop field reordering
- Implement accessibility improvements (ARIA roles, keyboard navigation)
- Enhance validation with custom user-defined rules
- Performance optimizations for large forms


## 13. License

MIT License

