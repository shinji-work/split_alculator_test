'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalculationResult } from '@/lib/types'
import { FileText, ClipboardCheck } from 'lucide-react'

export default function ResultPage() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<CalculationResult | null>(null)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        const decodedData = decodeURIComponent(atob(data))
        const parsedResult: CalculationResult = JSON.parse(decodedData)
        setResult(parsedResult)
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
                  <>
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
                  </>
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
