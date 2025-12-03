"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./manage-plan.module.css";
import { useLocale } from "@/contexts/LocaleContext";

interface UserProfile {
  credits: number;
  subscription_tier: string | null;
  subscription_status: string | null;
}

export default function ManagePlanPage() {
  const { t, currency } = useLocale();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

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

  const getPriceId = (key: string) => {
    // Temporary fix: Use USD price IDs even for JPY until JPY prices are set up in Stripe
    // This prevents the 500 error caused by undefined price IDs
    switch (key) {
      case "BASIC": return process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_BASIC;
      case "PRO": return process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PRO;
      case "PREMIUM": return process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PREMIUM;
      case "SMALL": return process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL;
      case "LARGE": return process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE;
      case "XLARGE": return process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_XLARGE;
    }
  };

  const getPriceDisplay = (usd: string, jpy: string) => {
    return currency === "JPY" ? `¥${jpy}` : `$${usd}`;
  };

  const handleCheckout = async (priceId: string, mode: "subscription" | "payment") => {
    setLoadingPriceId(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode, currency }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoadingPriceId(null);
    }
  };

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
    return <div className={styles.loading}>{t("profile.loading")}</div>;
  }

  if (!session) return null;

  const isFree = !profile?.subscription_tier || profile.subscription_tier.toLowerCase() === 'free';
  const isActive = profile?.subscription_status?.toLowerCase() === 'active' || profile?.subscription_status?.toLowerCase() === 'trialing';

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t("manage.title")}</h1>
          <button onClick={() => router.push("/profile")} className={styles.backButton}>
            {t("manage.back")}
          </button>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("manage.currentPlan")}</h2>
          <div className={styles.planDetails}>
            <span className={styles.planName}>
              {profile?.subscription_tier ? profile.subscription_tier.toUpperCase() : "FREE"}
            </span>
            <span className={`${styles.planStatus} ${isActive ? styles.statusActive : styles.statusCanceled}`}>
              {profile?.subscription_status || "Active"}
            </span>
          </div>
          <div className={styles.creditCount} style={{ marginTop: '1.5rem' }}>
            ⚡ {profile?.credits ?? 0} {t("profile.credits")}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("manage.availablePlans")}</h2>
          <div className={styles.plansGrid}>
            <div className={styles.planCard}>
              <h3 className={styles.planCardTitle}>Starter</h3>
              <div className={styles.planCardPrice}>{getPriceDisplay("9.99", "1,556")}<span>{t("pricing.month")}</span></div>
              <ul className={styles.planCardFeatures}>
                <li>✓ 25 {t("pricing.features.credits")}</li>
              </ul>
              <button 
                className={styles.button}
                onClick={() => handleCheckout(getPriceId("BASIC")!, "subscription")}
                disabled={profile?.subscription_tier?.toLowerCase() === 'basic' || !!loadingPriceId}
              >
                {loadingPriceId === getPriceId("BASIC") ? t("pricing.loading") : (profile?.subscription_tier?.toLowerCase() === 'basic' ? t("manage.current") : t("manage.subscribe"))}
              </button>
            </div>

            <div className={`${styles.planCard} ${styles.planCardPopular}`}>
              <div className={styles.popularBadge}>{t("pricing.mostPopular")}</div>
              <h3 className={styles.planCardTitle}>Pro</h3>
              <div className={styles.planCardPrice}>{getPriceDisplay("19.99", "3,113")}<span>{t("pricing.month")}</span></div>
              <ul className={styles.planCardFeatures}>
                <li>✓ 55 {t("pricing.features.credits")}</li>
              </ul>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => handleCheckout(getPriceId("PRO")!, "subscription")}
                disabled={profile?.subscription_tier?.toLowerCase() === 'pro' || !!loadingPriceId}
              >
                {loadingPriceId === getPriceId("PRO") ? t("pricing.loading") : (profile?.subscription_tier?.toLowerCase() === 'pro' ? t("manage.current") : t("manage.subscribe"))}
              </button>
            </div>

            <div className={styles.planCard}>
              <h3 className={styles.planCardTitle}>Premium</h3>
              <div className={styles.planCardPrice}>{getPriceDisplay("49.99", "7,785")}<span>{t("pricing.month")}</span></div>
              <ul className={styles.planCardFeatures}>
                <li>✓ 140 {t("pricing.features.credits")}</li>
              </ul>
              <button 
                className={styles.button}
                onClick={() => handleCheckout(getPriceId("PREMIUM")!, "subscription")}
                disabled={profile?.subscription_tier?.toLowerCase() === 'premium' || !!loadingPriceId}
              >
                {loadingPriceId === getPriceId("PREMIUM") ? t("pricing.loading") : (profile?.subscription_tier?.toLowerCase() === 'premium' ? t("manage.current") : t("manage.subscribe"))}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("manage.buyCredits")}</h2>
          <div className={styles.creditPacksGrid}>
            <div className={styles.creditPackCard}>
              <div className={styles.creditPackAmount}>10 Credits</div>
              <div className={styles.creditPackPrice}>{getPriceDisplay("4.49", "699")}</div>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => handleCheckout(getPriceId("SMALL")!, "payment")}
                disabled={!!loadingPriceId}
              >
                {loadingPriceId === getPriceId("SMALL") ? "..." : t("manage.buy")}
              </button>
            </div>

            <div className={styles.creditPackCard}>
              <div className={styles.creditPackAmount}>30 Credits</div>
              <div className={styles.creditPackPrice}>{getPriceDisplay("11.99", "1,867")}</div>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => handleCheckout(getPriceId("LARGE")!, "payment")}
                disabled={!!loadingPriceId}
              >
                {loadingPriceId === getPriceId("LARGE") ? "..." : t("manage.buy")}
              </button>
            </div>

            <div className={styles.creditPackCard}>
              <div className={styles.creditPackAmount}>100 Credits</div>
              <div className={styles.creditPackPrice}>{getPriceDisplay("29.99", "4,670")}</div>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => handleCheckout(getPriceId("XLARGE")!, "payment")}
                disabled={!!loadingPriceId}
              >
                {loadingPriceId === getPriceId("XLARGE") ? "..." : t("manage.buy")}
              </button>
            </div>
          </div>
        </section>

        {isActive && !isFree && (
          <div className={styles.cancelSection}>
            <h2 className={styles.sectionTitle}>{t("manage.cancel")}</h2>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {t("manage.cancel.message")}
            </p>
            <button 
              className={styles.cancelButton}
              onClick={handleCancelSubscription}
              disabled={isCanceling}
            >
              {isCanceling ? t("manage.cancel.canceling") : t("manage.cancel.button")}
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
              {t("manage.policy")}
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
