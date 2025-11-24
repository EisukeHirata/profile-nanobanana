"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { GeneratedItem } from "@/utils/storage";
import Gallery from "@/components/Gallery/Gallery";
import PricingModal from "@/components/Pricing/PricingModal";
import styles from "./profile.module.css";

interface UserProfile {
  credits: number;
  subscription_tier: string | null;
  subscription_status: string | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<GeneratedItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        try {
          // Fetch History
          const historyRes = await fetch("/api/history");
          const historyData = await historyRes.json();
          if (historyData.history) {
            setHistory(historyData.history);
          }

          // Fetch Profile (Credits/Plan)
          const creditsRes = await fetch("/api/user/credits");
          const creditsData = await creditsRes.json();
          // Note: /api/user/credits currently returns { credits: number }
          // We might need to update it to return plan info, or create a new route.
          // For now, let's assume we update /api/user/credits to return more info or fetch from a new endpoint.
          // Let's try to fetch from a new endpoint /api/user/profile if it existed, but for now let's just use what we have
          // and maybe update the API later. Or better, let's update the API first?
          // Actually, I can update the API in the next step. Let's assume the API returns the data we need.
          // Wait, I should check /api/user/credits again. It only returns credits.
          // I'll need to update /api/user/credits to return full profile info.
          
          setProfile({
            credits: creditsData.credits,
            subscription_tier: creditsData.subscription_tier || "Free",
            subscription_status: creditsData.subscription_status || "active"
          });

        } catch (error) {
          console.error("Failed to fetch data", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [status]);

  if (status === "loading" || isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className={styles.main}>
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>My Profile</h1>
          <button onClick={() => router.push("/")} className={styles.backButton}>
            ← Back to Generator
          </button>
        </div>
        
        <div className={styles.profileCard}>
          <div className={styles.userInfo}>
            {session.user?.image && (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                className={styles.avatar}
              />
            )}
            <div className={styles.userDetails}>
              <p className={styles.userName}>{session.user?.name}</p>
              <p className={styles.userEmail}>{session.user?.email}</p>
            </div>
          </div>

          <div className={styles.planInfo}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Plan</span>
              <span className={styles.statValue}>
                {profile?.subscription_tier ? profile.subscription_tier.toUpperCase() : "FREE"}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Credits</span>
              <span className={styles.statValue}>⚡ {profile?.credits ?? 0}</span>
            </div>
            <button 
              className={styles.manageButton}
              onClick={() => setIsPricingOpen(true)}
            >
              Manage Plan / Buy Credits
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>History</h2>
        {history.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No generated images yet.</p>
            <button onClick={() => router.push("/")} className={styles.createButton}>
              Create your first photo
            </button>
          </div>
        ) : (
          <div className={styles.historyGrid}>
            {history.map((item) => (
              <div key={item.id} className={styles.historyItem}>
                <div className={styles.itemHeader}>
                  <span className={styles.date}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <span className={styles.sceneBadge}>{item.scene}</span>
                </div>
                <Gallery images={item.images} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
