import type { TaxBracket } from '../../types/tax'
import { toCents, fromCents, mulRate, addC } from '../currency'

export function computeProgressiveTax(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0
  let taxCents = 0
  let prevCents = 0
  const incomeCents = toCents(taxableIncome)
  for (const bracket of brackets) {
    const topCents = bracket.upTo !== null ? toCents(bracket.upTo ?? 0) : Infinity
    if (incomeCents <= prevCents) break
    const taxableCents = Math.min(incomeCents, topCents) - prevCents
    taxCents += Math.round(taxableCents * bracket.rate)
    prevCents = topCents
    if (bracket.upTo === null) break
  }
  return addC(fromCents(taxCents), 0)
}
