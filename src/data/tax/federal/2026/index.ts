import type { FederalYearData } from '../../../../types/tax'

const federal2026: FederalYearData = {
  year: 2026,
  standardDeduction: {
    single:           16100,
    married_joint:    32200,
    married_separate: 16100,
    head_household:   24150,
  },
  brackets: {
    single: [
      { upTo: 12400,  rate: 0.10 },
      { upTo: 50400,  rate: 0.12 },
      { upTo: 105700, rate: 0.22 },
      { upTo: 201775, rate: 0.24 },
      { upTo: 256225, rate: 0.32 },
      { upTo: 640600, rate: 0.35 },
      { upTo: null,   rate: 0.37 },
    ],
    married_joint: [
      { upTo: 24800,  rate: 0.10 },
      { upTo: 100800, rate: 0.12 },
      { upTo: 211400, rate: 0.22 },
      { upTo: 403550, rate: 0.24 },
      { upTo: 512450, rate: 0.32 },
      { upTo: 768700, rate: 0.35 },
      { upTo: null,   rate: 0.37 },
    ],
    married_separate: [
      { upTo: 12400,  rate: 0.10 },
      { upTo: 50400,  rate: 0.12 },
      { upTo: 105700, rate: 0.22 },
      { upTo: 201775, rate: 0.24 },
      { upTo: 256225, rate: 0.32 },
      { upTo: 384350, rate: 0.35 },
      { upTo: null,   rate: 0.37 },
    ],
    head_household: [
      { upTo: 17700,  rate: 0.10 },
      { upTo: 67450,  rate: 0.12 },
      { upTo: 105700, rate: 0.22 },
      { upTo: 201775, rate: 0.24 },
      { upTo: 256200, rate: 0.32 },
      { upTo: 640600, rate: 0.35 },
      { upTo: null,   rate: 0.37 },
    ],
  },
}

export default federal2026
