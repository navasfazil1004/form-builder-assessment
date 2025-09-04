import { useFormValidation } from './useFormValidation'
import type { FormField } from '@/types/form.types'
import { describe, it, expect } from 'vitest'

describe('useFormValidation', () => {
  it('validates required fields', async () => {
    const fields: FormField[] = [
      {
        id: '1',
        type: 'text',
        name: 'x',
        label: 'X',
        validation: [{ type: 'required', message: 'X is required' }]
      }
    ]
    const data: Record<string, any> = { x: '' }

    const { validateAll, errors } = useFormValidation(fields, data)
    const result = await validateAll() // might return { errors, isValid }
    
    expect(result.isValid).toBe(false)
    expect(errors['x']).toBeDefined()
    expect(errors['x'].length).toBeGreaterThan(0)
  })

  it('supports async custom validators', async () => {
    const fields: FormField[] = [
      {
        id: '2',
        type: 'text',
        name: 'u',
        label: 'U',
        validation: [
          {
            type: 'custom',
            message: 'remote invalid',
            validator: async (val: string) => val === 'ok'
          }
        ]
      }
    ]
    const data: Record<string, any> = { u: 'no' }

    const { validateAll, errors } = useFormValidation(fields, data)
    const result1 = await validateAll()
    expect(result1.isValid).toBe(false)
    expect(errors['u'][0]).toBe('remote invalid')

    data.u = 'ok'
    const result2 = await validateAll()
    expect(result2.isValid).toBe(true)
    expect(errors['u']).toBeUndefined()
  })
})
