import type { FicaYearData, FilingStatus } from '../../types/tax'
import { toCents, fromCents, mulRate, addC, maxZero } from '../currency'

export function computeSelfEmploymentTax(params: {
  netEarnings: number
  filingStatus: FilingStatus
  fica: FicaYearData
}): { seTax: number; deductibleHalf: number } {
  const { netEarnings, filingStatus, fica } = params

  const seBase = mulRate(netEarnings, 0.9235)

  const ssCapped = fromCents(Math.min(toCents(seBase), toCents(fica.socialSecurityWageBase)))
  const ssTax = mulRate(ssCapped, fica.socialSecurityRate * 2)

  const medicareTax = mulRate(seBase, fica.medicareRate * 2)

  const addlThreshold = fica.additionalMedicareThreshold[filingStatus]
  const addlMedicare = mulRate(maxZero(seBase - addlThreshold), fica.additionalMedicareRate)

  const seTax = addC(ssTax, medicareTax, addlMedicare)
  const deductibleHalf = fromCents(Math.round((toCents(ssTax) + toCents(medicareTax)) / 2))

  return { seTax, deductibleHalf }
}
