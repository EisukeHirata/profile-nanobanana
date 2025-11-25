"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3 className={styles.logo}>NanoProfile</h3>
            <p className={styles.tagline}>AI-powered profile photos for everyone</p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>Product</h4>
              <Link href="/">Home</Link>
              <Link href="/profile">My Profile</Link>
            </div>

            <div className={styles.linkGroup}>
              <h4>Support</h4>
              <Link href="/contact">Contact Us</Link>
              <Link href="/refund-policy">Refund Policy</Link>
              <Link href="/cancellation-policy">Cancellation Policy</Link>
            </div>

            <div className={styles.linkGroup}>
              <h4>Legal</h4>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} NanoProfile. All rights reserved.</p>
          <p className={styles.powered}>Powered by Google Gemini 2.5</p>
        </div>
      </div>
    </footer>
  );
}
