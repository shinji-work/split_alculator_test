'use client'

import { Fragment, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Calculator, Users, Settings, Share2, Download, X, CreditCard, User, FileText, ClipboardCheck } from 'lucide-react'
import { ShareModal } from '@/components/ShareModal'
import { ReceiptView } from '@/components/ReceiptView'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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
  const [paidBy, setPaidBy] = useState<string>('')
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [calculationInput, setCalculationInput] = useState<CalculationInput | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [breakdownDetails, setBreakdownDetails] = useState<{ baseAmount: number; serviceCharge: number } | null>(null)
  const [amountPerPerson, setAmountPerPerson] = useState<number>(0)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const resultCardRef = useRef<HTMLDivElement>(null)
  const downloadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (totalAmount > 0) {
      let base = 0
      let charge = 0
      if (serviceChargeType === 'percentage') {
        base = totalAmount / (1 + (serviceChargeValue || 0) / 100)
        charge = totalAmount - base
      } else { // fixed
        base = totalAmount - (serviceChargeValue || 0)
        charge = serviceChargeValue || 0
      }
      setBreakdownDetails({ baseAmount: Math.round(base), serviceCharge: Math.round(charge) })
    } else {
      setBreakdownDetails(null)
    }
  }, [totalAmount, serviceChargeType, serviceChargeValue])

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
          roundingMethod,
          people
        }
        localStorage.setItem('split-calculator-settings', JSON.stringify(settings))
      } catch (error) {
        console.warn('Failed to save settings to localStorage:', error)
      }
    }
  }, [isLoaded, totalAmount, serviceChargeType, serviceChargeValue, roundingMethod, people])

  useEffect(() => {
    if (people.length > 0 && !people.find(p => p.id === paidBy)) {
      setPaidBy(people[0].id)
    }
  }, [people, paidBy])

  const handleCalculate = () => {
    if (totalAmount <= 0 || people.length === 0) {
      alert('合計金額と参加者を入力してください')
      return
    }

    if (splitMethod === 'ratio') {
      const totalRatio = people.reduce((sum, person) => sum + (person.ratio || 0), 0)
      if (totalRatio > 101) {
        alert('比率の合計が101%を超えています。')
        return
      }
    }

    if (splitMethod === 'manual') {
      const assignedAmounts = people.slice(0, -1).reduce((sum, person) => sum + (person.amount || 0), 0)
      if (assignedAmounts > totalAmount) {
        alert('指定した金額の合計が、合計金額を超えています。')
        return
      }
    }

    const input: CalculationInput = {
      totalAmount,
      people,
      serviceCharge: {
        type: serviceChargeType,
        value: serviceChargeValue
      },
      splitMethod,
      roundingMethod,
      paidBy
    }

    const calculationResult = calculateSplit(input)
    setResult(calculationResult)
    setCalculationInput(input)
    if (calculationResult.perPersonAmounts.length > 0) {
      const total = calculationResult.perPersonAmounts.reduce((sum, p) => sum + p.roundedAmount, 0);
      setAmountPerPerson(total / calculationResult.perPersonAmounts.length);
    }
  }

  const getPersonName = (id: string) => {
    return people.find(p => p.id === id)?.name || ''
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
    <div className="min-h-screen bg-gray-50">
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        result={result}
        resultRef={resultCardRef}
        downloadRef={downloadRef}
        input={calculationInput || undefined}
      />
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">割り勘計算機</h1>
          <Button asChild variant="link" className="px-0">
            <Link href="/docs">使い方ドキュメント</Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">合計金額</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">参加者数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{people.length}人</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">1人あたりの金額</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{Math.round(amountPerPerson).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">（平均）</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  基本設定
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="total-amount">合計金額（円）</Label>
                  <Input
                    id="total-amount"
                    type="number"
                    inputMode="numeric"
                    value={totalAmount || ''}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    placeholder="例: 10000"
                    className="text-lg"
                  />
                  {breakdownDetails && (
                    <p className="text-sm text-muted-foreground">
                      （基本料金: ¥{breakdownDetails.baseAmount.toLocaleString()} + サービス料: ¥{breakdownDetails.serviceCharge.toLocaleString()}）
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>サービス料・税</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={serviceChargeType}
                      onValueChange={(value) => setServiceChargeType(value as 'percentage' | 'fixed')}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">パーセント</SelectItem>
                        <SelectItem value="fixed">固定額</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={serviceChargeValue || ''}
                      onChange={(e) => setServiceChargeValue(Number(e.target.value))}
                      placeholder="10"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {serviceChargeType === 'percentage' ? '%' : '円'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rounding-method">端数処理</Label>
                  <Select
                    value={roundingMethod}
                    onValueChange={(value) => setRoundingMethod(value as RoundingMethod)}
                  >
                    <SelectTrigger id="rounding-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yen1">1円単位</SelectItem>
                      <SelectItem value="yen10">10円単位</SelectItem>
                      <SelectItem value="yen100">100円単位</SelectItem>
                      <SelectItem value="none">端数処理なし</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid-by">支払った人</Label>
                  <Select
                    value={paidBy}
                    onValueChange={(value) => setPaidBy(value)}
                  >
                    <SelectTrigger id="paid-by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  参加者（{people.length}名）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="split-method">分割方法</Label>
                  <Select
                    value={splitMethod}
                    onValueChange={(value) => setSplitMethod(value as SplitMethod)}
                  >
                    <SelectTrigger id="split-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal">均等割り</SelectItem>
                      <SelectItem value="ratio">比率割り</SelectItem>
                      <SelectItem value="manual">金額指定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  {people.map((person, index) => (
                    <div key={person.id} className="flex items-center gap-3">
                      <Input
                        value={person.name}
                        onChange={(e) => updatePersonName(person.id, e.target.value)}
                        placeholder={`参加者${index + 1}`}
                        className="flex-1"
                      />
                      {splitMethod === 'ratio' && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={person.ratio || ''}
                            onChange={(e) => updatePersonRatio(person.id, Number(e.target.value))}
                            placeholder="比率"
                            className="w-24 text-right"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      )}
                      {splitMethod === 'manual' && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={person.amount || ''}
                            onChange={(e) => updatePersonAmount(person.id, Number(e.target.value))}
                            placeholder="金額"
                            className="w-32 text-right"
                          />
                          <span className="text-sm text-muted-foreground">円</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePerson(person.id)}
                        disabled={people.length <= 1}
                        aria-label="参加者を削除"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addPerson} className="w-full">
                  + 参加者を追加
                </Button>
              </CardContent>
            </Card>
            <Button asChild variant="outline" className="w-full">
              <Link href="/confirm">入力内容確認</Link>
            </Button>
            <Button onClick={handleCalculate} size="lg" className="w-full btn-primary-green">
              <Calculator className="h-5 w-5 mr-2" />
              計算する
            </Button>
          </div>
          <div className="space-y-6 relative">
            {!result && (
              <Card className="h-full flex flex-col items-center justify-center text-center p-8">
                <CardHeader>
                  <CardTitle>結果はここに表示されます</CardTitle>
                  <CardDescription>
                    左側のフォームに入力して、「計算する」ボタンを押してください。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calculator className="h-16 w-16 text-muted-foreground" />
                </CardContent>
              </Card>
            )}
            {result && (
              <>
                {/* 画像ダウンロード用（非表示、明細書デザイン） */}
                <div ref={downloadRef} className="absolute left-[-9999px]">
                  {calculationInput && (
                    <ReceiptView result={result} input={calculationInput} />
                  )}
                </div>
                {/* 表示用（入力確認欄なし） */}
                <div ref={resultCardRef} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          計算結果
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            共有
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleExportCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            CSV
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.perPersonAmounts.map((person, index) => (
                          <Fragment key={person.personId}>
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
                          </Fragment>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  {result.settlements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardCheck className="h-5 w-5" />
                          清算結果
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {result.settlements.map((settlement, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                              <span className="font-medium">{getPersonName(settlement.from)} → {getPersonName(settlement.to)}</span>
                              <div className="text-lg font-bold">¥{settlement.amount.toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
