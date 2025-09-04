import DateField from './DateField.vue';
import type { Meta, StoryFn } from '@storybook/vue3';
import type { FormField } from '@/types/form.types';

const meta: Meta<typeof DateField> = {
  title: 'Form/DateField',
  component: DateField,
  argTypes: {
    field: { control: 'object' },
    modelValue: { control: 'object' },
    error: { control: 'array' },
    'update:modelValue': { action: 'update:modelValue' },
    focus: { action: 'focus' },
  },
};

export default meta;

type Story = StoryFn<typeof DateField>;

export const SingleDate: Story = (args) => ({
  components: { DateField },
  setup() {
    return { args };
  },
  template: `<DateField v-bind="args" />`,
});
SingleDate.args = {
  field: { id: 'single', label: 'Select a date' } as FormField,
  modelValue: '',
};

export const DateRange: Story = (args) => ({
  components: { DateField },
  setup() {
    return { args };
  },
  template: `<DateField v-bind="args" />`,
});
DateRange.args = {
  field: { id: 'range', label: 'Select a range', isRange: true } as FormField,
  modelValue: { start: '', end: '' },
};

export const WithMinMax: Story = (args) => ({
  components: { DateField },
  setup() {
    return { args };
  },
  template: `<DateField v-bind="args" />`,
});
WithMinMax.args = {
  field: {
    id: 'minmax',
    label: 'Select a date',
    minDate: '2025-01-01',
    maxDate: '2025-12-31',
  } as FormField,
  modelValue: '',
};
