# .env.local 設定例

プラン変更に伴う環境変数の設定方法です。

## 必要な環境変数

Stripeダッシュボードで各プランのPrice IDを作成し、以下の環境変数に設定してください。

### サブスクリプションプラン

```env
# Starter プラン ($9.99/月, 25 credits)
NEXT_PUBLIC_STRIPE_PRICE_SUB_BASIC=price_xxxxxxxxxxxxx

# Pro プラン ($19.99/月, 55 credits)
NEXT_PUBLIC_STRIPE_PRICE_SUB_PRO=price_xxxxxxxxxxxxx

# Premium プラン ($49.99/月, 140 credits)
NEXT_PUBLIC_STRIPE_PRICE_SUB_PREMIUM=price_xxxxxxxxxxxxx
```

### ワンタイム購入プラン

```env
# 10-credit Pack ($4.49, 10 credits)
NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL=price_xxxxxxxxxxxxx

# 30-credit Pack ($11.99, 30 credits)
NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE=price_xxxxxxxxxxxxx

# 100-credit Pack ($29.99, 100 credits)
NEXT_PUBLIC_STRIPE_PRICE_CREDIT_XLARGE=price_xxxxxxxxxxxxx
```

### その他のStripe設定

```env
# Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Stripeダッシュボードでの設定手順

1. **サブスクリプションプランの作成**
   - Products → Create product
   - 各プラン（Starter, Pro, Premium）を作成
   - Recurring pricing を選択
   - 価格と請求サイクル（Monthly）を設定
   - 作成されたPrice IDをコピー

2. **ワンタイム購入プランの作成**
   - Products → Create product
   - 各パック（10-credit, 30-credit, 100-credit）を作成
   - One-time pricing を選択
   - 価格を設定（USD）
   - 作成されたPrice IDをコピー

3. **環境変数の設定**
   - 上記のPrice IDを`.env.local`ファイルに設定
   - アプリケーションを再起動

## 注意事項

- Price IDは`price_`で始まる文字列です
- テスト環境と本番環境で異なるPrice IDを使用します
- 本番環境では`STRIPE_SECRET_KEY`と`STRIPE_WEBHOOK_SECRET`も本番用の値に変更してください

