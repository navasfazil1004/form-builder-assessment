import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import FormBuilder from './FormBuilder.vue'
import type { FormField } from '@/types/form.types'

describe('FormBuilder', () => {
  const schema: FormField[] = [
    { id: 't1', type: 'text', name: 'a', label: 'A', required: true },
    { id: 't2', type: 'text', name: 'b', label: 'B' },
  ]
  it('initializes with provided schema and shows fields', () => {
    const wrapper = mount(FormBuilder, { props: { schema } })
    expect(wrapper.findAll('input').length).toBeGreaterThan(0)
  })

  it('validates required fields on submit', async () => {
    const wrapper = mount(FormBuilder, { props: { schema } })
    const emitted = vi.fn()
    wrapper.vm.$on?.('submit', emitted as any)
    await wrapper.find('form').trigger('submit.prevent')
    const calls = wrapper.emitted('submit')
    expect(calls).toBeTruthy()
    expect(calls![0][0].valid).toBe(false)
  })

  it('emits change when value updates', async () => {
    const wrapper = mount(FormBuilder, { props: { schema } })
    const input = wrapper.find('input')
    await input.setValue('hello')
    expect(wrapper.emitted('change')).toBeTruthy()
  })
})
