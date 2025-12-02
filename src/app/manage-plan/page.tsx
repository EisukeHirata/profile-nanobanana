"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./manage-plan.module.css";
import PricingModal from "@/components/Pricing/PricingModal";

interface UserProfile {
  credits: number;
  subscription_tier: string | null;
  subscription_status: string | null;
}

export default function ManagePlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/user/credits")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setProfile({
              credits: data.credits,
              subscription_tier: data.subscription_tier || "Free",
              subscription_status: data.subscription_status || "active"
            });
          }
        })
        .catch(err => console.error("Error fetching profile:", err))
        .finally(() => setIsLoading(false));
    }
  }, [status, router]);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.")) {
      return;
    }

    setIsCanceling(true);
    setMessage(null);

    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }

      setMessage({ text: "Subscription canceled successfully. It will remain active until the end of the billing period.", type: 'success' });
      
      // Update local state
      setProfile(prev => prev ? { ...prev, subscription_status: 'canceled' } : null);

    } catch (error: any) {
      console.error("Cancellation failed:", error);
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsCanceling(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!session) return null;

  const isFree = !profile?.subscription_tier || profile.subscription_tier.toLowerCase() === 'free';
  const isActive = profile?.subscription_status?.toLowerCase() === 'active' || profile?.subscription_status?.toLowerCase() === 'trialing';

  // Debug logging
  console.log('Manage Plan Debug:', {
    subscription_tier: profile?.subscription_tier,
    subscription_status: profile?.subscription_status,
    isFree,
    isActive,
    shouldShowCancelButton: isActive && !isFree
  });

  return (
    <main className={styles.main}>
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Manage Plan</h1>
          <button onClick={() => router.push("/profile")} className={styles.backButton}>
            ← Back to Profile
          </button>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Current Plan</h2>
          <div className={styles.planDetails}>
            <span className={styles.planName}>
              {profile?.subscription_tier ? profile.subscription_tier.toUpperCase() : "FREE"}
            </span>
            <span className={`${styles.planStatus} ${isActive ? styles.statusActive : styles.statusCanceled}`}>
              {profile?.subscription_status || "Active"}
            </span>
          </div>
          <div className={styles.creditCount} style={{ marginTop: '1.5rem' }}>
            ⚡ {profile?.credits ?? 0} Credits
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Available Plans</h2>
          <div className={styles.plansGrid}>
            <div className={styles.planCard}>
              <h3 className={styles.planCardTitle}>Starter</h3>
              <div className={styles.planCardPrice}>$9.99<span>/mo</span></div>
              <ul className={styles.planCardFeatures}>
                <li>✓ 40 Credits / month</li>
              </ul>
              <button 
                className={styles.button}
                onClick={() => setIsPricingOpen(true)}
                disabled={profile?.subscription_tier?.toLowerCase() === 'basic'}
              >
                {profile?.subscription_tier?.toLowerCase() === 'basic' ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>

            <div className={`${styles.planCard} ${styles.planCardPopular}`}>
              <div className={styles.popularBadge}>Most Popular</div>
              <h3 className={styles.planCardTitle}>Pro</h3>
              <div className={styles.planCardPrice}>$19.99<span>/mo</span></div>
              <ul className={styles.planCardFeatures}>
                <li>✓ 90 Credits / month</li>
              </ul>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => setIsPricingOpen(true)}
                disabled={profile?.subscription_tier?.toLowerCase() === 'pro'}
              >
                {profile?.subscription_tier?.toLowerCase() === 'pro' ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>

            <div className={styles.planCard}>
              <h3 className={styles.planCardTitle}>Premium</h3>
              <div className={styles.planCardPrice}>$49.99<span>/mo</span></div>
              <ul className={styles.planCardFeatures}>
                <li>✓ 240 Credits / month</li>
              </ul>
              <button 
                className={styles.button}
                onClick={() => setIsPricingOpen(true)}
                disabled={profile?.subscription_tier?.toLowerCase() === 'premium'}
              >
                {profile?.subscription_tier?.toLowerCase() === 'premium' ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Buy Credits</h2>
          <div className={styles.creditPacksGrid}>
            <div className={styles.creditPackCard}>
              <div className={styles.creditPackAmount}>10 Credits</div>
              <div className={styles.creditPackPrice}>$4.99</div>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => setIsPricingOpen(true)}
              >
                Buy
              </button>
            </div>

            <div className={styles.creditPackCard}>
              <div className={styles.creditPackAmount}>50 Credits</div>
              <div className={styles.creditPackPrice}>$17.99</div>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => setIsPricingOpen(true)}
              >
                Buy
              </button>
            </div>
          </div>
        </section>

        {isActive && !isFree && (
          <div className={styles.cancelSection}>
            <h2 className={styles.sectionTitle}>Cancel Subscription</h2>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Your subscription will automatically renew. You can cancel anytime, and you'll continue to have access until the end of your billing period.
            </p>
            <button 
              className={styles.cancelButton}
              onClick={handleCancelSubscription}
              disabled={isCanceling}
            >
              {isCanceling ? "Canceling..." : "Cancel Subscription"}
            </button>
            <a 
              href="/cancellation-policy" 
              style={{ 
                display: 'block',
                color: '#a1a1aa', 
                fontSize: '0.85rem', 
                textAlign: 'center',
                textDecoration: 'underline',
                marginTop: '0.75rem'
              }}
            >
              View Cancellation Policy
            </a>
          </div>
        )}

        {message && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
            {message.text}
          </div>
        )}
      </div>
    </main>
  );
}
