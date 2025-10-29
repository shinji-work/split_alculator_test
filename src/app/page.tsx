'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calculator, Users, Settings, Share2, QrCode, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateSplit } from '@/lib/calculator'
import { resultToCsv } from '@/lib/csv'
import { CalculationInput, CalculationResult, Person, SplitMethod, RoundingMethod } from '@/lib/types'

const initialPeople: Person[] = [
  { id: '1', name: '田中さん' },
  { id: '2', name: '佐藤さん' }
]

export default function Home() {
  // 基本状態
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [serviceChargeType, setServiceChargeType] = useState<'percentage' | 'fixed'>('percentage')
  const [serviceChargeValue, setServiceChargeValue] = useState<number>(10)
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal')
  const [roundingMethod, setRoundingMethod] = useState<RoundingMethod>('yen1')
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // 初回ロード時にlocalStorageから設定を復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('split-calculator-settings')
        if (saved) {
          const settings = JSON.parse(saved)
          setTotalAmount(settings.totalAmount || 0)
          setServiceChargeType(settings.serviceChargeType || 'percentage')
          setServiceChargeValue(settings.serviceChargeValue || 10)
          setSplitMethod(settings.splitMethod || 'equal')
          setRoundingMethod(settings.roundingMethod || 'yen1')
          setPeople(settings.people || initialPeople)
        }
      } catch (error) {
        console.warn('Failed to load settings from localStorage:', error)
      }
      setIsLoaded(true)
    }
  }, [])

  // 設定が変更された時にlocalStorageに保存（初回ロード後のみ）
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        const settings = {
          totalAmount,
          serviceChargeType,
          serviceChargeValue,
          splitMethod,
          roundingMethod,
          people
        }
        localStorage.setItem('split-calculator-settings', JSON.stringify(settings))
      } catch (error) {
        console.warn('Failed to save settings to localStorage:', error)
      }
    }
  }, [isLoaded, totalAmount, serviceChargeType, serviceChargeValue, splitMethod, roundingMethod, people])

  const handleCalculate = () => {
    if (totalAmount <= 0 || people.length === 0) {
      alert('合計金額と参加者を入力してください')
      return
    }

    const input: CalculationInput = {
      totalAmount,
      people,
      serviceCharge: {
        type: serviceChargeType,
        value: serviceChargeValue
      },
      splitMethod,
      roundingMethod
    }

    const calculationResult = calculateSplit(input)
    setResult(calculationResult)
  }

  const addPerson = () => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name: `参加者${people.length + 1}`
    }
    setPeople([...people, newPerson])
  }

  const removePerson = (id: string) => {
    if (people.length > 1) {
      setPeople(people.filter(person => person.id !== id))
    }
  }

  const updatePersonName = (id: string, name: string) => {
    setPeople(people.map(person => 
      person.id === id ? { ...person, name } : person
    ))
  }

  const updatePersonRatio = (id: string, ratio: number) => {
    setPeople(people.map(person =>
      person.id === id ? { ...person, ratio } : person
    ))
  }

  const updatePersonAmount = (id: string, amount: number) => {
    setPeople(people.map(person =>
      person.id === id ? { ...person, amount } : person
    ))
  }

  const handleShare = async () => {
    if (!result) return

    const shareText = `割り勘計算結果\n合計: ¥${result.totalWithCharge.toLocaleString()}\n\n${result.perPersonAmounts.map(p => `${p.name}: ¥${p.roundedAmount.toLocaleString()}`).join('\n')}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: '割り勘計算結果',
          text: shareText
        })
      } catch (error) {
        console.log('共有がキャンセルされました')
      }
    } else {
      // フォールバック: クリップボードにコピー
      try {
        await navigator.clipboard.writeText(shareText)
        alert('結果をクリップボードにコピーしました')
      } catch (error) {
        console.error('コピーに失敗しました:', error)
      }
    }
  }

  const handleExportCSV = () => {
    if (!result) return
    const csv = resultToCsv(result)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'split-result.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          <Calculator className="h-8 w-8" />
          割り勘計算機
        </h1>
        <p className="text-muted-foreground">簡単・正確・共有可能</p>
      </div>

      <div className="space-y-6">
        {/* 基本入力 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              基本設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">合計金額（円）</label>
              <Input
                type="number"
                inputMode="numeric"
                value={totalAmount || ''}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                placeholder="例: 10000"
                className="text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">サービス料・税</label>
              <div className="flex gap-2">
                <select
                  value={serviceChargeType}
                  onChange={(e) => setServiceChargeType(e.target.value as 'percentage' | 'fixed')}
                  className="px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="percentage">パーセント</option>
                  <option value="fixed">固定額</option>
                </select>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={serviceChargeValue || ''}
                  onChange={(e) => setServiceChargeValue(Number(e.target.value))}
                  placeholder={serviceChargeType === 'percentage' ? '10' : '500'}
                  className="flex-1"
                />
                <span className="px-3 py-2 text-sm text-muted-foreground">
                  {serviceChargeType === 'percentage' ? '%' : '円'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">端数処理</label>
              <select
                value={roundingMethod}
                onChange={(e) => setRoundingMethod(e.target.value as RoundingMethod)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="yen1">1円単位</option>
                <option value="yen10">10円単位</option>
                <option value="yen100">100円単位</option>
                <option value="none">端数処理なし</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 参加者管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              参加者（{people.length}名）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">分割方法</label>
              <select
                value={splitMethod}
                onChange={(e) => setSplitMethod(e.target.value as SplitMethod)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="equal">均等割り</option>
                <option value="ratio">比率割り</option>
                <option value="manual">金額指定</option>
              </select>
            </div>
            {people.map((person, index) => (
              <div key={person.id} className="flex gap-2 items-center">
                <Input
                  value={person.name}
                  onChange={(e) => updatePersonName(person.id, e.target.value)}
                  placeholder={`参加者${index + 1}`}
                  className="flex-1"
                />
                {splitMethod === 'ratio' && (
                  <div className="flex items-center">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={person.ratio || ''}
                      onChange={(e) => updatePersonRatio(person.id, Number(e.target.value))}
                      placeholder="比率"
                      className="w-20 text-right"
                    />
                    <span className="ml-1">%</span>
                  </div>
                )}
                {splitMethod === 'manual' && (
                  <div className="flex items-center">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={person.amount || ''}
                      onChange={(e) => updatePersonAmount(person.id, Number(e.target.value))}
                      placeholder="金額"
                      className="w-28 text-right"
                    />
                    <span className="ml-1">円</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removePerson(person.id)}
                  disabled={people.length <= 1}
                >
                  ×
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addPerson} className="w-full">
              + 参加者を追加
            </Button>
          </CardContent>
        </Card>

        {/* 入力内容確認ボタン */}
        <Button asChild variant="outline" className="w-full">
          <Link href="/confirm">入力内容確認</Link>
        </Button>

        {/* 計算ボタン */}
        <Button onClick={handleCalculate} size="lg" className="w-full">
          <Calculator className="h-5 w-5 mr-2" />
          計算する
        </Button>

        {/* 結果表示 */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                計算結果
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    共有
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                合計: ¥{result.totalWithCharge.toLocaleString()}
                （基本料金: ¥{result.breakdown.baseAmount.toLocaleString()} +
                サービス料: ¥{result.breakdown.serviceCharge.toLocaleString()}）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.perPersonAmounts.map(person => (
                  <div key={person.personId} className="flex justify-between items-center py-2 border-b">
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
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
