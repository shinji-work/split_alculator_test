import { CalculationResult } from './types'

export function resultToCsv(result: CalculationResult): string {
  const header = ['名前', '金額', '税抜金額']
  const ratio = result.breakdown.baseAmount / result.totalWithCharge
  const rows = result.perPersonAmounts.map(p => {
    const preTax = Math.round(p.amount * ratio)
    return [p.name, p.roundedAmount.toString(), preTax.toString()]
  })
  return [header, ...rows].map(r => r.join(',')).join('\n')
}
