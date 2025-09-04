
# Dynamic Form Builder Component

A fully dynamic, reactive, and customizable form builder for Vue 3.  
Supports text inputs, selects, checkbox groups, date pickers, conditional fields, validation, undo/redo, and async option loading.

---


- Adding/removing fields dynamically at runtime.
- Conditional visibility of fields based on other field values.
- Validation: required, min/max length, regex, min/max selection.
- Multiple input types: text, email, password, number, phone, select, checkbox group, date/range.
- Async loading of select options.
- Undo/redo for form changes.
- Auto focus and scroll for active fields.

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Development](#development)
3. [Type Checking](#type-checking)
4. [Build](#build)
5. [Storybook](#storybook)
6. [Testing](#testing)
7. [Project Structure](#project-structure)
8. [Dependencies](#dependencies)
9. [Component Usage](#component-usage)
10. [Dynamic Fields](#dynamic-fields)
11. [Conditional Display](#conditional-display)
12. [Validation](#validation)
13. [Undo / Redo](#undo--redo)
14. [Styling](#styling)
15. [License](#license)

---

## Project Setup

### Prerequisites

- Node.js >= 20.19.0 or >= 22.12.0
- npm (v9+ recommended)

Install dependencies:

```bash
npm install

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```
