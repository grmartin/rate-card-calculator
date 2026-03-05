import { ref, computed } from 'vue'
import type { CalculatorInput, CalculatorResult, ExpenseItem } from '../types/calculator'
import type { FilingStatus, WorkerType } from '../types/tax'
import { calculateRateCard } from '../lib/tax/calculator'
import { getSupportedYears, hasTaxDataset } from '../data/tax/index'

const VALID_WORKER_TYPES: WorkerType[] = ['w2', '1099']
const VALID_FILING_STATUSES: FilingStatus[] = ['single', 'married_joint', 'married_separate', 'head_household']

export function useRateCardCalculator() {
  const supportedYears = getSupportedYears()

  const input = ref<CalculatorInput>({
    year: supportedYears[supportedYears.length - 1] ?? 2025,
    workerType: 'w2',
    filingStatus: 'single',
    targetNetMonthly: 5000,
    expenses: [
      { id: crypto.randomUUID(), label: 'Rent', monthlyAmount: 0 },
      { id: crypto.randomUUID(), label: 'Insurance', monthlyAmount: 0 },
    ],
    hoursPerWeek: 40,
    weeksPerYear: 50,
  })

  const error = ref<string | null>(null)
  const clipboardStatus = ref<'idle' | 'exported' | 'imported' | 'error'>('idle')

  const result = computed<CalculatorResult | null>(() => {
    try {
      if (!hasTaxDataset(input.value.year)) {
        error.value = `No tax data available for ${input.value.year}.`
        return null
      }
      if (input.value.targetNetMonthly < 0) {
        error.value = 'Target net income must be a positive number.'
        return null
      }
      error.value = null
      return calculateRateCard(input.value)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Calculation error.'
      return null
    }
  })

  function addExpense(label = 'Utility') {
    input.value.expenses.push({ id: crypto.randomUUID(), label, monthlyAmount: 0 })
  }

  function removeExpense(id: string) {
    input.value.expenses = input.value.expenses.filter(e => e.id !== id)
  }

  function updateExpense(id: string, patch: Partial<ExpenseItem>) {
    const idx = input.value.expenses.findIndex(e => e.id === id)
    if (idx !== -1) {
      const current = input.value.expenses[idx]!
      input.value.expenses[idx] = {
        id: patch.id ?? current.id,
        label: patch.label ?? current.label,
        monthlyAmount: patch.monthlyAmount ?? current.monthlyAmount,
      }
    }
  }

  function flashStatus(status: 'exported' | 'imported' | 'error') {
    clipboardStatus.value = status
    setTimeout(() => { clipboardStatus.value = 'idle' }, 2500)
  }

  async function exportToClipboard() {
    try {
      const payload = JSON.stringify(input.value, null, 2)
      await navigator.clipboard.writeText(payload)
      flashStatus('exported')
    } catch {
      flashStatus('error')
    }
  }

  function importFromText(text: string): void {
    try {
      const parsed = JSON.parse(text) as Partial<CalculatorInput>

      if (
        typeof parsed !== 'object' || parsed === null ||
        !VALID_WORKER_TYPES.includes(parsed.workerType as WorkerType) ||
        !VALID_FILING_STATUSES.includes(parsed.filingStatus as FilingStatus) ||
        typeof parsed.targetNetMonthly !== 'number' ||
        typeof parsed.year !== 'number'
      ) {
        throw new Error('Invalid rate card JSON — missing or unrecognised required fields.')
      }

      input.value = {
        year: parsed.year,
        workerType: parsed.workerType as WorkerType,
        filingStatus: parsed.filingStatus as FilingStatus,
        targetNetMonthly: parsed.targetNetMonthly,
        hoursPerWeek: typeof parsed.hoursPerWeek === 'number' ? parsed.hoursPerWeek : 40,
        weeksPerYear: typeof parsed.weeksPerYear === 'number' ? parsed.weeksPerYear : 50,
        expenses: Array.isArray(parsed.expenses)
          ? parsed.expenses
              .filter((e): e is ExpenseItem =>
                typeof e === 'object' && e !== null &&
                typeof e.label === 'string' &&
                typeof e.monthlyAmount === 'number'
              )
              .map(e => ({ ...e, id: e.id ?? crypto.randomUUID() }))
          : [],
      }

      error.value = null
      flashStatus('imported')
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Import failed — invalid rate card JSON.'
      flashStatus('error')
    }
  }

  return {
    input, result, error, clipboardStatus, supportedYears,
    addExpense, removeExpense, updateExpense,
    exportToClipboard, importFromText,
  }
}
