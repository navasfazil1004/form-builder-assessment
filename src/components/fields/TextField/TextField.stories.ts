// TextField.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import TextField from './TextField.vue'

const meta: Meta<typeof TextField> = {
  title: 'Fields/TextField',
  component: TextField,
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'The current input value (v-model)',
    },
    field: {
      control: 'object',
      description: 'FormField schema for this input',
    },
  },
}
export default meta

type Story = StoryObj<typeof TextField>

export const Basic: Story = {
  args: {
    modelValue: '',
    field: { id: 'name', type: 'text', name: 'name', label: 'Name', required: true },
  },
}
