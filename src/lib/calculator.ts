import { CalculationInput, CalculationResult, RoundingMethod } from './types'

export function calculateSplit(input: CalculationInput): CalculationResult {
  const { totalAmount, people, serviceCharge, splitMethod, roundingMethod, items } = input
  
  // サービス料を計算
  const serviceChargeAmount = serviceCharge.type === 'percentage' 
    ? totalAmount * (serviceCharge.value / 100)
    : serviceCharge.value
  
  const totalWithCharge = totalAmount + serviceChargeAmount
  
  let perPersonAmounts: Array<{ personId: string; name: string; amount: number; roundedAmount: number }> = []
  
  switch (splitMethod) {
    case 'equal':
      perPersonAmounts = calculateEqualSplit(people, totalWithCharge)
      break
    case 'ratio':
      perPersonAmounts = calculateRatioSplit(people, totalWithCharge)
      break
    case 'manual':
      perPersonAmounts = calculateManualSplit(people)
      break
    case 'item':
      perPersonAmounts = calculateItemSplit(people, items || [], serviceChargeAmount)
      break
  }
  
  // 端数処理を適用
  const roundedAmounts = applyRounding(perPersonAmounts, roundingMethod, totalWithCharge)
  
  // 残差を計算
  const totalRounded = roundedAmounts.reduce((sum, person) => sum + person.roundedAmount, 0)
  const remainingAmount = totalWithCharge - totalRounded
  
  // 残差を上位N名に配分
  if (remainingAmount !== 0) {
    distributeRemainder(roundedAmounts, remainingAmount)
  }
  
  return {
    totalWithCharge,
    perPersonAmounts: roundedAmounts,
    remainingAmount: 0, // 残差配分後は0
    breakdown: {
      baseAmount: totalAmount,
      serviceCharge: serviceChargeAmount,
      totalBeforeRounding: totalWithCharge,
      roundingAdjustment: remainingAmount
    }
  }
}

function calculateEqualSplit(
  people: Array<{ id: string; name: string }>, 
  total: number
): Array<{ personId: string; name: string; amount: number; roundedAmount: number }> {
  const amountPerPerson = total / people.length
  return people.map(person => ({
    personId: person.id,
    name: person.name,
    amount: amountPerPerson,
    roundedAmount: amountPerPerson
  }))
}

function calculateRatioSplit(
  people: Array<{ id: string; name: string; ratio?: number }>, 
  total: number
): Array<{ personId: string; name: string; amount: number; roundedAmount: number }> {
  const totalRatio = people.reduce((sum, person) => sum + (person.ratio || 1), 0)
  
  return people.map(person => {
    const ratio = person.ratio || 1
    const amount = (total * ratio) / totalRatio
    return {
      personId: person.id,
      name: person.name,
      amount,
      roundedAmount: amount
    }
  })
}

function calculateManualSplit(
  people: Array<{ id: string; name: string; amount?: number }>
): Array<{ personId: string; name: string; amount: number; roundedAmount: number }> {
  return people.map(person => ({
    personId: person.id,
    name: person.name,
    amount: person.amount || 0,
    roundedAmount: person.amount || 0
  }))
}

function calculateItemSplit(
  people: Array<{ id: string; name: string }>,
  items: Array<{ id: string; name: string; price: number; assignedTo: string[] }>,
  serviceCharge: number
): Array<{ personId: string; name: string; amount: number; roundedAmount: number }> {
  const personAmounts = new Map<string, number>()
  
  // 各人の初期金額を0で設定
  people.forEach(person => {
    personAmounts.set(person.id, 0)
  })
  
  // アイテムごとの金額を配分
  items.forEach(item => {
    const amountPerPerson = item.price / item.assignedTo.length
    item.assignedTo.forEach(personId => {
      const currentAmount = personAmounts.get(personId) || 0
      personAmounts.set(personId, currentAmount + amountPerPerson)
    })
  })
  
  // サービス料を等分配分
  const serviceChargePerPerson = serviceCharge / people.length
  
  return people.map(person => {
    const amount = (personAmounts.get(person.id) || 0) + serviceChargePerPerson
    return {
      personId: person.id,
      name: person.name,
      amount,
      roundedAmount: amount
    }
  })
}

function applyRounding(
  amounts: Array<{ personId: string; name: string; amount: number; roundedAmount: number }>,
  method: RoundingMethod,
  total: number
): Array<{ personId: string; name: string; amount: number; roundedAmount: number }> {
  if (method === 'none') {
    return amounts
  }
  
  const roundingUnit = method === 'yen1' ? 1 : method === 'yen10' ? 10 : 100
  
  return amounts.map(person => ({
    ...person,
    roundedAmount: Math.round(person.amount / roundingUnit) * roundingUnit
  }))
}

function distributeRemainder(
  amounts: Array<{ personId: string; name: string; amount: number; roundedAmount: number }>,
  remainder: number
): void {
  // 金額の大きい順にソート
  const sorted = [...amounts].sort((a, b) => b.roundedAmount - a.roundedAmount)
  
  let remainingToDistribute = Math.abs(remainder)
  const increment = remainder > 0 ? 1 : -1
  
  // 上位から順に1円ずつ配分
  for (let i = 0; i < sorted.length && remainingToDistribute > 0; i++) {
    const person = amounts.find(p => p.personId === sorted[i].personId)
    if (person) {
      person.roundedAmount += increment
      remainingToDistribute--
    }
  }
} 