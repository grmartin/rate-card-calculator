import type { FederalYearData, FilingStatus } from '../../types/tax'
import { addC, maxZero } from '../currency'
import { computeProgressiveTax } from './progressiveTax'

export function computeFederalIncomeTax(params: {
  grossIncome: number
  filingStatus: FilingStatus
  federal: FederalYearData
  extraDeduction?: number
}): { taxableIncome: number; tax: number } {
  const { grossIncome, filingStatus, federal, extraDeduction = 0 } = params
  const deduction = addC(federal.standardDeduction[filingStatus], extraDeduction)
  const taxableIncome = maxZero(grossIncome - deduction)
  const tax = computeProgressiveTax(taxableIncome, federal.brackets[filingStatus])
  return { taxableIncome, tax }
}
