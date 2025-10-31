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
            <li>人数に応じた均等割りや比率割り、金額指定、アイテム割りなど柔軟な分割方法に対応</li>
            <li>サービス料・税（パーセント/固定額）の加算や端数処理の設定が可能</li>
            <li>支払いを立て替えた人を指定して清算額を確認できる</li>
            <li>計算結果をCSV形式でエクスポートしたり、共有機能で簡単に伝達できる</li>
            <li>計算結果を美しい明細書形式の画像としてダウンロード可能</li>
            <li>短縮URLによる簡単なリンク共有と、QRコード生成機能</li>
            <li>SNS共有機能（LINE、Facebook、X（旧Twitter））</li>
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
              結果は以下の方法で簡単にチームメンバーへ共有できます：
            </p>
            <ul className="list-disc space-y-1 pl-6 mt-2 text-muted-foreground">
              <li><strong>共有ボタン</strong>: 短縮URL、QRコード、SNS共有（LINE、Facebook、X）が利用可能</li>
              <li><strong>画像ダウンロード</strong>: 明細書形式の画像をダウンロードして共有</li>
              <li><strong>CSV出力</strong>: 計算結果をCSVファイルとしてエクスポート</li>
              <li><strong>プレビュー</strong>: 共有用のリンクを開いて結果を確認</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>便利な機能</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">共有機能</h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              <li><strong>短縮URL</strong>: 長いURLを自動的に短縮し、共有しやすくします</li>
              <li><strong>QRコード</strong>: 計算結果のQRコードを生成し、スマートフォンで簡単にアクセス可能</li>
              <li><strong>SNS共有</strong>: LINE、Facebook、X（旧Twitter）で結果を共有</li>
              <li><strong>リンクコピー</strong>: 共有URLをクリップボードにコピー</li>
              <li><strong>プレビュー</strong>: 共有される結果ページを事前に確認</li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">画像・データ出力</h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              <li><strong>明細書画像</strong>: 計算結果を美しい明細書形式の画像としてダウンロード</li>
              <li><strong>CSV出力</strong>: 計算結果をCSV形式でエクスポートし、Excel等で編集可能</li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">その他の機能</h3>
            <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              <li>前回の設定をローカルストレージに保存し、再訪問時に自動復元</li>
              <li>人数の増減や割り方の変更に合わせてリアルタイムに結果を更新</li>
              <li>入力内容確認ページ（/confirm）で設定内容を一覧表示</li>
              <li>PWA対応により、ホーム画面に追加してオフライン利用可能</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>画面一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li>
              <strong>ホーム</strong>
              <p className="text-sm text-muted-foreground ml-2">
                割り勘条件の入力と計算を行うメインページ。結果の共有や出力もここから行えます。
              </p>
            </li>
            <li>
              <strong>入力内容確認</strong>
              <p className="text-sm text-muted-foreground ml-2">
                入力した設定内容を一覧で確認できます。ローカルストレージに保存された最新の設定が表示されます。
              </p>
            </li>
            <li>
              <strong>結果プレビュー</strong>
              <p className="text-sm text-muted-foreground ml-2">
                共有リンクからアクセスできる結果表示ページ。入力内容の確認と計算結果、清算方法が表示されます。
              </p>
            </li>
            <li>
              <strong>ドキュメント</strong>
              <p className="text-sm text-muted-foreground ml-2">
                このページです。アプリの使い方や機能の説明を確認できます。
              </p>
            </li>
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
