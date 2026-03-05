import type { FicaYearData, FilingStatus } from '../../types/tax'
import { toCents, fromCents, mulRate, addC, maxZero } from '../currency'

export function computeW2FicaTax(params: {
  grossIncome: number
  filingStatus: FilingStatus
  fica: FicaYearData
}): number {
  const { grossIncome, filingStatus, fica } = params

  const ssCapped = fromCents(Math.min(toCents(grossIncome), toCents(fica.socialSecurityWageBase)))
  const ssTax = mulRate(ssCapped, fica.socialSecurityRate)

  const medicareTax = mulRate(grossIncome, fica.medicareRate)

  const addlThreshold = fica.additionalMedicareThreshold[filingStatus]
  const addlMedicare = mulRate(maxZero(grossIncome - addlThreshold), fica.additionalMedicareRate)

  return addC(ssTax, medicareTax, addlMedicare)
}
