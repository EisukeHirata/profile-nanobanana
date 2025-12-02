"use client";

import React, { useState } from "react";
// Re-trigger compilation
import styles from "./PricingModal.module.css";
import { X, Check, Zap } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string | null;
}

export default function PricingModal({ isOpen, onClose, message }: PricingModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (priceId: string, mode: "subscription" | "payment") => {
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
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
        
        <h2 className={styles.title}>Upgrade Your Profile</h2>
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
        <p className={styles.subtitle}>Choose a plan or top up credits as you go.</p>

        <div className={styles.grid}>
          {/* Subscriptions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Starter</h3>
              <div className={styles.price}>$9.99<span>/mo</span></div>
            </div>
            <ul className={styles.features}>
              <li><Check size={16} /> 40 Credits / month</li>
              <li><Check size={16} /> Standard Speed</li>
              <li><Check size={16} /> No Watermark</li>
            </ul>
            <button 
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_BASIC!, "subscription")}
              disabled={!!loading}
              className={styles.button}
            >
              {loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_BASIC ? "Loading..." : "Subscribe"}
            </button>
          </div>

          <div className={`${styles.card} ${styles.popular}`}>
            <div className={styles.popularBadge}>Most Popular</div>
            <div className={styles.cardHeader}>
              <h3>Pro</h3>
              <div className={styles.price}>$19.99<span>/mo</span></div>
            </div>
            <ul className={styles.features}>
              <li><Check size={16} /> 90 Credits / month</li>
              <li><Check size={16} /> Fast Generation</li>
              <li><Check size={16} /> Priority Support</li>
            </ul>
            <button 
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PRO!, "subscription")}
              disabled={!!loading}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              {loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PRO ? "Loading..." : "Subscribe"}
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Premium</h3>
              <div className={styles.price}>$49.99<span>/mo</span></div>
            </div>
            <ul className={styles.features}>
              <li><Check size={16} /> 240 Credits / month</li>
              <li><Check size={16} /> Max Speed</li>
              <li><Check size={16} /> Early Access Features</li>
            </ul>
            <button 
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PREMIUM!, "subscription")}
              disabled={!!loading}
              className={styles.button}
            >
              {loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PREMIUM ? "Loading..." : "Subscribe"}
            </button>
          </div>
        </div>

        <div className={styles.divider}>
          <span>OR TOP UP CREDITS</span>
        </div>

        <div className={styles.creditPacks}>
          <div className={styles.creditPack}>
            <div className={styles.packInfo}>
              <span className={styles.packAmount}>10 Credits</span>
              <span className={styles.packPrice}>$4.99</span>
            </div>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL!, "payment")}
              className={styles.buyButton}
              disabled={loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL}
            >
              {loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL ? "..." : "Buy"}
            </button>
          </div>
          <div className={styles.creditPack}>
            <div className={styles.packInfo}>
              <span className={styles.packAmount}>50 Credits</span>
              <span className={styles.packPrice}>$17.99</span>
            </div>
            <button
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE!, "payment")}
              className={styles.buyButton}
              disabled={loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE}
            >
              {loading === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE ? "..." : "Buy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
