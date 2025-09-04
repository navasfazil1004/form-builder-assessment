import { useFormValidation } from './useFormValidation'
import type { FormField } from '@/types/form.types'
import { describe, it, expect } from 'vitest'

describe('useFormValidation', () => {
  it('validates required fields', async () => {
    const fields: FormField[] = [{ id:'1', type:'text', name:'x', label:'X', required: true }]
    const data: Record<string,any> = { x: '' }
    const { validateAll, errors } = useFormValidation(fields, data)
    const ok = await validateAll()
    expect(ok).toBe(false)
    expect(errors['x'].length).toBeGreaterThan(0)
  })

  it('supports async custom validators', async () => {
    const fields: FormField[] = [{
      id:'2', type:'text', name:'u', label:'U',
      validation: [{ type:'custom', message:'remote invalid', validator: async (val)=> val === 'ok' }]
    }]
    const data: Record<string,any> = { u: 'no' }
    const { validateAll, errors } = useFormValidation(fields, data)
    const ok = await validateAll()
    expect(ok).toBe(false)
    expect(errors['u'][0]).toBe('remote invalid')
    data.u = 'ok'
    const ok2 = await validateAll()
    expect(ok2).toBe(true)
  })
})
