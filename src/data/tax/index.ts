import type { TaxDataset } from '../../types/tax'
import federal2025 from './federal/2025'
import ma2025 from './state/ma/2025'
import fica2025 from './federal/2025/fica'
import federal2026 from './federal/2026'
import ma2026 from './state/ma/2026'
import fica2026 from './federal/2026/fica'

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
  2026: {
    federal: federal2026,
    mass: ma2026,
    fica: fica2026,
    metadata: {
      federalSource: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill',
      massSource: 'https://www.mass.gov/info-details/massachusetts-tax-rates',
      verifiedAt: '2026-03-05',
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