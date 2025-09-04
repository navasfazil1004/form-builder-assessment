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
6. [Architecture Overview](#architecture-overview)
7. [Component Usage](#component-usage)
8. [Dynamic Fields](#dynamic-fields)
9. [Conditional Display](#conditional-display)
10. [Validation](#validation)
11. [Undo / Redo](#undo--redo)
12. [Performance Optimization](#performance-optimization)
13. [Accessibility](#accessibility)
14. [Browser Compatibility](#browser-compatibility)
15. [Styling](#styling)
16. [License](#license)

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

---

## Dependencies

- Vue 3 – Core framework
- Pinia – Optional state management
- nanoid – Unique ID generation
- date-fns – Date utilities
- imask – Input masking
- lodash & lodash.debounce – Utilities
- TypeScript, Vite, Vitest, Storybook, vue-tsc

---

## Architecture Overview

**Component-based modular architecture**:

- `DynamicFormBuilder.vue`: Main orchestration component
- Field Components: TextField, SelectField, CheckboxGroup, DateField
- Composables: `useFormValidation` handles all validation logic
- State: Reactive `formData` + `fieldsRef`
- Undo/Redo: Snapshot-based

**Diagram:**
```
[DynamicFormBuilder] --> renders --> [Field Components]
[DynamicFormBuilder] --> uses --> [useFormValidation]
[DynamicFormBuilder] --> maintains --> [formData, fieldsRef, undo/redo stacks]
```

---

## Component Usage

```vue
<DynamicFormBuilder
  :schema="fields"
  :initialValues="{ firstName: 'John' }"
  @submit="onSubmit"
  @change="onChange"
  @dirty="onDirty"
/>
```

### Props
- `schema: FormField[]` – Array of field definitions
- `initialValues: Record<string, any>` – Optional initial form values

### Events
- `submit({ valid, data })`
- `change({ name, value, data })`
- `dirty(isDirty: boolean)`

---

## Dynamic Fields
- Add fields live using the Add Field panel
- Configure label, name, type, placeholder, mask, options, validation, conditional display
- Click Add Field to append

---

## Conditional Display
- Based on other field values
- Operators: equals, notEquals, contains, greaterThan, lessThan
- Nested AND/OR logic supported

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
- Reactive inline error display

---

## Undo / Redo
```vue
<button @click="undo" :disabled="!canUndo">Undo</button>
<button @click="redo" :disabled="!canRedo">Redo</button>
```
- Stores up to 50 snapshots
- Redo stack clears on new actions

---

## Performance Optimization
- Reactive computed properties for conditional fields
- Debounced input updates using lodash.debounce
- Lightweight JSON snapshots for undo/redo
- Conditional rendering with `v-if`

---

## Accessibility
- Focus highlight on active fields
- Keyboard navigation supported via standard form controls
- ARIA attributes can be added for enhanced accessibility

---

## Browser Compatibility
- Tested on latest Chrome, Firefox, Edge, and Safari
- Node 20+ recommended for local development
- Storybook supports modern browsers; Node version conflicts may require dependency adjustments

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

