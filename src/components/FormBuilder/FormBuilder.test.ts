// src/components/FormBuilder/FormBuilder.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import FormBuilder from './FormBuilder.vue'

// Mock fetch for async loader
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ label: 'Option1', value: '1' }]),
  })
) as any

const basicSchema = [
  { id: 'firstName', type: 'text', name: 'firstName', label: 'First Name' },
  { id: 'email', type: 'text', name: 'email', label: 'Email' },
]

describe('FormBuilder.vue - complex tests', () => {






  it('shows conditional field only when condition is met', async () => {
    const schema = [
      { id: 'toggle', type: 'text', name: 'toggle', label: 'Toggle' },
      {
        id: 'conditional',
        type: 'text',
        name: 'conditional',
        label: 'Conditional',
        conditionalDisplay: { field: 'toggle', operator: 'equals', value: 'show' },
      },
    ]
    const wrapper = mount(FormBuilder, { props: { schema } })

    expect(wrapper.find('input[id="conditional"]').exists()).toBe(false)
    await wrapper.find('input[id="toggle"]').setValue('show')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input[id="conditional"]').exists()).toBe(true)
  })

  it('updates formData correctly on input', async () => {
    const wrapper = mount(FormBuilder, { props: { schema: basicSchema } })
    const input = wrapper.find('input[id="firstName"]')
    await input.setValue('John Doe')
    expect(wrapper.vm.formData.firstName).toBe('John Doe')
  })

  it('adds a new dynamic field and removes it', async () => {
    const wrapper = mount(FormBuilder, { props: { schema: [] } })

    wrapper.vm.newField.label = 'Age'
    wrapper.vm.newField.name = 'age'
    wrapper.vm.newField.type = 'text'

    await wrapper.vm.addFieldLive()
    await wrapper.vm.$nextTick()

    const fieldId = wrapper.vm.fieldsRef[0].id
    expect(wrapper.find(`#${fieldId}`).exists()).toBe(true)

    await wrapper.vm.removeFieldById(fieldId)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.fieldsRef.length).toBe(0)
  })

  it('performs undo and redo correctly', async () => {
    const wrapper = mount(FormBuilder, { props: { schema: [] } })

    wrapper.vm.newField.label = 'Name'
    wrapper.vm.newField.name = 'name'
    wrapper.vm.newField.type = 'text'
    await wrapper.vm.addFieldLive()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.fieldsRef.length).toBe(1)

    // Undo
    wrapper.vm.undo()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.fieldsRef.length).toBe(0)

    // Redo
    wrapper.vm.redo()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.fieldsRef.length).toBe(1)
  })

  it('loads async options for select field', async () => {
    const wrapper = mount(FormBuilder, { props: { schema: [] } })

    wrapper.vm.newField.label = 'Country'
    wrapper.vm.newField.name = 'country'
    wrapper.vm.newField.type = 'select'
    wrapper.vm.newField.optionsRaw = ''
    wrapper.vm.newField.multiple = false
    wrapper.vm.newField.searchable = false

    wrapper.vm.asyncUrl = 'https://fakeapi.com/options'
    await wrapper.vm.setAsyncLoader()

    await wrapper.vm.addFieldLive()
    await wrapper.vm.$nextTick()

    const field = wrapper.vm.fieldsRef[0]
    expect(field.asyncLoader).toBeTypeOf('function')

    const options = await field.asyncLoader?.()
    expect(options).toEqual([{ label: 'Option1', value: '1' }])
  })
})
