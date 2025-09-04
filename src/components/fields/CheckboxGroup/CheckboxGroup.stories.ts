import CheckboxGroup from './CheckboxGroup.vue';
import type { Meta, StoryFn } from '@storybook/vue3';
import type { FormField } from '@/types/form.types';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Form/CheckboxGroup',
  component: CheckboxGroup,
  argTypes: {
    field: { control: 'object' },
    modelValue: { control: 'array' },
    options: { control: 'array' },
    searchable: { control: 'boolean' },
    asyncLoader: { control: false },
    'update:modelValue': { action: 'update:modelValue' },
    focus: { action: 'focus' },
  },
};

export default meta;

type Story = StoryFn<typeof CheckboxGroup>;

export const Default: Story = (args) => ({
  components: { CheckboxGroup },
  setup() {
    return { args };
  },
  template: `<CheckboxGroup v-bind="args" />`,
});
Default.args = {
  field: { id: 'default', label: 'Fruits' } as FormField,
  options: ['Apple', 'Banana', 'Carrot'],
  modelValue: [],
  searchable: false,
};

export const WithSearch: Story = (args) => ({
  components: { CheckboxGroup },
  setup() {
    return { args };
  },
  template: `<CheckboxGroup v-bind="args" />`,
});
WithSearch.args = {
  field: { id: 'searchable', label: 'Fruits', layout: 'vertical' } as FormField,
  options: [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'carrot', label: 'Carrot' }
  ],
  modelValue: [],
  searchable: true,
};

export const AsyncOptions: Story = (args) => ({
  components: { CheckboxGroup },
  setup() {
    const asyncLoader = async (): Promise<{ label: string; value: any }[]> => {
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
  template: `<CheckboxGroup v-bind="args" :asyncLoader="asyncLoader" />`,
});
AsyncOptions.args = {
  field: { id: 'async', label: 'Dynamic Options' } as FormField,
  modelValue: [],
};
