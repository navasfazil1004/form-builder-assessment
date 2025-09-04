# Form Builder Assessment

A **dynamic Vue 3 form builder** with support for:

- Text, select, checkbox-group, and date/range fields
- Dynamic field addition and removal
- Conditional field display
- Validation: required, min/max length, regex, min/max selection
- Async option loading for select fields
- Undo/redo support
- Reactive form data with change tracking

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Development](#development)
3. [Scripts](#scripts)
4. [Project Structure](#project-structure)
5. [Dependencies](#dependencies)
6. [Component Usage](#component-usage)
7. [Dynamic Fields](#dynamic-fields)
8. [Conditional Display](#conditional-display)
9. [Validation](#validation)
10. [Undo / Redo](#undo--redo)
11. [Styling](#styling)
12. [License](#license)

---

## Project Setup

### Prerequisites

- Node.js >= 20.19.0 or >= 22.12.0
- npm >= 9

Install dependencies:

```bash
npm install
```

---

## Development

Start the development server:

```bash
npm run dev
```

Preview production build locally:

```bash
npm run preview
```

Run Storybook for component documentation:

```bash
npm run storybook
```

Build static Storybook site:

```bash
npm run build-storybook
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Starts Vite development server |
| `preview` | Previews production build locally |
| `build` | Runs type check and builds project |
| `build-only` | Builds project without type check |
| `type-check` | Runs Vue TypeScript compiler (`vue-tsc`) |
| `test:unit` | Runs unit tests via Vitest |
| `test:ui` | Runs Vitest interactive UI |
| `test` | Runs all tests in CLI |
| `coverage` | Runs tests and generates coverage report |
| `storybook` | Starts Storybook dev server |
| `build-storybook` | Builds Storybook static site |

---

## Project Structure

```
form-builder-assessment/
├─ src/
│  ├─ components/
│  │  ├─ DynamicFormBuilder.vue       # Main form builder
│  │  └─ fields/
│  │     ├─ TextField.vue
│  │     ├─ SelectField.vue
│  │     ├─ CheckboxGroup.vue
│  │     └─ DateField.vue
│  ├─ composables/
│  │  └─ useFormValidation.ts         # Validation composable
│  ├─ types/
│  │  └─ form.types.ts                # Type definitions
│  ├─ App.vue
│  └─ main.ts
├─ public/
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ storybook/
└─ README.md
```

- `components/` – Vue SFC components for form builder and fields
- `composables/` – Vue composables (e.g., validation logic)
- `types/` – TypeScript type definitions
- `storybook/` – Storybook configuration
- `public/` – Static assets

---

## Dependencies

- **Vue 3** – Core framework
- **Pinia** – Optional state management
- **nanoid** – Unique ID generation
- **date-fns** – Date utilities
- **imask** – Input masking
- **lodash & lodash.debounce** – Utilities

Dev tools:
- TypeScript, Vite, Vitest, Storybook, vue-tsc

---

## Component Usage

```vue
<template>
  <DynamicFormBuilder
    :schema="fields"
    :initialValues="{ firstName: 'John' }"
    @submit="onSubmit"
    @change="onChange"
    @dirty="onDirty"
  />
</template>

<script setup lang="ts">
import DynamicFormBuilder from '@/components/DynamicFormBuilder.vue';
import type { FormField } from '@/types/form.types';

const fields: FormField[] = [
  { id: 'f1', name: 'firstName', label: 'First Name', type: 'text' },
  { id: 'f2', name: 'favoriteColor', label: 'Favorite Color', type: 'select', options: [{ label: 'Red', value: 'red' }] },
];

function onSubmit({ valid, data }: { valid: boolean; data: Record<string, any> }) {
  console.log('Submit:', valid, data);
}

function onChange({ name, value, data }: { name: string; value: any; data: Record<string, any> }) {
  console.log('Change:', name, value, data);
}

function onDirty(isDirty: boolean) {
  console.log('Dirty state:', isDirty);
}
</script>
```

---

## Dynamic Fields

- Add fields live using the **Add Field** panel
- Configure label, name, type, placeholder, mask, options, validation, conditional display, date configurations
- Click **Add Field** to append it to the form

---

## Conditional Display

- Fields appear based on other field values
- Operators: `equals`, `notEquals`, `contains`, `greaterThan`, `lessThan`
- Supports nested AND/OR logic

Example:

```ts
conditionalDisplay: {
  field: 'country',
  operator: 'equals',
  value: 'USA'
}
```

---

## Validation

- Text fields: required, min/max length, regex
- Checkbox group: required, min/max selection
- Validation errors are reactive and displayed per field

---

## Undo / Redo

```vue
<button @click="undo" :disabled="!canUndo">Undo</button>
<button @click="redo" :disabled="!canRedo">Redo</button>
```

- Stores up to 50 snapshots
- Redo stack clears on new actions

---

## Styling

- Focused field highlight:

```css
.field-focused {
  outline: 2px solid #4f46e5;
  transition: outline 0.2s ease-in-out;
}
```

- Fade transitions for field add/remove:

```css
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
```

---

## License

MIT License

