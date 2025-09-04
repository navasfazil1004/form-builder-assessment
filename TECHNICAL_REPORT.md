# Form Builder Assessment - Technical Report

## 1. Project Overview

The Form Builder Assessment project is a **dynamic Vue 3 form builder** enabling creation of complex forms with multiple field types, dynamic addition/removal, conditional display, validation, asynchronous option loading, and undo/redo functionality.

## 2. Architecture Decisions

- **Component-Based Architecture**: Each field type has its own Vue SFC, promoting separation of concerns and reusability.
- **Composition API & Composables**: Validation and form logic are encapsulated in `useFormValidation`, keeping the main component clean and maintainable.
- **Dynamic Component Mapping**: A function maps field types to their components, allowing easy extension.

These patterns allow scalability and modularity, making it simple to add new field types or validation rules.

## 3. State Management Strategy

- **Reactive `formData` Object**: Stores current form values for all fields.
- **`fieldsRef` Array**: Stores field definitions including dynamic fields.
- **Undo/Redo Stacks**: Maintain snapshots of `formData` and field definitions for state restoration.
- **Computed Properties**: `visibleFields` handles conditional field visibility automatically.
- **Event Emission**: `submit`, `change`, and `dirty` events propagate changes to parent components.

This strategy ensures predictable state updates even with complex conditional and dynamic field interactions.

## 4. Performance Optimizations

- **Reactive Computed Properties**: Only recalculates field visibility when dependent values change.
- **Debounced Updates**: For fields with intensive computation or async loading, lodash.debounce minimizes unnecessary processing.
- **Lightweight Undo/Redo**: Snapshots use shallow JSON serialization to avoid memory bloat.
- **Conditional Rendering with `v-if`**: Prevents unnecessary DOM updates for hidden fields.

## 5. Trade-offs

- Using reactive objects for state is simple but may have overhead for extremely large forms.
- Validation runs synchronously per field, which is simpler but could be optimized with batched validation.
- Undo/redo is limited to 50 snapshots to avoid memory issues; more sophisticated diffing could improve this.

If given more time:
- Implement drag-and-drop field ordering
- Use a virtualized list for very large forms
- Optimize validation to batch updates and minimize reactivity triggers

## 6. Challenges Faced

- **Conditional Display Complexity**: Handling nested AND/OR conditions required a recursive evaluation function to ensure proper visibility updates.
- **Dynamic Field Removal**: Ensuring removed fields cleaned up associated data in `formData` without breaking reactivity.
- **Async Select Loading**: Needed to support both static and API-driven options while keeping the UI responsive.
- **Node Version Conflicts & Storybook Library**: Encountered incompatibility between Node 20+ and older Storybook packages, which required careful dependency resolution and upgrades.

## 7. Creative Feature

- **Live Add Field Panel**: Users can define fields dynamically with validation, conditional display, async options, and layout directly in the UI. This allows building forms entirely without code.
- Includes undo/redo integration and real-time validation feedback.

---

**Summary**: This technical approach balances modularity, reactivity, and performance while providing advanced dynamic features, making it suitable for scalable form-building applications.

