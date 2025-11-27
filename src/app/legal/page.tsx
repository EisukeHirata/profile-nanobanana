"use client";

import { useRouter } from "next/navigation";
import styles from "./legal.module.css";

export default function LegalPage() {
  const router = useRouter();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          ← Back to Home
        </button>

        <h1 className={styles.title}>特定商取引法に基づく表記</h1>
        <p className={styles.subtitle}>Specified Commercial Transactions Act</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>販売業者 / Business Operator</h2>
            <p>株式会社Ellipse Labs</p>
          </section>

          <section className={styles.section}>
            <h2>運営責任者 / Representative</h2>
            <p>平田叡佑/Eisuke Hirata</p>
          </section>

          <section className={styles.section}>
            <h2>所在地 / Address</h2>
            <p>〒150-0001 東京都渋谷区神宮前６丁目２３−４</p>
            <p className={styles.note}>
              ※ Please note that we do not accept in-person visits. All inquiries should be made via email.
            </p>
          </section>

          <section className={styles.section}>
            <h2>電話番号 / Phone Number</h2>
            <p>070-9131-3243</p>
            <p className={styles.note}>
              ※ For customer support, please contact us via email at i@nano-profile.com
            </p>
          </section>

          <section className={styles.section}>
            <h2>メールアドレス / Email Address</h2>
            <p>
              <a href="mailto:i@nano-profile.com">i@nano-profile.com</a>
            </p>
          </section>

          <section className={styles.section}>
            <h2>販売価格 / Pricing</h2>
            <p>各商品ページに記載 / As displayed on each product page</p>
            <ul>
              <li>Credit Packs: ¥500 - ¥10,000</li>
              <li>Monthly Subscription: ¥2,980/month</li>
              <li>Annual Subscription: ¥29,800/year</li>
            </ul>
            <p className={styles.note}>
              ※ All prices include consumption tax (消費税込み)
            </p>
          </section>

          <section className={styles.section}>
            <h2>商品代金以外の必要料金 / Additional Fees</h2>
            <p>
              インターネット接続料金、通信料金等はお客様のご負担となります。<br />
              Internet connection and communication fees are the customer's responsibility.
            </p>
          </section>

          <section className={styles.section}>
            <h2>支払方法 / Payment Methods</h2>
            <p>クレジットカード決済 (Stripe経由) / Credit Card (via Stripe)</p>
            <ul>
              <li>Visa</li>
              <li>Mastercard</li>
              <li>American Express</li>
              <li>JCB</li>
              <li>その他Stripeが対応するカード / Other cards supported by Stripe</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>支払時期 / Payment Timing</h2>
            <p>
              クレジットカード決済：購入時に即時決済<br />
              Credit Card: Immediate payment upon purchase
            </p>
            <p>
              サブスクリプション：毎月または毎年の自動更新時<br />
              Subscription: Automatic renewal monthly or annually
            </p>
          </section>

          <section className={styles.section}>
            <h2>商品の引渡時期 / Delivery Time</h2>
            <p>
              デジタルサービスのため、購入後即時利用可能<br />
              As a digital service, available immediately after purchase
            </p>
          </section>

          <section className={styles.section}>
            <h2>返品・キャンセルポリシー / Return & Cancellation Policy</h2>
            <p>
              デジタルコンテンツの性質上、原則として返金・返品はお受けできません。<br />
              Due to the nature of digital content, refunds and returns are generally not accepted.
            </p>
            <p>
              詳細は<a href="/refund-policy">返金ポリシー</a>および<a href="/cancellation-policy">キャンセルポリシー</a>をご確認ください。<br />
              For details, please see our <a href="/refund-policy">Refund Policy</a> and <a href="/cancellation-policy">Cancellation Policy</a>.
            </p>
          </section>

          <section className={styles.section}>
            <h2>サービス提供条件 / Service Terms</h2>
            <p>
              本サービスの利用には、利用規約への同意が必要です。<br />
              Use of this service requires agreement to our Terms of Service.
            </p>
            <p>
              <a href="/terms">利用規約 / Terms of Service</a>
            </p>
          </section>

          <section className={styles.section}>
            <h2>動作環境 / System Requirements</h2>
            <p>
              インターネット接続が可能な環境<br />
              Internet connection required
            </p>
            <p>
              推奨ブラウザ：Chrome、Safari、Firefox、Edge (最新版)<br />
              Recommended browsers: Chrome, Safari, Firefox, Edge (latest versions)
            </p>
          </section>

          <section className={styles.section}>
            <h2>お問い合わせ / Contact</h2>
            <p>
              ご不明な点がございましたら、以下までお問い合わせください。<br />
              For any questions, please contact us:
            </p>
            <p>
              Email: <a href="mailto:i@nano-profile.com">i@nano-profile.com</a><br />
              Contact Form: <a href="/contact">お問い合わせフォーム / Contact Page</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
