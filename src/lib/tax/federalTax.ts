import type { FederalYearData, FilingStatus } from '../../types/tax'
import { computeProgressiveTax } from './progressiveTax'

export function computeFederalIncomeTax(params: {
  grossIncome: number
  filingStatus: FilingStatus
  federal: FederalYearData
  extraDeduction?: number
}): { taxableIncome: number; tax: number } {
  const { grossIncome, filingStatus, federal, extraDeduction = 0 } = params
  const deduction = federal.standardDeduction[filingStatus] + extraDeduction
  const taxableIncome = Math.max(0, grossIncome - deduction)
  const tax = computeProgressiveTax(taxableIncome, federal.brackets[filingStatus])
  return { taxableIncome, tax }
}
