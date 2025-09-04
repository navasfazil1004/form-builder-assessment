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
  isRange?: boolean      // true if this date field is a range
  minDate?: string       // 'YYYY-MM-DD' min
  maxDate?: string       // 'YYYY-MM-DD' max
    subType?: "text" | "email" | "password" | "number" | "tel"
  step?: number          // for number inputs
  min?: number           // for number inputs
  max?: number           // for number inputs 
  dynamic?: boolean // true if options are fetched from API
  optionsUrl?: string // API endpoint to fetch options
  optionsMapping?: { label: string; value: string | number | boolean; group?: string } // mapping for dynamic options
mask?: string // input mask pattern (e.g., "(999) 999-9999" for phone numbers)
searchable?: boolean // true if select is searchable
layout?: 'horizontal' | 'vertical' | 'grid' // layout style
  asyncLoader?: (() => Promise<SelectOption[]>) | null

}
