# ローカル環境でのStripe Webhook設定

ローカル環境でStripe webhookをテストするには、Stripe CLIを使用してwebhookイベントをローカルサーバーに転送する必要があります。

## セットアップ手順

### 1. Stripe CLIのインストール確認

```bash
stripe --version
```

### 2. Stripe CLIでログイン

```bash
stripe login
```

### 3. ローカルサーバーでwebhookを転送

開発サーバーを起動した状態で、別のターミナルで以下を実行：

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

このコマンドを実行すると、Stripe CLIがwebhookシークレットを表示します。例：
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### 4. .env.localの更新

Stripe CLIが表示したwebhookシークレットを`.env.local`の`STRIPE_WEBHOOK_SECRET`に設定してください：

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**重要**: Stripe CLIを起動するたびに、新しいwebhookシークレットが生成される場合があります。その場合は、`.env.local`を更新して開発サーバーを再起動してください。

### 5. テストイベントの送信

別のターミナルで、テストイベントを送信できます：

```bash
# checkout.session.completedイベントをトリガー
stripe trigger checkout.session.completed
```

または、実際にStripe Checkoutでテスト購入を行い、webhookが転送されることを確認します。

## トラブルシューティング

### Webhookが呼ばれない場合

1. **Stripe CLIが実行されているか確認**
   ```bash
   # 別のターミナルで実行中である必要があります
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **開発サーバーが起動しているか確認**
   ```bash
   npm run dev
   ```

3. **Webhookシークレットが正しいか確認**
   - Stripe CLIが表示したシークレットと`.env.local`の値が一致しているか
   - 開発サーバーを再起動したか

4. **ログを確認**
   - 開発サーバーのコンソールに`=== WEBHOOK RECEIVED ===`が表示されるか確認
   - エラーメッセージを確認

### Webhookは呼ばれるがクレジットが追加されない場合

1. **サーバーログを確認**
   - `Processing checkout session`のログを確認
   - `Credits to add: X`のログを確認
   - `Credits added successfully`のログを確認

2. **Price IDの一致を確認**
   - ログに表示されるPrice IDと`.env.local`のPrice IDが一致しているか確認
   - 環境変数が正しく読み込まれているか確認

3. **データベースを確認**
   - Supabaseの`profiles`テーブルで、クレジットが更新されているか確認

## 本番環境との違い

- **ローカル環境**: Stripe CLIを使用してwebhookを転送
- **本番環境**: Stripeダッシュボードでwebhookエンドポイントを設定

本番環境では、StripeダッシュボードのWebhooksセクションで、本番URLを設定し、本番用のwebhookシークレットを使用します。



