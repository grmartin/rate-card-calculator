import type { FicaYearData } from '../../../../types/tax'

const fica2026: FicaYearData = {
  year: 2026,
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 184500,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: {
    single:           200000,
    married_joint:    250000,
    married_separate: 125000,
    head_household:   200000,
  },
}

export default fica2026
