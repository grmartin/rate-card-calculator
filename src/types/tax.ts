export type TaxYear = number

export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_household'

export type WorkerType = 'w2' | '1099'

export interface TaxBracket {
  upTo: number | null
  rate: number
}

export interface FederalYearData {
  year: TaxYear
  standardDeduction: Record<FilingStatus, number>
  brackets: Record<FilingStatus, TaxBracket[]>
}

export interface MassYearData {
  year: TaxYear
  flatRate?: number
  brackets?: Record<FilingStatus, TaxBracket[]>
  deduction?: Record<FilingStatus, number>
}

export interface FicaYearData {
  year: TaxYear
  socialSecurityRate: number
  socialSecurityWageBase: number
  medicareRate: number
  additionalMedicareRate: number
  additionalMedicareThreshold: Record<FilingStatus, number>
}

export interface TaxDataset {
  federal: FederalYearData
  mass: MassYearData
  fica: FicaYearData
  metadata: {
    federalSource: string
    massSource: string
    verifiedAt: string
  }
}
