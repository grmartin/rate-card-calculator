<script setup lang="ts">
import { ref } from 'vue'
import { useRateCardCalculator } from './composables/useRateCardCalculator'

const {
  input, result, error, clipboardStatus, supportedYears,
  addExpense, removeExpense, updateExpense,
  exportToClipboard, importFromText,
} = useRateCardCalculator()

const showImportModal = ref(false)
const importText = ref('')

function openImportModal() {
  importText.value = ''
  showImportModal.value = true
}

function applyImport() {
  importFromText(importText.value)
  if (clipboardStatus.value !== 'error') {
    showImportModal.value = false
    importText.value = ''
  }
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(2) + '%'
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-top">
        <div>
          <h1>Rate Card Calculator</h1>
          <p class="subtitle">Estimate the gross rate you need to hit your financial goals after taxes.</p>
        </div>
        <div class="clipboard-actions">
          <button class="btn-clipboard export" @click="exportToClipboard" title="Copy current inputs as JSON to clipboard">
            ↑ Export JSON
          </button>
          <button class="btn-clipboard import" @click="openImportModal" title="Paste JSON to load inputs">
            ↓ Import JSON
          </button>
          <transition name="fade">
            <span v-if="clipboardStatus !== 'idle'" :class="['clipboard-toast', clipboardStatus]">
              <template v-if="clipboardStatus === 'exported'">Copied to clipboard</template>
              <template v-if="clipboardStatus === 'imported'">Imported successfully</template>
              <template v-if="clipboardStatus === 'error'">Import error</template>
            </span>
          </transition>
        </div>
      </div>
    </header>

    <!-- Import Modal -->
    <transition name="fade">
      <div v-if="showImportModal" class="modal-backdrop" @click.self="showImportModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>Import Rate Card JSON</h2>
            <button class="modal-close" @click="showImportModal = false">✕</button>
          </div>
          <p class="modal-hint">Paste your exported JSON below and click Apply.</p>
          <textarea
            v-model="importText"
            class="import-textarea"
            placeholder='{ "year": 2025, "workerType": "w2", ... }'
            spellcheck="false"
            autofocus
          />
          <div v-if="error && clipboardStatus === 'error'" class="modal-error">{{ error }}</div>
          <div class="modal-actions">
            <button class="btn-modal-cancel" @click="showImportModal = false">Cancel</button>
            <button class="btn-modal-apply" :disabled="!importText.trim()" @click="applyImport">Apply</button>
          </div>
        </div>
      </div>
    </transition>

    <main class="layout">
      <div class="panel inputs-panel">

        <!-- Tax Profile -->
        <section class="card">
          <h2>Tax Profile</h2>
          <div class="field-row">
            <label>Tax Year</label>
            <select v-model.number="input.year">
              <option v-for="y in supportedYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div class="field-row">
            <label>Worker Type</label>
            <div class="toggle-group">
              <button :class="['toggle', input.workerType === 'w2' ? 'active' : '']" @click="input.workerType = 'w2'">W-2</button>
              <button :class="['toggle', input.workerType === '1099' ? 'active' : '']" @click="input.workerType = '1099'">1099</button>
            </div>
          </div>
          <div class="field-row">
            <label>Filing Status</label>
            <select v-model="input.filingStatus">
              <option value="single">Single</option>
              <option value="married_joint">Married Filing Jointly</option>
              <option value="married_separate">Married Filing Separately</option>
              <option value="head_household">Head of Household</option>
            </select>
          </div>
        </section>

        <!-- Financial Requirements -->
        <section class="card">
          <h2>Financial Requirements</h2>
          <div class="field-row">
            <label>Target Net Income (monthly)</label>
            <div class="input-prefix">
              <span>$</span>
              <input type="number" min="0" v-model.number="input.targetNetMonthly" />
            </div>
          </div>
          <div class="field-row">
            <label>Hours per Week</label>
            <input type="number" min="1" max="168" v-model.number="input.hoursPerWeek" />
          </div>
          <div class="field-row">
            <label>Weeks per Year</label>
            <input type="number" min="1" max="52" v-model.number="input.weeksPerYear" />
          </div>
        </section>

        <!-- Expenses -->
        <section class="card">
          <div class="card-header-row">
            <h2>Monthly Expenses</h2>
            <button class="btn-add" @click="addExpense()">+ Add</button>
          </div>
          <div v-for="expense in input.expenses" :key="expense.id" class="expense-row">
            <input
              type="text"
              class="expense-label"
              :value="expense.label"
              @input="updateExpense(expense.id, { label: ($event.target as HTMLInputElement).value })"
              placeholder="Label"
            />
            <div class="input-prefix">
              <span>$</span>
              <input
                type="number"
                min="0"
                :value="expense.monthlyAmount"
                @input="updateExpense(expense.id, { monthlyAmount: parseFloat(($event.target as HTMLInputElement).value) || 0 })"
              />
            </div>
            <button class="btn-remove" @click="removeExpense(expense.id)" title="Remove">✕</button>
          </div>
          <p v-if="input.expenses.length === 0" class="empty-note">No expenses added.</p>
        </section>

      </div>

      <!-- Results Panel -->
      <div class="panel results-panel">
        <section class="card results-card">
          <h2>Results</h2>

          <div v-if="error" class="error-banner">{{ error }}</div>

          <template v-if="result">
            <div class="result-hero">
              <div class="result-hero-item">
                <span class="result-label">Required Gross (Annual)</span>
                <span class="result-value primary">{{ fmt(result.requiredGrossAnnual) }}</span>
              </div>
              <div class="result-hero-item">
                <span class="result-label">Required Gross (Monthly)</span>
                <span class="result-value">{{ fmt(result.requiredGrossMonthly) }}</span>
              </div>
              <div class="result-hero-item">
                <span class="result-label">Hourly Rate</span>
                <span class="result-value">{{ fmt(result.hourlyRate) }}</span>
              </div>
              <div class="result-hero-item">
                <span class="result-label">Weekly Rate</span>
                <span class="result-value">{{ fmt(result.weeklyRate) }}</span>
              </div>
            </div>

            <h3>Tax Breakdown</h3>
            <table class="breakdown-table">
              <tbody>
                <tr>
                  <td>Federal Income Tax</td>
                  <td class="amount">{{ fmt(result.taxBreakdown.federalIncomeTax) }}</td>
                </tr>
                <tr>
                  <td>MA State Income Tax</td>
                  <td class="amount">{{ fmt(result.taxBreakdown.massIncomeTax) }}</td>
                </tr>
                <tr v-if="input.workerType === 'w2'">
                  <td>FICA (SS + Medicare)</td>
                  <td class="amount">{{ fmt(result.taxBreakdown.ficaTax) }}</td>
                </tr>
                <tr v-if="input.workerType === '1099'">
                  <td>Self-Employment Tax</td>
                  <td class="amount">{{ fmt(result.taxBreakdown.selfEmploymentTax) }}</td>
                </tr>
                <tr class="total-row">
                  <td>Total Tax</td>
                  <td class="amount">{{ fmt(result.taxBreakdown.totalTax) }}</td>
                </tr>
                <tr class="rate-row">
                  <td>Effective Tax Rate</td>
                  <td class="amount">{{ fmtPct(result.taxBreakdown.effectiveTaxRate) }}</td>
                </tr>
              </tbody>
            </table>

            <h3>Income Summary</h3>
            <table class="breakdown-table">
              <tbody>
                <tr>
                  <td>Target Net (Annual)</td>
                  <td class="amount">{{ fmt(input.targetNetMonthly * 12) }}</td>
                </tr>
                <tr>
                  <td>Annual Expenses</td>
                  <td class="amount">{{ fmt(result.annualExpenses) }}</td>
                </tr>
                <tr class="total-row">
                  <td>Total Required Net</td>
                  <td class="amount">{{ fmt(result.totalRequiredNetAnnual) }}</td>
                </tr>
              </tbody>
            </table>

            <p class="disclaimer">Estimates only. Not tax advice. Consult a qualified tax professional.</p>
          </template>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f4f6f9;
  font-family: system-ui, sans-serif;
}

