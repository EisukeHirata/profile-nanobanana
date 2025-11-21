"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { GeneratedItem } from "@/utils/storage";
import Gallery from "@/components/Gallery/Gallery";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<GeneratedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/history");
          const data = await res.json();
          if (data.history) {
            setHistory(data.history);
          }
        } catch (error) {
          console.error("Failed to fetch history", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
  }, [status]);

  if (status === "loading" || isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>My Profile</h1>
          <button onClick={() => router.push("/")} className={styles.backButton}>
            ← Back to Generator
          </button>
        </div>
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
          <div className={styles.historyList}>
            {history.map((item) => (
              <div key={item.id} className={styles.historyItem}>
                <div className={styles.itemHeader}>
                  <span className={styles.date}>
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
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
