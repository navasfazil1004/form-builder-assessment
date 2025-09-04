import TextField from './TextField.vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import type { FormField } from '@/types/form.types';

const meta: Meta<typeof TextField> = {
  title: 'Form/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { 
      control: 'text', 
      description: 'Bound value of the input (v-model)' 
    },
    placeholder: { 
      control: 'text', 
      description: 'Placeholder text shown inside the input' 
    },
    subType: { 
      control: 'select', 
      options: ['text','email','password','number','tel'],
      description: 'Input type' 
    },
    error: { 
      control: 'text', 
      description: 'Manual error message or array of messages' 
    },
    field: { 
      table: { disable: true }, 
      description: 'FormField object containing label, id, validation, etc.' 
    }
  },
};
export default meta;

type Story = StoryObj<typeof TextField>;

// --- Default story
export const Default: Story = {
  args: { modelValue: '', placeholder: 'Enter your first name' },
  play: async ({ canvasElement, args }) => {
    const input = canvasElement.querySelector('input')!;
    input.focus();
    input.value = 'John Doe';
    input.dispatchEvent(new Event('input'));
  },
};

// --- Required field story
export const Required: Story = {
  args: { 
    modelValue: '', 
    field: { label: 'First Name', validation: [{ type: 'required', message: 'Required' }] }
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input')!;
    input.blur(); // trigger validation
  },
};

// --- Password input
export const PasswordField: Story = {
  args: { modelValue: '', subType: 'password', placeholder: 'Enter password' },
};

// --- Max length
export const MaxLengthField: Story = {
  args: { 
    modelValue: '', 
    placeholder: 'Max 10 chars',
    field: { label: 'Username', validation: [{ type: 'maxLength', value: 10 }] }
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input')!;
    input.value = '123456789012345';
    input.dispatchEvent(new Event('input')); // should trim to 10 chars
  },
};

// --- Complex scenario: Required + MaxLength + HelpText
export const ComplexScenario: Story = {
  args: {
    modelValue: '',
    field: { 
      label: 'Full Name', 
      helpText: 'Enter your full legal name',
      validation: [
        { type: 'required', message: 'Full name required' },
        { type: 'maxLength', value: 20, message: 'Max 20 characters' }
      ]
    },
    placeholder: 'John Doe',
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input')!;
    input.value = '';
    input.dispatchEvent(new Event('input')); // trigger required error
    await new Promise((resolve) => setTimeout(resolve, 300));
    input.value = 'A very long name that exceeds 20 chars';
    input.dispatchEvent(new Event('input')); // trigger maxLength error
  },
};
