import { CalculationInput, CalculationResult, RoundingMethod, Person, Settlement } from './types'

export function calculateSplit(input: CalculationInput): CalculationResult {
  const { totalAmount, people, serviceCharge, splitMethod, roundingMethod, items, paidBy } = input

  let baseAmount = 0
  let serviceChargeAmount = 0

  if (serviceCharge.type === 'percentage') {
    baseAmount = totalAmount / (1 + (serviceCharge.value || 0) / 100)
    serviceChargeAmount = totalAmount - baseAmount
  } else { // fixed
    baseAmount = totalAmount - (serviceCharge.value || 0)
    serviceChargeAmount = serviceCharge.value || 0
  }

  let perPersonAmounts: Array<{ personId: string; name: string; amount: number; roundedAmount: number }> = []
  
  switch (splitMethod) {
    case 'equal':
      perPersonAmounts = calculateEqualSplit(people, totalAmount)
      break
    case 'ratio':
      perPersonAmounts = calculateRatioSplit(people, totalAmount)
      break
    case 'manual':
      perPersonAmounts = calculateManualSplit(people, totalAmount)
      break
    case 'item':
      perPersonAmounts = calculateItemSplit(people, items || [], serviceChargeAmount)
      break
  }
  
  // 端数処理を適用
  const roundedAmounts = applyRounding(perPersonAmounts, roundingMethod, totalAmount)
  
  // 残差を計算
  const totalRounded = roundedAmounts.reduce((sum, person) => sum + person.roundedAmount, 0)
  const remainingAmount = totalAmount - totalRounded
  
  // 残差を上位N名に配分
  if (remainingAmount !== 0) {
    distributeRemainder(roundedAmounts, remainingAmount)
  }
  
  const settlements = calculateSettlement(roundedAmounts, people, paidBy, totalAmount)

  return {
    totalWithCharge: totalAmount,
    perPersonAmounts: roundedAmounts,
    settlements,
    remainingAmount: 0, // 残差配分後は0
    breakdown: {
      baseAmount: baseAmount,
      serviceCharge: serviceChargeAmount,
      totalBeforeRounding: totalAmount,
      roundingAdjustment: remainingAmount
    }
  }
}

function calculateSettlement(
  perPersonAmounts: Array<{ personId: string; name: string; roundedAmount: number }>,
  people: Person[],
  paidBy: string | undefined,
  totalAmount: number
): Settlement[] {
  if (!paidBy) {
    return []
  }

  const balances: { [personId: string]: number } = {}

  // Initialize balances
  people.forEach(person => {
    const amountOwed = perPersonAmounts.find(p => p.personId === person.id)?.roundedAmount || 0
    const amountPaid = person.id === paidBy ? totalAmount : 0
    balances[person.id] = amountPaid - amountOwed
  })

  const debtors = Object.keys(balances).filter(id => balances[id] < 0).map(id => ({ id, amount: balances[id] }))
  const creditors = Object.keys(balances).filter(id => balances[id] > 0).map(id => ({ id, amount: balances[id] }))

  const settlements: Settlement[] = []

  debtors.forEach(debtor => {
    let amountToSettle = -debtor.amount
    creditors.forEach(creditor => {
      if (amountToSettle <= 0) return

      const amountAvailable = creditor.amount
      const transferAmount = Math.min(amountToSettle, amountAvailable)

      if (transferAmount > 0) {
        settlements.push({
          from: debtor.id,
          to: creditor.id,
          amount: transferAmount
        })
        amountToSettle -= transferAmount
        creditor.amount -= transferAmount
      }
    })
  })

  return settlements
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
  const totalRatio = people.reduce((sum, person) => sum + (person.ratio || 0), 0)

  if (totalRatio === 0) {
    return calculateEqualSplit(people, total)
  }

  return people.map(person => {
    const ratio = person.ratio || 0
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
  people: Array<{ id: string; name: string; amount?: number }>,
  total: number
): Array<{ personId: string; name: string; amount: number; roundedAmount: number }> {
  const assignedAmounts = people.slice(0, -1).reduce((sum, person) => sum + (person.amount || 0), 0)
  const remainingAmount = total - assignedAmounts

  return people.map((person, index) => {
    const isLastPerson = index === people.length - 1
    const amount = isLastPerson ? remainingAmount : person.amount || 0
    return {
      personId: person.id,
      name: person.name,
      amount,
      roundedAmount: amount
    }
  })
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