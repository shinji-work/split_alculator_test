export type SplitMethod = 'equal' | 'ratio' | 'manual' | 'item'

export type RoundingMethod = 'none' | 'yen1' | 'yen10' | 'yen100'

export interface Person {
  id: string
  name: string
  ratio?: number
  amount?: number
  paidAmount?: number
}

export interface Item {
  id: string
  name: string
  price: number
  assignedTo: string[]
}

export interface CalculationInput {
  totalAmount: number
  people: Person[]
  serviceCharge: {
    type: 'percentage' | 'fixed'
    value: number
  }
  splitMethod: SplitMethod
  roundingMethod: RoundingMethod
  items?: Item[]
  paidBy?: string
}

export interface Settlement {
  from: string
  to: string
  amount: number
}

export interface CalculationResult {
  totalWithCharge: number
  perPersonAmounts: Array<{
    personId: string
    name: string
    amount: number
    roundedAmount: number
  }>
  settlements: Settlement[]
  remainingAmount: number
  breakdown: {
    baseAmount: number
    serviceCharge: number
    totalBeforeRounding: number
    roundingAdjustment: number
  }
}

export interface SavedCalculation {
  id: string
  name: string
  input: CalculationInput
  result: CalculationResult
  createdAt: Date
  updatedAt: Date
} 