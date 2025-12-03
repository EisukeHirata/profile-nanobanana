"use client";

import React, { useState } from "react";
// Re-trigger compilation
import styles from "./PricingModal.module.css";
import { X, Check, Zap } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string | null;
}

export default function PricingModal({ isOpen, onClose, message }: PricingModalProps) {
  const { t, currency } = useLocale();
  const [loading, setLoading] = useState<string | null>(null);

  const getPriceId = (key: string) => {
    // Temporary fix: Use USD price IDs even for JPY until JPY prices are set up in Stripe
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

  if (!isOpen) return null;

  const handleCheckout = async (priceId: string, mode: "subscription" | "payment") => {
    setLoading(priceId);
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
      setLoading(null);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>
        
        <h2 className={styles.title}>{t("pricing.title")}</h2>
        {message && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#ef4444', 
            padding: '0.75rem', 
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
        <p className={styles.subtitle}>{t("pricing.subtitle")}</p>

        <div className={styles.grid}>
          {/* Subscriptions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Starter</h3>
              <div className={styles.price}>{getPriceDisplay("9.99", "1,556")}<span>{t("pricing.month")}</span></div>
            </div>
            <ul className={styles.features}>
              <li><Check size={16} /> 25 {t("pricing.features.credits")}</li>
              <li><Check size={16} /> {t("pricing.features.speed.standard")}</li>
              <li><Check size={16} /> {t("pricing.features.noWatermark")}</li>
            </ul>
            <button 
              onClick={() => handleCheckout(getPriceId("BASIC")!, "subscription")}
              disabled={!!loading}
              className={styles.button}
            >
              {loading === getPriceId("BASIC") ? t("pricing.loading") : t("pricing.subscribe")}
            </button>
          </div>

          <div className={`${styles.card} ${styles.popular}`}>
            <div className={styles.popularBadge}>{t("pricing.mostPopular")}</div>
            <div className={styles.cardHeader}>
              <h3>Pro</h3>
              <div className={styles.price}>{getPriceDisplay("19.99", "3,113")}<span>{t("pricing.month")}</span></div>
            </div>
            <ul className={styles.features}>
              <li><Check size={16} /> 55 {t("pricing.features.credits")}</li>
              <li><Check size={16} /> {t("pricing.features.speed.fast")}</li>
              <li><Check size={16} /> {t("pricing.features.prioritySupport")}</li>
            </ul>
            <button 
              onClick={() => handleCheckout(getPriceId("PRO")!, "subscription")}
              disabled={!!loading}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              {loading === getPriceId("PRO") ? t("pricing.loading") : t("pricing.subscribe")}
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Premium</h3>
              <div className={styles.price}>{getPriceDisplay("49.99", "7,785")}<span>{t("pricing.month")}</span></div>
            </div>
            <ul className={styles.features}>
              <li><Check size={16} /> 140 {t("pricing.features.credits")}</li>
              <li><Check size={16} /> {t("pricing.features.speed.max")}</li>
              <li><Check size={16} /> {t("pricing.features.earlyAccess")}</li>
            </ul>
            <button 
              onClick={() => handleCheckout(getPriceId("PREMIUM")!, "subscription")}
              disabled={!!loading}
              className={styles.button}
            >
              {loading === getPriceId("PREMIUM") ? t("pricing.loading") : t("pricing.subscribe")}
            </button>
          </div>
        </div>

        <div className={styles.divider}>
          <span>{t("pricing.orTopUp")}</span>
        </div>

        <div className={styles.creditPacks}>
          <div className={styles.creditPack}>
            <div className={styles.packInfo}>
              <span className={styles.packAmount}>10 Credits</span>
              <span className={styles.packPrice}>{getPriceDisplay("4.49", "699")}</span>
            </div>
            <button
              onClick={() => handleCheckout(getPriceId("SMALL")!, "payment")}
              className={styles.buyButton}
              disabled={loading === getPriceId("SMALL")}
            >
              {loading === getPriceId("SMALL") ? "..." : t("pricing.buy")}
            </button>
          </div>
          <div className={styles.creditPack}>
            <div className={styles.packInfo}>
              <span className={styles.packAmount}>30 Credits</span>
              <span className={styles.packPrice}>{getPriceDisplay("11.99", "1,867")}</span>
            </div>
            <button
              onClick={() => handleCheckout(getPriceId("LARGE")!, "payment")}
              className={styles.buyButton}
              disabled={loading === getPriceId("LARGE")}
            >
              {loading === getPriceId("LARGE") ? "..." : t("pricing.buy")}
            </button>
          </div>
          <div className={styles.creditPack}>
            <div className={styles.packInfo}>
              <span className={styles.packAmount}>100 Credits</span>
              <span className={styles.packPrice}>{getPriceDisplay("29.99", "4,670")}</span>
            </div>
            <button
              onClick={() => handleCheckout(getPriceId("XLARGE")!, "payment")}
              className={styles.buyButton}
              disabled={loading === getPriceId("XLARGE")}
            >
              {loading === getPriceId("XLARGE") ? "..." : t("pricing.buy")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
