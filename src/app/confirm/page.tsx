'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Person, Item } from '@/lib/types'

interface Settings {
  totalAmount: number
  serviceChargeType: 'percentage' | 'fixed'
  serviceChargeValue: number
  splitMethod: string
  roundingMethod: string
  people: Person[]
  items?: Item[]
}

export default function ConfirmPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('split-calculator-settings')
        if (saved) {
          setSettings(JSON.parse(saved))
        }
      } catch (error) {
        console.warn('Failed to load settings from localStorage:', error)
      }
    }
    setLoaded(true)
  }, [])

  if (!loaded) {
    return null
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <p>設定が見つかりませんでした。</p>
        <Button asChild className="mt-4">
          <Link href="/">戻る</Link>
        </Button>
      </div>
    )
  }

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

  const personName = (id: string) =>
    settings.people.find((p) => p.id === id)?.name || id

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>入力内容の確認</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>合計金額: ¥{settings.totalAmount.toLocaleString()}</div>
          <div>
            サービス料・税:{' '}
            {settings.serviceChargeType === 'percentage'
              ? `${settings.serviceChargeValue}%`
              : `¥${settings.serviceChargeValue.toLocaleString()}`}
          </div>
          <div>割り方: {splitMethodLabels[settings.splitMethod]}</div>
          <div>端数処理: {roundingLabels[settings.roundingMethod]}</div>
          <div>参加者（{settings.people.length}名）:</div>
          <ul className="list-disc pl-6">
            {settings.people.map((p) => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
          {settings.items && settings.items.length > 0 && (
            <div>
              <div className="mt-4 mb-2">アイテム割り:</div>
              <ul className="list-disc pl-6">
                {settings.items.map((item) => (
                  <li key={item.id}>
                    {item.name}: ¥{item.price.toLocaleString()} (
                    {item.assignedTo.map(personName).join(', ')})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Button asChild className="w-full">
        <Link href="/">戻る</Link>
      </Button>
    </div>
  )
}

