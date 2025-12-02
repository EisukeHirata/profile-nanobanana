# VercelでのWebhook設定

VercelのプレビューデプロイメントでStripe webhookを動作させるための設定方法です。

## 問題

Vercelのプレビューデプロイメントはデフォルトで保護されており、Stripeからのwebhookリクエストが認証ページでブロックされます。

## 解決方法

### 方法1: Vercelダッシュボードで設定（推奨）

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com にログイン
   - プロジェクトを選択

2. **デプロイメント保護の設定**
   - Settings → Deployment Protection
   - "Bypass Paths" セクションに以下を追加：
     ```
     /api/webhooks/stripe
     ```

3. **保存して再デプロイ**
   - 設定を保存後、新しいデプロイメントを作成

### 方法2: vercel.jsonを使用（既に設定済み）

プロジェクトルートに`vercel.json`を作成しました：

```json
{
  "deploymentProtection": {
    "bypassPaths": [
      "/api/webhooks/stripe"
    ]
  }
}
```

この設定が反映されない場合は、Vercelダッシュボードでの設定（方法1）を使用してください。

## 本番環境での設定

本番環境では、Stripeダッシュボードでwebhookエンドポイントを設定します：

1. **Stripeダッシュボード**
   - Developers → Webhooks
   - "Add endpoint" をクリック

2. **エンドポイントURLを設定**
   ```
   https://your-production-domain.com/api/webhooks/stripe
   ```

3. **イベントを選択**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. **Webhookシークレットを取得**
   - エンドポイント作成後、Signing secretをコピー
   - Vercelの環境変数に設定：
     ```
     STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
     ```

## ローカル環境でのテスト

プレビューデプロイメントでテストする代わりに、ローカル環境でテストすることを推奨します：

1. **Stripe CLIを起動**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Webhookシークレットを設定**
   - Stripe CLIが表示したシークレットを`.env.local`に設定

3. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

詳細は`WEBHOOK_LOCAL_SETUP.md`を参照してください。

## トラブルシューティング

### Webhookが保護ページでブロックされる場合

1. **Vercelダッシュボードで設定を確認**
   - Settings → Deployment Protection
   - Bypass Pathsに`/api/webhooks/stripe`が追加されているか確認

2. **vercel.jsonの確認**
   - プロジェクトルートに`vercel.json`が存在するか確認
   - 設定が正しいか確認

3. **再デプロイ**
   - 設定変更後、新しいデプロイメントを作成

### Webhookは呼ばれるがクレジットが追加されない場合

1. **Vercelのログを確認**
   - Vercelダッシュボード → Deployments → 該当デプロイメント → Functions
   - Webhookのログを確認

2. **環境変数を確認**
   - Vercelダッシュボード → Settings → Environment Variables
   - `STRIPE_WEBHOOK_SECRET`とPrice IDが正しく設定されているか確認

3. **Supabaseのデータを確認**
   - Supabaseダッシュボードで`profiles`テーブルを確認
   - クレジットが更新されているか確認

