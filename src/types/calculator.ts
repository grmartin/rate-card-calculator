import type { TaxYear, FilingStatus, WorkerType } from './tax'

export interface ExpenseItem {
  id: string
  label: string
  monthlyAmount: number
}

export interface CalculatorInput {
  year: TaxYear
  workerType: WorkerType
  filingStatus: FilingStatus
  targetNetMonthly: number
  expenses: ExpenseItem[]
  hoursPerWeek: number
  weeksPerYear: number
}

export interface TaxBreakdown {
  federalIncomeTax: number
  massIncomeTax: number
  ficaTax: number
  selfEmploymentTax: number
  totalTax: number
  effectiveTaxRate: number
}

export interface CalculatorResult {
  requiredGrossAnnual: number
  requiredGrossMonthly: number
  hourlyRate: number
  weeklyRate: number
  taxBreakdown: TaxBreakdown
  annualExpenses: number
  totalRequiredNetAnnual: number
}
