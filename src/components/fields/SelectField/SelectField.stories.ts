import SelectField from './SelectField.vue';
import type { Meta, StoryFn } from '@storybook/vue3';
import type { FormField, SelectOption } from '@/types/form.types';

const meta: Meta<typeof SelectField> = {
  title: 'Form/SelectField',
  component: SelectField,
  argTypes: {
    field: { control: 'object' },
    modelValue: { control: 'object' },
    options: { control: 'array' },
    searchable: { control: 'boolean' },
    asyncLoader: { control: false },
    'update:modelValue': { action: 'update:modelValue' },
    focus: { action: 'focus' },
  },
};

export default meta;

type Story = StoryFn<typeof SelectField>;

const defaultOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple', group: 'Fruits' },
  { value: 'banana', label: 'Banana', group: 'Fruits' },
  { value: 'carrot', label: 'Carrot', group: 'Vegetables' },
];

export const Default: Story = (args) => ({
  components: { SelectField },
  setup() {
    return { args };
  },
  template: `<SelectField v-bind="args" />`,
});
Default.args = {
  field: { id: 'default', label: 'Select an option' } as FormField,
  options: defaultOptions,
  modelValue: '',
  searchable: false,
};

export const MultiSelect: Story = (args) => ({
  components: { SelectField },
  setup() {
    return { args };
  },
  template: `<SelectField v-bind="args" />`,
});
MultiSelect.args = {
  field: { id: 'multi', label: 'Select multiple', multiple: true } as FormField,
  options: defaultOptions,
  modelValue: [],
  searchable: true,
};

export const AsyncOptions: Story = (args) => ({
  components: { SelectField },
  setup() {
    const asyncLoader = async (): Promise<SelectOption[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { value: 'x', label: 'Option X' },
            { value: 'y', label: 'Option Y' },
          ]);
        }, 1000);
      });
    };
    return { args, asyncLoader };
  },
  template: `<SelectField v-bind="args" :asyncLoader="asyncLoader" />`,
});
AsyncOptions.args = {
  field: { id: 'async', label: 'Async select' } as FormField,
  modelValue: '',
};
