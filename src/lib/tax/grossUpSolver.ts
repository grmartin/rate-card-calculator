export function solveGrossForTargetNet(params: {
  targetNetAnnual: number
  computeNetFromGross: (gross: number) => number
  lowerBound?: number
  upperBound?: number
  tolerance?: number
  maxIterations?: number
}): { gross: number; iterations: number } {
  const {
    targetNetAnnual,
    computeNetFromGross,
    lowerBound = 0,
    upperBound = 10_000_000,
    tolerance = 0.01,
    maxIterations = 100,
  } = params

  let lo = lowerBound
  let hi = upperBound
  let iterations = 0

  while (iterations < maxIterations) {
    const mid = (lo + hi) / 2
    const net = computeNetFromGross(mid)
    const diff = net - targetNetAnnual

    if (Math.abs(diff) <= tolerance) {
      return { gross: mid, iterations }
    }

    if (diff < 0) {
      lo = mid
    } else {
      hi = mid
    }

    iterations++
  }

  return { gross: (lo + hi) / 2, iterations }
}
