import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function DocsPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-8 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">ドキュメント</h1>
        <p className="text-muted-foreground">割り勘計算アプリの概要と使い方</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>アプリの概要</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            このアプリは、飲み会や旅行などで発生する支払いを簡単かつ公平に割り勘するためのツールです。
            合計金額やサービス料、参加者ごとの条件を入力すると、最適な支払額を自動で算出します。
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>人数に応じた均等割りや比率割り、金額指定など柔軟な分割方法に対応</li>
            <li>サービス料・税（パーセント/固定額）の加算や端数処理の設定が可能</li>
            <li>支払いを立て替えた人を指定して清算額を確認できる</li>
            <li>計算結果をCSV形式でエクスポートしたり、共有機能で簡単に伝達できる</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>基本的な使い方</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">1. 合計金額とサービス料の入力</h2>
            <p className="text-muted-foreground">
              まず、会計の合計金額を入力し、必要に応じてサービス料・税を設定します。
              サービス料はパーセントか固定額のどちらかを選び、端数処理の方法も指定できます。
            </p>
          </div>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold">2. 参加者を登録</h2>
            <p className="text-muted-foreground">
              割り勘に参加するメンバーを追加し、名前を入力します。
              比率割りや金額指定を利用する場合は、各参加者に対して比率や金額を設定してください。
            </p>
          </div>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold">3. 立て替えた人を選ぶ</h2>
            <p className="text-muted-foreground">
              実際に支払いを行った人を選択すると、その人に戻すべき金額が自動的に計算されます。
            </p>
          </div>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold">4. 計算と共有</h2>
            <p className="text-muted-foreground">
              入力内容を確認したら「計算する」を押して結果を表示します。
              結果は共有機能やCSV出力で簡単にチームメンバーへ共有できます。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>便利な機能</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-6">
            <li>前回の設定をローカルストレージに保存し、再訪問時に自動復元</li>
            <li>人数の増減や割り方の変更に合わせてリアルタイムに結果を更新</li>
            <li>共有API対応端末では、共有ボタンから直接メッセージアプリ等に送信可能</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/">アプリに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
