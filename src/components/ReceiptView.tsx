'use client'

import React from 'react'
import { CalculationResult, CalculationInput } from '@/lib/types'

interface ReceiptViewProps {
  result: CalculationResult
  input: CalculationInput | null
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

export const ReceiptView: React.FC<ReceiptViewProps> = ({ result, input }) => {
  const getPersonName = (id: string) => {
    return input?.people.find((p) => p.id === id)?.name || id
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  }

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto" style={{ width: '210mm', minHeight: '297mm' }} suppressHydrationWarning>
      {/* ヘッダー */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">割り勘計算明細書</h1>
        <p className="text-sm text-gray-600">{formatDate(new Date())}</p>
      </div>

      {/* 基本情報 */}
      {input && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            基本情報
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">合計金額:</span>
              <span className="ml-2 font-semibold text-gray-900">¥{Math.round(input.totalAmount).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">サービス料・税:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {input.serviceCharge.type === 'percentage'
                  ? `${input.serviceCharge.value}%`
                  : `¥${Math.round(input.serviceCharge.value).toLocaleString()}`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">割り方:</span>
              <span className="ml-2 font-semibold text-gray-900">{splitMethodLabels[input.splitMethod]}</span>
            </div>
            <div>
              <span className="text-gray-600">端数処理:</span>
              <span className="ml-2 font-semibold text-gray-900">{roundingLabels[input.roundingMethod]}</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-600">参加者:</span>
            <div className="mt-2 text-sm">
              {input.people.map((p, idx) => (
                <span key={p.id} className="inline-block mr-3 mb-1">
                  {idx + 1}. {p.name}
                </span>
              ))}
            </div>
          </div>
          {input.items && input.items.length > 0 && (
            <div className="mt-4">
              <span className="text-gray-600">アイテム割り:</span>
              <div className="mt-2 text-sm">
                {input.items.map((item) => (
                  <div key={item.id} className="mb-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2">¥{Math.round(item.price).toLocaleString()}</span>
                    <span className="ml-2 text-gray-500">
                      ({item.assignedTo.map((id) => getPersonName(id)).join(', ')})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 内訳 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
          内訳
        </h2>
        <div className="bg-gray-50 p-4 rounded">
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <span className="text-gray-600">基本料金:</span>
            <span className="text-right font-semibold">¥{Math.round(result.breakdown.baseAmount).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <span className="text-gray-600">サービス料・税:</span>
            <span className="text-right font-semibold">¥{Math.round(result.breakdown.serviceCharge).toLocaleString()}</span>
          </div>
          {result.breakdown.roundingAdjustment !== 0 && (
            <div className="grid grid-cols-2 gap-2 text-sm mb-2 border-t border-gray-300 pt-2">
              <span className="text-gray-600">端数調整:</span>
              <span className="text-right font-semibold">
                {result.breakdown.roundingAdjustment > 0 ? '+' : ''}¥{Math.round(result.breakdown.roundingAdjustment).toLocaleString()}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm font-bold text-gray-900 border-t-2 border-gray-400 pt-2 mt-2">
            <span>総計:</span>
            <span className="text-right">¥{Math.round(result.totalWithCharge).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 支払い詳細 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
          支払い詳細
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">氏名</th>
              <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">支払金額</th>
            </tr>
          </thead>
          <tbody>
            {result.perPersonAmounts.map((person, index) => (
              <tr key={person.personId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{person.name}</td>
                <td className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  ¥{Math.round(person.roundedAmount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">合計</td>
              <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">
                ¥{Math.round(result.perPersonAmounts.reduce((sum, p) => sum + p.roundedAmount, 0)).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 清算方法 */}
      {result.settlements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
            清算方法
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">支払う人</th>
                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">→</th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">受け取る人</th>
                <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">金額</th>
              </tr>
            </thead>
            <tbody>
              {result.settlements.map((settlement, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{getPersonName(settlement.from)}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-600">→</td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{getPersonName(settlement.to)}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    ¥{Math.round(settlement.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* フッター */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
        <p>この明細書は割り勘計算アプリにより自動生成されました。</p>
      </div>
    </div>
  )
}

