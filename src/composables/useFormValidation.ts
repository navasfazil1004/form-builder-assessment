import { ref, reactive, computed, watch } from 'vue'
import type { FormField, ValidationRule } from '@/types/form.types'
import debounce from 'lodash.debounce'

export interface ValidationErrors {
  [field: string]: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

export function useFormValidation(fields: FormField[], formData: Record<string, any>) {
  const errors = reactive<ValidationErrors>({})
  const validating = ref(false)

  /**
   * Clear all errors
   */
  function clearErrors() {
    Object.keys(errors).forEach(k => delete errors[k])
  }

  /**
   * Run validation rules for a single field
   */
  async function validateField(field: FormField): Promise<boolean> {
    const value = formData[field.name]
    const fieldErrors: string[] = []

    for (const rule of field.validation ?? []) {
      switch (rule.type) {
        case 'required':
          if (!value || (Array.isArray(value) && value.length === 0)) {
            fieldErrors.push(rule.message)
          }
          break

        case 'minLength':
          if (String(value ?? '').length < (rule.value ?? 0)) {
            fieldErrors.push(rule.message)
          }
          break

        case 'maxLength':
          if (String(value ?? '').length > (rule.value ?? Infinity)) {
            fieldErrors.push(rule.message)
          }
          break

        case 'pattern':
          if (rule.value && !(new RegExp(rule.value).test(value))) {
            fieldErrors.push(rule.message)
          }
          break

        case 'custom':
          if (rule.validator) {
            try {
              const result = rule.validator(value, formData)
              const valid = result instanceof Promise ? await result : result
              if (!valid) fieldErrors.push(rule.message)
            } catch {
              fieldErrors.push(rule.message)
            }
          }
          break
      }
    }

    if (fieldErrors.length > 0) {
      errors[field.name] = fieldErrors
      return false
    } else {
      delete errors[field.name]
      return true
    }
  }

  /**
   * Validate all fields
   */
  async function validateAll(): Promise<ValidationResult> {
    validating.value = true
    const results = await Promise.all(fields.map(f => validateField(f)))
    validating.value = false
    return {
      isValid: results.every(r => r),
      errors: { ...errors },
    }
  }

  /**
   * Debounced version of validateField
   */
  const debouncedValidateField = debounce(async (field: FormField) => {
    await validateField(field)
  }, 300)

  /**
   * Reactive global validity
   */
  const isValid = computed(() => Object.keys(errors).length === 0)

  /**
   * Watch cross-field dependencies
   * Each field can declare `watchFields: string[]` to trigger validation when dependencies change
   */
  fields.forEach(field => {
    if (field.watchFields?.length) {
      field.watchFields.forEach(dep => {
        watch(
          () => formData[dep],
          () => debouncedValidateField(field)
        )
      })
    }
  })

  return {
    errors,
    validating,
    isValid,
    validateField,
    debouncedValidateField,
    validateAll,
    clearErrors,
  }
}
