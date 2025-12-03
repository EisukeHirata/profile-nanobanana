"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { useLocale } from "@/contexts/LocaleContext";

export default function Footer() {
  const { t } = useLocale();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3 className={styles.logo}>NanoProfile</h3>
            <p className={styles.tagline}>{t("footer.tagline")}</p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>{t("footer.product")}</h4>
              <Link href="/">{t("footer.home")}</Link>
              <Link href="/profile">{t("footer.profile")}</Link>
            </div>

            <div className={styles.linkGroup}>
              <h4>{t("footer.support")}</h4>
              <Link href="/contact">{t("footer.contact")}</Link>
              <Link href="/refund-policy">{t("footer.refund")}</Link>
              <Link href="/cancellation-policy">{t("footer.cancellation")}</Link>
            </div>

            <div className={styles.linkGroup}>
              <h4>{t("footer.legal")}</h4>
              <Link href="/legal">特定商取引法</Link>
              <Link href="/privacy">{t("footer.privacy")}</Link>
              <Link href="/terms">{t("footer.terms")}</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} NanoProfile. {t("footer.rights")}</p>
          <p className={styles.powered}>{t("footer.powered")}</p>
        </div>
      </div>
    </footer>
  );
}
