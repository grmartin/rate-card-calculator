import type { FicaYearData, FilingStatus } from '../../types/tax'

export function computeSelfEmploymentTax(params: {
  netEarnings: number
  filingStatus: FilingStatus
  fica: FicaYearData
}): { seTax: number; deductibleHalf: number } {
  const { netEarnings, filingStatus, fica } = params

  const seBase = netEarnings * 0.9235

  const ssCapped = Math.min(seBase, fica.socialSecurityWageBase)
  const ssTax = ssCapped * (fica.socialSecurityRate * 2)

  const medicareTax = seBase * (fica.medicareRate * 2)

  const addlThreshold = fica.additionalMedicareThreshold[filingStatus]
  const addlMedicare = Math.max(0, seBase - addlThreshold) * fica.additionalMedicareRate

  const seTax = ssTax + medicareTax + addlMedicare
  const deductibleHalf = (ssTax + medicareTax) / 2

  return { seTax, deductibleHalf }
}
