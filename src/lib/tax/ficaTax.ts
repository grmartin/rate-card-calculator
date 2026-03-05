import type { FicaYearData, FilingStatus } from '../../types/tax'

export function computeW2FicaTax(params: {
  grossIncome: number
  filingStatus: FilingStatus
  fica: FicaYearData
}): number {
  const { grossIncome, filingStatus, fica } = params

  const ssCapped = Math.min(grossIncome, fica.socialSecurityWageBase)
  const ssTax = ssCapped * fica.socialSecurityRate

  const medicareTax = grossIncome * fica.medicareRate

  const addlThreshold = fica.additionalMedicareThreshold[filingStatus]
  const addlMedicare = Math.max(0, grossIncome - addlThreshold) * fica.additionalMedicareRate

  return ssTax + medicareTax + addlMedicare
}
