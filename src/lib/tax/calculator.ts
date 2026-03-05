import type { CalculatorInput, CalculatorResult, TaxBreakdown } from '../../types/calculator'
import { getTaxDataset } from '../../data/tax/index'
import { computeFederalIncomeTax } from './federalTax'
import { computeMassIncomeTax } from './massTax'
import { computeW2FicaTax } from './ficaTax'
import { computeSelfEmploymentTax } from './selfEmploymentTax'
import { solveGrossForTargetNet } from './grossUpSolver'

function computeTaxBreakdown(gross: number, input: CalculatorInput): TaxBreakdown {
  const ds = getTaxDataset(input.year)

  if (input.workerType === 'w2') {
    const federal = computeFederalIncomeTax({ grossIncome: gross, filingStatus: input.filingStatus, federal: ds.federal })
    const mass = computeMassIncomeTax({ grossIncome: gross, filingStatus: input.filingStatus, mass: ds.mass })
    const ficaTax = computeW2FicaTax({ grossIncome: gross, filingStatus: input.filingStatus, fica: ds.fica })
    const totalTax = federal.tax + mass.tax + ficaTax
    return {
      federalIncomeTax: federal.tax,
      massIncomeTax: mass.tax,
      ficaTax,
      selfEmploymentTax: 0,
      totalTax,
      effectiveTaxRate: gross > 0 ? totalTax / gross : 0,
    }
  } else {
    const { seTax, deductibleHalf } = computeSelfEmploymentTax({ netEarnings: gross, filingStatus: input.filingStatus, fica: ds.fica })
    const federal = computeFederalIncomeTax({ grossIncome: gross, filingStatus: input.filingStatus, federal: ds.federal, extraDeduction: deductibleHalf })
    const mass = computeMassIncomeTax({ grossIncome: gross, filingStatus: input.filingStatus, mass: ds.mass })
    const totalTax = federal.tax + mass.tax + seTax
    return {
      federalIncomeTax: federal.tax,
      massIncomeTax: mass.tax,
      ficaTax: 0,
      selfEmploymentTax: seTax,
      totalTax,
      effectiveTaxRate: gross > 0 ? totalTax / gross : 0,
    }
  }
}

export function calculateRateCard(input: CalculatorInput): CalculatorResult {
  const annualExpenses = input.expenses.reduce((sum, e) => sum + e.monthlyAmount, 0) * 12
  const targetNetAnnual = input.targetNetMonthly * 12
  const totalRequiredNetAnnual = targetNetAnnual + annualExpenses

  const computeNetFromGross = (gross: number): number => {
    const breakdown = computeTaxBreakdown(gross, input)
    return gross - breakdown.totalTax
  }

  const { gross: requiredGrossAnnual } = solveGrossForTargetNet({
    targetNetAnnual: totalRequiredNetAnnual,
    computeNetFromGross,
  })

  const taxBreakdown = computeTaxBreakdown(requiredGrossAnnual, input)
  const totalBillableHours = input.hoursPerWeek * input.weeksPerYear

  return {
    requiredGrossAnnual,
    requiredGrossMonthly: requiredGrossAnnual / 12,
    hourlyRate: totalBillableHours > 0 ? requiredGrossAnnual / totalBillableHours : 0,
    weeklyRate: input.weeksPerYear > 0 ? requiredGrossAnnual / input.weeksPerYear : 0,
    taxBreakdown,
    annualExpenses,
    totalRequiredNetAnnual,
  }
}
