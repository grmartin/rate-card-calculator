import type { TaxBracket } from '../../types/tax'

export function computeProgressiveTax(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0
  let tax = 0
  let prev = 0
  for (const bracket of brackets) {
    const top = bracket.upTo ?? Infinity
    if (taxableIncome <= prev) break
    const taxable = Math.min(taxableIncome, top) - prev
    tax += taxable * bracket.rate
    prev = top
    if (bracket.upTo === null) break
  }
  return tax
}
