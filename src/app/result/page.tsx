'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalculationResult, CalculationInput } from '@/lib/types'
import { FileText, ClipboardCheck, Settings } from 'lucide-react'

export default function ResultPage() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [input, setInput] = useState<CalculationInput | null>(null)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        const decodedData = decodeURIComponent(atob(data))
        const parsedData = JSON.parse(decodedData)
        
        // 後方互換性のため、直接CalculationResultの場合とオブジェクトの場合の両方に対応
        if (parsedData.result) {
          setResult(parsedData.result)
          setInput(parsedData.input || null)
        } else {
          // 古い形式（resultのみ）
          setResult(parsedData)
        }
      } catch (error) {
        console.error("Failed to parse result data:", error)
        // Handle error state, e.g., show an error message
      }
    }
  }, [searchParams])

  const getPersonNameById = (id: string) => {
    const person = result?.perPersonAmounts.find(p => p.personId === id);
    return person ? person.name : '不明';
  };

  const roundingLabels: Record<string, string> = {
    yen1: '1円単位',
    yen10: '10円単位',
    yen100: '100円単位',
    none: '端数処理なし'
  }

  const splitMethodLabels: Record<string, string> = {
    equal: '均等割り',
    ratio: '比率割り',
    manual: '手動割り',
    item: 'アイテム割り'
  }

  const getPersonName = (id: string) => {
    return input?.people.find((p) => p.id === id)?.name || id
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>結果を読み込んでいます...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
       <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">割り勘計算結果</h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {input && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  入力内容の確認
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>合計金額: ¥{input.totalAmount.toLocaleString()}</div>
                <div>
                  サービス料・税:{' '}
                  {input.serviceCharge.type === 'percentage'
                    ? `${input.serviceCharge.value}%`
                    : `¥${input.serviceCharge.value.toLocaleString()}`}
                </div>
                <div>割り方: {splitMethodLabels[input.splitMethod]}</div>
                <div>端数処理: {roundingLabels[input.roundingMethod]}</div>
                <div>参加者（{input.people.length}名）:</div>
                <ul className="list-disc pl-6">
                  {input.people.map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
                {input.items && input.items.length > 0 && (
                  <div>
                    <div className="mt-4 mb-2">アイテム割り:</div>
                    <ul className="list-disc pl-6">
                      {input.items.map((item) => (
                        <li key={item.id}>
                          {item.name}: ¥{item.price.toLocaleString()} (
                          {item.assignedTo.map(getPersonName).join(', ')})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                支払い詳細
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.perPersonAmounts.map((person, index) => (
                  <div key={person.personId}>
                    <div className="flex items-center justify-between py-2">
                      <span className="font-medium">{person.name}</span>
                      <div className="text-right">
                        <div className="text-lg font-bold">¥{person.roundedAmount.toLocaleString()}</div>
                        {person.amount !== person.roundedAmount && (
                          <div className="text-sm text-muted-foreground">
                            (¥{person.amount.toLocaleString()})
                          </div>
                        )}
                      </div>
                    </div>
                    {index < result.perPersonAmounts.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {result.settlements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  清算方法
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.settlements.map((settlement, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="font-medium">{getPersonNameById(settlement.from)} → {getPersonNameById(settlement.to)}</span>
                      <div className="text-lg font-bold">¥{settlement.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
