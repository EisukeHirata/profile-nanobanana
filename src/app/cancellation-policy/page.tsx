"use client";

import { useRouter } from "next/navigation";
import styles from "./policy.module.css";

export default function CancellationPolicyPage() {
  const router = useRouter();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <button onClick={() => router.push("/")} className={styles.backButton}>
          ← Back to Home
        </button>

        <h1 className={styles.title}>Cancellation Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: November 25, 2025</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Subscription Cancellation</h2>
            <p>
              You may cancel your subscription at any time. Here's what you need to know:
            </p>
            <ul>
              <li>Cancellations can be made through your account settings or by contacting support.</li>
              <li>Your subscription will remain active until the end of your current billing period.</li>
              <li>You will continue to have access to subscription benefits until the end of the paid period.</li>
              <li>No partial refunds will be issued for unused time in the current billing period.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. How to Cancel Your Subscription</h2>
            <p>
              To cancel your subscription:
            </p>
            <ol>
              <li>Log in to your account</li>
              <li>Go to "My Profile"</li>
              <li>Click "Manage Plan / Buy Credits"</li>
              <li>Select "Cancel Subscription"</li>
            </ol>
            <p>
              Alternatively, you can email <a href="mailto:support@nanoprofile.com">support@nanoprofile.com</a> with 
              your cancellation request.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. What Happens After Cancellation</h2>
            <p>
              After your subscription is cancelled:
            </p>
            <ul>
              <li>Your subscription will not renew at the end of the current billing period.</li>
              <li>You will lose access to subscription-only features (monthly credits, priority support, etc.).</li>
              <li>Any unused credits from your subscription will expire at the end of the billing period.</li>
              <li>Purchased credits (non-subscription) will remain in your account and do not expire.</li>
              <li>Your generated images and account history will be preserved.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Reactivating Your Subscription</h2>
            <p>
              You can reactivate your subscription at any time by:
            </p>
            <ul>
              <li>Visiting the pricing page and selecting a plan</li>
              <li>Going to your profile and clicking "Manage Plan / Buy Credits"</li>
            </ul>
            <p>
              Reactivation will start a new billing cycle immediately.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Credit Purchases</h2>
            <p>
              Credit purchases are separate from subscriptions and cannot be cancelled or refunded. 
              See our <a href="/refund-policy">Refund Policy</a> for more details.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Account Deletion</h2>
            <p>
              If you wish to delete your account entirely:
            </p>
            <ul>
              <li>First cancel any active subscriptions</li>
              <li>Contact <a href="mailto:support@nanoprofile.com">support@nanoprofile.com</a> to request account deletion</li>
              <li>Account deletion is permanent and cannot be undone</li>
              <li>All generated images and data will be deleted</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>7. Automatic Renewal</h2>
            <p>
              Subscriptions automatically renew unless cancelled before the renewal date. You will receive an email 
              reminder 7 days before your subscription renews.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Contact Us</h2>
            <p>
              For questions about cancellation or to request assistance, please contact us at:
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
