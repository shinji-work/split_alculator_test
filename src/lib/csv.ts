import { CalculationResult } from './types'

export function resultToCsv(result: CalculationResult): string {
  const header = ['名前', '金額']
  const rows = result.perPersonAmounts.map(p => [p.name, p.roundedAmount.toString()])
  return [header, ...rows].map(r => r.join(',')).join('\n')
}
