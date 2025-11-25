"use client";

import { useRouter } from "next/navigation";
import styles from "./policy.module.css";

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          ← Back to Home
        </button>

        <h1 className={styles.title}>Refund & Dispute Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: November 25, 2025</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Credit Purchases</h2>
            <p>
              Credit purchases are <strong>non-refundable</strong>. Once credits are purchased and added to your account, 
              they cannot be refunded or exchanged for cash.
            </p>
            <p>
              Credits do not expire and can be used at any time for image generation services.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Subscription Refunds</h2>
            <p>
              Subscription plans are billed on a recurring basis (monthly or annual). You may cancel your subscription 
              at any time, but refunds are handled as follows:
            </p>
            <ul>
              <li>
                <strong>Monthly Subscriptions:</strong> No refunds for partial months. Your subscription will remain 
                active until the end of the current billing period.
              </li>
              <li>
                <strong>Annual Subscriptions:</strong> Refunds may be issued on a pro-rata basis within the first 30 days 
                of purchase. After 30 days, no refunds will be issued.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Service Issues</h2>
            <p>
              If you experience technical issues that prevent you from using our service, please contact our support team 
              at <a href="mailto:support@nanoprofile.com">support@nanoprofile.com</a>. We will work to resolve the issue 
              or provide appropriate compensation on a case-by-case basis.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Dispute Resolution</h2>
            <p>
              If you have a dispute regarding a charge or service issue:
            </p>
            <ol>
              <li>Contact our support team at <a href="mailto:support@nanoprofile.com">support@nanoprofile.com</a> with details of your concern.</li>
              <li>We will investigate and respond within 5 business days.</li>
              <li>If the issue cannot be resolved through support, you may file a dispute with your payment provider (Stripe).</li>
            </ol>
          </section>

          <section className={styles.section}>
            <h2>5. Chargebacks</h2>
            <p>
              If you initiate a chargeback with your bank or credit card company without first contacting us, your account 
              may be suspended pending investigation. We encourage you to contact our support team first to resolve any 
              billing issues.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Exceptional Circumstances</h2>
            <p>
              In exceptional circumstances (e.g., service outage, billing errors), we may issue refunds at our discretion. 
              Each case will be evaluated individually.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. How to Request a Refund</h2>
            <p>
              To request a refund (where applicable), please email <a href="mailto:support@nanoprofile.com">support@nanoprofile.com</a> with:
            </p>
            <ul>
              <li>Your account email address</li>
              <li>Transaction ID or receipt</li>
              <li>Reason for refund request</li>
            </ul>
            <p>
              Refund requests will be processed within 7-10 business days.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Contact Us</h2>
            <p>
              For questions about this refund policy, please contact us at:
            </p>
            <p>
              Email: <a href="mailto:support@nanoprofile.com">support@nanoprofile.com</a><br />
              Visit: <a href="/contact">Contact Page</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
