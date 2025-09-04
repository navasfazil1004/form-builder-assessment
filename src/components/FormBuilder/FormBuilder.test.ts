import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import FormBuilder from './FormBuilder.vue'

const basicSchema = [
  { id: 'firstName', type: 'text', name: 'firstName', label: 'First Name' },
  { id: 'email', type: 'text', name: 'email', label: 'Email' },
]

describe('FormBuilder.vue - simple tests', () => {

  it('renders fields from schema', () => {
    const wrapper = mount(FormBuilder, { props: { schema: basicSchema } })
    expect(wrapper.find('input[id="firstName"]').exists()).toBe(true)
    expect(wrapper.find('input[id="email"]').exists()).toBe(true)
  })

  it('updates formData on input', async () => {
    const wrapper = mount(FormBuilder, { props: { schema: basicSchema } })
    const input = wrapper.find('input[id="firstName"]')
    await input.setValue('John')
    expect(wrapper.vm.formData.firstName).toBe('John')
  })

it('adds a new field dynamically', async () => {
  const wrapper = mount(FormBuilder, { props: { schema: [] } })

  // Set up the new field
  wrapper.vm.newField.label = 'Age'
  wrapper.vm.newField.name = 'age'
  wrapper.vm.newField.type = 'text'

  await wrapper.vm.addFieldLive()
  await wrapper.vm.$nextTick()

  // The id is random, so get it from the reactive fields array
  const fieldId = wrapper.vm.fieldsRef[wrapper.vm.fieldsRef.length - 1].id
  expect(wrapper.find(`#${fieldId}`).exists()).toBe(true)
})


  it('handles conditional fields', async () => {
    const schema = [
      { id: 'toggle', type: 'text', name: 'toggle', label: 'Toggle' },
      { id: 'conditional', type: 'text', name: 'conditional', label: 'Conditional', conditionalDisplay: { field: 'toggle', operator: 'equals', value: 'show' } },
    ]
    const wrapper = mount(FormBuilder, { props: { schema } })

    expect(wrapper.find('input[id="conditional"]').exists()).toBe(false)
    await wrapper.find('input[id="toggle"]').setValue('show')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input[id="conditional"]').exists()).toBe(true)
  })
})
