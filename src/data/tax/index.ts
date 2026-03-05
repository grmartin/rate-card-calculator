import type { TaxDataset } from '../../types/tax'
import federal2025 from './federal/2025'
import ma2025 from './ma/2025'
import fica2025 from './fica/2025'

const datasets: Record<number, TaxDataset> = {
  2025: {
    federal: federal2025,
    mass: ma2025,
    fica: fica2025,
    metadata: {
      federalSource: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025',
      massSource: 'https://www.mass.gov/info-details/massachusetts-tax-rates',
      verifiedAt: '2025-01-01',
    },
  },
}

export function getSupportedYears(): number[] {
  return Object.keys(datasets).map(Number)
}

export function hasTaxDataset(year: number): boolean {
  return year in datasets
}

export function getTaxDataset(year: number): TaxDataset {
  if (!hasTaxDataset(year)) {
    throw new Error(`Tax dataset for year ${year} is not available. Supported years: ${getSupportedYears().join(', ')}`)
  }
  return datasets[year] as TaxDataset
}