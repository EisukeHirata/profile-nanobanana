"use client";

import React from "react";
import { signIn } from "next-auth/react";
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>NanoProfile</div>
        <button onClick={() => signIn("google")} className={styles.signInButton}>
          Sign In
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Create Your Perfect <br />
            <span className={styles.gradientText}>AI Profile Photos</span>
            <br /> in Seconds
          </h1>
          <p className={styles.subtitle}>
            Transform your selfies into professional-quality photos for LinkedIn, Social Media, and Dating apps. 
            No photographer needed.
          </p>
          
          <div className={styles.ctaGroup}>
            <button onClick={() => signIn("google")} className={styles.primaryButton}>
              Get Started Free
            </button>
            <p className={styles.note}>Powered by Google Gemini 2.5</p>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.icon}>📸</div>
            <h3>Upload Selfies</h3>
            <p>Just upload a few casual photos of yourself.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.icon}>✨</div>
            <h3>AI Magic</h3>
            <p>Our AI generates photorealistic scenes and styles.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.icon}>🚀</div>
            <h3>Stand Out Everywhere</h3>
            <p>Boost your presence on LinkedIn, Instagram, and more.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
