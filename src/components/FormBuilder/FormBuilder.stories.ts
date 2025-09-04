import FormBuilder from './FormBuilder.vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import type { FormField } from '@/types/form.types'

const meta: Meta<typeof FormBuilder> = {
  title: 'Components/FormBuilder',
  component: FormBuilder,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A dynamic form builder component that supports live field addition, conditional display, validation, and undo/redo functionality.'
      }
    }
  }
}
export default meta

type Story = StoryObj<typeof FormBuilder>

const sampleSchema: FormField[] = [
  {
    id: 'username',
    name: 'username',
    label: 'Username',
    type: 'text',
    validation: [{ type: 'required', message: 'Username is required' }],
  },
  {
    id: 'email',
    name: 'email',
    label: 'Email',
    type: 'text',
    subType: 'email',
  },
  {
    id: 'color',
    name: 'color',
    label: 'Favorite Color',
    type: 'select',
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
      { label: 'Blue', value: 'blue' },
    ],
  },
]

export const Default: Story = {
  args: {
    schema: sampleSchema,
  },
}

export const WithInitialValues: Story = {
  args: {
    schema: sampleSchema,
    initialValues: {
      username: 'JohnDoe',
      email: 'john@example.com',
      color: 'green',
    },
  },
}

export const ConditionalFields: Story = {
  args: {
    schema: [
      ...sampleSchema,
      {
        id: 'newsletter',
        name: 'newsletter',
        label: 'Subscribe?',
        type: 'checkbox-group',
        options: [{ label: 'Yes', value: 'yes' }],
      },
      {
        id: 'frequency',
        name: 'frequency',
        label: 'Newsletter Frequency',
        type: 'select',
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
        ],
        conditionalDisplay: {
          field: 'newsletter',
          operator: 'contains',
          value: 'yes',
        },
      },
    ],
  },
}
