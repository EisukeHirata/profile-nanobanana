"use client";


import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import styles from "./LoginButton.module.css";
import { useEffect, useState } from "react";
import { Zap, Globe } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface LoginButtonProps {
  onOpenPricing?: () => void;
}

export default function LoginButton({ onOpenPricing }: LoginButtonProps) {
  const { data: session } = useSession();
  const { locale, setLocale, t } = useLocale();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/user/credits")
        .then((res) => res.json())
        .then((data) => setCredits(data.credits))
        .catch((err) => console.error("Failed to fetch credits", err));
    }
  }, [session]);

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ja" : "en";
    setLocale(newLocale);
  };

  if (session) {
    return (
      <div className={styles.container}>
        <button onClick={toggleLanguage} className={styles.langButton} title={locale === "en" ? "日本語" : "English"}>
          <Globe size={16} />
          <span>{locale === "en" ? "JP" : "EN"}</span>
        </button>
        
        <button onClick={onOpenPricing} className={styles.creditsBadge}>
          <Zap size={16} fill="currentColor" />
          <span>{credits !== null ? credits : "..."}</span>
        </button>
        
        <div className={styles.profileContainer}>
          <Link href="/profile" className={styles.profileLink}>
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {session.user?.name?.[0] || "U"}
              </div>
            )}
          </Link>
          <button onClick={() => signOut()} className={styles.button}>
            {t("lp.signout")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => signIn("google")} className={styles.button}>
      Sign in with Google
    </button>
  );
}
