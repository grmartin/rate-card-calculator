import type { MassYearData, FilingStatus } from '../../types/tax'
import { computeProgressiveTax } from './progressiveTax'

export function computeMassIncomeTax(params: {
  grossIncome: number
  filingStatus: FilingStatus
  mass: MassYearData
}): { taxableIncome: number; tax: number } {
  const { grossIncome, filingStatus, mass } = params
  const deduction = mass.deduction?.[filingStatus] ?? 0
  const taxableIncome = Math.max(0, grossIncome - deduction)

  let tax = 0
  if (mass.flatRate !== undefined) {
    tax = taxableIncome * mass.flatRate
  } else if (mass.brackets) {
    tax = computeProgressiveTax(taxableIncome, mass.brackets[filingStatus])
  }

  return { taxableIncome, tax }
}
