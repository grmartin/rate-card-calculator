/**
 * All currency values in this app are dollars with up to 2 decimal places.
 * To avoid IEEE 754 floating point drift we scale to integer cents for every
 * intermediate step, then scale back to dollars only at the boundary.
 *
 *  toCents(1.10) => 110          (integer)
 *  fromCents(110) => 1.10        (dollar, exact)
 *  mulRate(1000.00, 0.22) => 220.00  (rounded to nearest cent)
 *  addC(a, b, c) => rounded sum
 */

export function toCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}

/** Multiply a dollar amount by a fractional rate, return dollars rounded to cents. */
export function mulRate(dollars: number, rate: number): number {
  return fromCents(Math.round(toCents(dollars) * rate))
}

/** Add any number of dollar amounts, return dollars rounded to cents. */
export function addC(...amounts: number[]): number {
  return fromCents(amounts.reduce((sum, a) => sum + toCents(a), 0))
}

/** Subtract dollars, return dollars rounded to cents. */
export function subC(a: number, b: number): number {
  return fromCents(toCents(a) - toCents(b))
}

/** Clamp to zero if negative, then round to cents. */
export function maxZero(dollars: number): number {
  return fromCents(Math.max(0, toCents(dollars)))
}

/** Round a dollar value to the nearest cent. */
export function roundCents(dollars: number): number {
  return fromCents(Math.round(toCents(dollars)))
}
