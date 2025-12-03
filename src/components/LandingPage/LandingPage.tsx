"use client";

import React from "react";
import { signIn } from "next-auth/react";
import styles from "./LandingPage.module.css";
import { useLocale } from "@/contexts/LocaleContext";

export default function LandingPage() {
  const { t } = useLocale();
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>{t("home.title")}</div>
        <button onClick={() => signIn("google")} className={styles.signInButton}>
          {t("lp.signin")}
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            {t("lp.hero.title")} <br />
            <span className={styles.gradientText}>{t("lp.hero.title.highlight")}</span>
            <br /> {t("lp.hero.title.suffix")}
          </h1>
          <p className={styles.subtitle}>
            {t("lp.hero.subtitle")}
          </p>
          
          <div className={styles.ctaGroup}>
            <button onClick={() => signIn("google")} className={styles.primaryButton}>
              {t("lp.cta.start")}
            </button>
            <p className={styles.note}>{t("footer.powered")}</p>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.icon}>📸</div>
            <h3>{t("lp.features.upload.title")}</h3>
            <p>{t("lp.features.upload.desc")}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.icon}>✨</div>
            <h3>{t("lp.features.ai.title")}</h3>
            <p>{t("lp.features.ai.desc")}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.icon}>🚀</div>
            <h3>{t("lp.features.standout.title")}</h3>
            <p>{t("lp.features.standout.desc")}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