.app-header {
  background: #1a1f36;
  color: #fff;
  padding: 1.5rem 2rem;
}

.app-header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.6rem;
}

.subtitle {
  margin: 0;
  color: #a0aabf;
  font-size: 0.9rem;
}

.layout {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.inputs-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.results-panel {
  flex: 1;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #1a1f36;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header-row h2 {
  margin: 0;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.field-row label {
  font-size: 0.875rem;
  color: #444;
  min-width: 160px;
}

.field-row select,
.field-row input[type="number"] {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid #d0d5e0;
  border-radius: 5px;
  font-size: 0.875rem;
  background: #fafbfc;
}

.toggle-group {
  display: flex;
  gap: 0.4rem;
  flex: 1;
}

.toggle {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid #d0d5e0;
  border-radius: 5px;
  background: #fafbfc;
  cursor: pointer;
  font-size: 0.875rem;
  color: #555;
  transition: all 0.15s;
}

.toggle.active {
  background: #1a1f36;
  color: #fff;
  border-color: #1a1f36;
}

.input-prefix {
  display: flex;
  align-items: center;
  flex: 1;
  border: 1px solid #d0d5e0;
  border-radius: 5px;
  background: #fafbfc;
  overflow: hidden;
}

.input-prefix span {
  padding: 0 0.5rem;
  color: #888;
  font-size: 0.875rem;
  background: #f0f1f5;
  border-right: 1px solid #d0d5e0;
  height: 100%;
  display: flex;
  align-items: center;
}

.input-prefix input {
  border: none;
  background: transparent;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  flex: 1;
  outline: none;
}

.expense-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.expense-label {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid #d0d5e0;
  border-radius: 5px;
  font-size: 0.875rem;
  background: #fafbfc;
}

.expense-row .input-prefix {
  flex: 1.2;
}

.btn-add {
  padding: 0.35rem 0.75rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
}

.btn-remove:hover {
  color: #e53e3e;
}

.empty-note {
  font-size: 0.8rem;
  color: #aaa;
  text-align: center;
  margin: 0.5rem 0 0;
}

.results-card {
  position: sticky;
  top: 1.5rem;
}

.error-banner {
  background: #fff0f0;
  border: 1px solid #fca5a5;
  color: #c53030;
  border-radius: 5px;
  padding: 0.6rem 0.9rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.result-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.result-hero-item {
  background: #f4f6f9;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.result-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1f36;
}

.result-value.primary {
  font-size: 1.4rem;
  color: #2563eb;
}

.card h3 {
  font-size: 0.85rem;
  color: #1a1f36;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 1.25rem 0 0.5rem;
}

.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.breakdown-table td {
  padding: 0.4rem 0.25rem;
  border-bottom: 1px solid #f0f1f5;
  color: #333;
}

.breakdown-table .amount {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.total-row td {
  font-weight: 600;
  border-top: 2px solid #e2e6ef;
  border-bottom: none;
  color: #1a1f36;
}

.rate-row td {
  color: #2563eb;
  font-weight: 600;
  border-bottom: none;
}

.disclaimer {
  margin-top: 1.25rem;
  font-size: 0.75rem;
  color: #aaa;
  text-align: center;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.clipboard-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-clipboard {
  padding: 0.45rem 1rem;
  border: none;
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-clipboard:hover {
  opacity: 0.85;
}

.btn-clipboard.export {
  background: #2563eb;
  color: #fff;
}

.btn-clipboard.import {
  background: #e2e8f8;
  color: #1a1f36;
}

.clipboard-toast {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  white-space: nowrap;
}

.clipboard-toast.exported {
  background: #d1fae5;
  color: #065f46;
}

.clipboard-toast.imported {
  background: #dbeafe;
  color: #1e3a8a;
}

.clipboard-toast.error {
  background: #fee2e2;
  color: #991b1b;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  width: 560px;
  max-width: calc(100vw - 2rem);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1rem;
  color: #1a1f36;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1rem;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.modal-close:hover {
  color: #333;
}

.modal-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.import-textarea {
  width: 100%;
  height: 220px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: #213547;
  background: #f8f9fc;
  border: 1px solid #d0d5e0;
  border-radius: 6px;
  padding: 0.75rem;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.import-textarea:focus {
  border-color: #2563eb;
}

.modal-error {
  background: #fff0f0;
  border: 1px solid #fca5a5;
  color: #c53030;
  border-radius: 5px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-modal-cancel {
  padding: 0.45rem 1rem;
  border: 1px solid #d0d5e0;
  border-radius: 5px;
  background: #fff;
  color: #555;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-modal-cancel:hover {
  background: #f4f6f9;
}

.btn-modal-apply {
  padding: 0.45rem 1.1rem;
  border: none;
  border-radius: 5px;
  background: #2563eb;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-modal-apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-modal-apply:not(:disabled):hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }
  .layout {
    flex-direction: column;
    padding: 1rem;
  }
  .result-hero {
    grid-template-columns: 1fr;
  }
}
</style>