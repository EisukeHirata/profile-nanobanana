# Vercel での Webhook 設定

Vercel のプレビューデプロイメントで Stripe webhook を動作させるための設定方法です。

## 問題

Vercel のプレビューデプロイメントはデフォルトで保護されており、Stripe からの webhook リクエストが認証ページでブロックされます。

## 解決方法

### 方法 1: Vercel ダッシュボードで設定（推奨）

1. **Vercel ダッシュボードにアクセス**

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

### 方法 2: ローカル環境でのテスト（推奨）

プレビューデプロイメントでのテストの代わりに、ローカル環境でテストすることを強く推奨します。

## 本番環境での設定

本番環境では、Stripe ダッシュボードで webhook エンドポイントを設定します：

1. **Stripe ダッシュボード**

   - Developers → Webhooks
   - "Add endpoint" をクリック

2. **エンドポイント URL を設定**

   ```
   https://your-production-domain.com/api/webhooks/stripe
   ```

3. **イベントを選択**

   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. **Webhook シークレットを取得**
   - エンドポイント作成後、Signing secret をコピー
   - Vercel の環境変数に設定：
     ```
     STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
     ```

## ローカル環境でのテスト

プレビューデプロイメントでテストする代わりに、ローカル環境でテストすることを推奨します：

1. **Stripe CLI を起動**

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Webhook シークレットを設定**

   - Stripe CLI が表示したシークレットを`.env.local`に設定

3. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

詳細は`WEBHOOK_LOCAL_SETUP.md`を参照してください。

## トラブルシューティング

### Webhook が保護ページでブロックされる場合

1. **Vercel ダッシュボードで設定を確認**

   - Settings → Deployment Protection
   - Bypass Paths に`/api/webhooks/stripe`が追加されているか確認
   - 設定が正しく保存されているか確認

2. **再デプロイ**

   - 設定変更後、新しいデプロイメントを作成

3. **ローカル環境でのテストを推奨**
   - プレビューデプロイメントでのテストは複雑なため、ローカル環境でのテストを推奨します
   - 詳細は`WEBHOOK_LOCAL_SETUP.md`を参照してください

### Webhook は呼ばれるがクレジットが追加されない場合

1. **Vercel のログを確認**

   - Vercel ダッシュボード → Deployments → 該当デプロイメント → Functions
   - Webhook のログを確認

2. **環境変数を確認**

   - Vercel ダッシュボード → Settings → Environment Variables
   - `STRIPE_WEBHOOK_SECRET`と Price ID が正しく設定されているか確認

3. **Supabase のデータを確認**
   - Supabase ダッシュボードで`profiles`テーブルを確認
   - クレジットが更新されているか確認
