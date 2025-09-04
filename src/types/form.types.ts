// src/types/form.types.ts
export type FieldType = 'text' | 'select' | 'checkbox-group' | 'date'

export interface SelectOption {
  label: string
  value: string | number | boolean
  group?: string
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
  // Optional custom validator (sync or async)
  validator?: (value: any, formData: Record<string, any>) => boolean | Promise<boolean>
}

export interface ConditionalRule {
  field: string
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
  value: any
}

export interface FormField {
  id: string
  type: FieldType
  name: string
  label: string
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  validation?: ValidationRule[]
  conditionalDisplay?: ConditionalRule | (ConditionalRule | { op: 'AND'|'OR' })[]
  options?: SelectOption[] // for select and checkbox-group
  multiple?: boolean // for select
}
