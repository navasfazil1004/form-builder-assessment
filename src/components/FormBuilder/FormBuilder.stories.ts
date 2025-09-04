import type { Meta, StoryObj } from '@storybook/vue3'
import FormBuilder from './FormBuilder.vue'
import type { FormField } from '@/types/form.types'

const meta: Meta<typeof FormBuilder> = {
  title: 'Form/FormBuilder',
  component: FormBuilder,
}
export default meta

type Story = StoryObj<typeof FormBuilder>

const schema: FormField[] = [
  { id:'n', type:'text', name:'name', label:'Name', required:true },
  { id:'e', type:'text', name:'email', label:'Email', validation:[
    { type:'pattern', value:'^\\S+@\\S+\\.\\S+$', message:'Invalid email' }
  ]},
  { id:'c', type:'select', name:'country', label:'Country', options:[
    { label:'USA', value:'us' }, { label:'India', value:'in' }
  ]},
  { id:'st', type:'text', name:'state', label:'State',
    conditionalDisplay:{ field:'country', operator:'equals', value:'us' }
  },
]

export const ComplexScenario: Story = {
  args: { schema },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const nameInput = await canvas.findByLabelText('Name')
    await userEvent.type(nameInput, 'John Doe')

    const emailInput = await canvas.findByLabelText('Email')
    await userEvent.type(emailInput, 'john@example.com')
  },
}
