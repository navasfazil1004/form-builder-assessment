import type { FormField } from './form.types'

export const formSchema: FormField[] = [
  {
    id: 'firstName',
    type: 'text',
    name: 'firstName',
    label: 'First Name',
    placeholder: 'Enter your first name',
    required: true,
    validation: [
      { type: 'required', message: 'First name is required' },
      { type: 'minLength', value: 2, message: 'Must be at least 2 characters' },
    ],
  },
  {
    id: 'email',
    type: 'text',
    name: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    validation: [
      { type: 'required', message: 'Email is required' },
      { type: 'pattern', value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
    ],
  },
  {
    id: 'isEmployed',
    type: 'select',
    name: 'isEmployed',
    label: 'Are you employed?',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ],
  },
  {
    id: 'companyName',
    type: 'text',
    name: 'companyName',
    label: 'Company Name',
    conditionalDisplay: {
      field: 'isEmployed',
      operator: 'equals',
      value: true,
    },
  },
]
