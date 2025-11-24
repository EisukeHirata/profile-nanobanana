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

import { X } from "lucide-react";

// ... (imports)

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<GeneratedItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // ... (useEffect hooks)

  const handleDeleteImage = async (generationId: string, imageIndex: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch("/api/generations/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, imageIndex }),
      });

      if (!res.ok) throw new Error("Failed to delete image");

      const data = await res.json();

      // Update local state
      setHistory((prev) => {
        return prev.map((item) => {
          if (item.id === generationId) {
            return { ...item, images: data.images };
          }
          return item;
        }).filter((item) => item.images.length > 0); // Remove empty generations
      });

    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete image");
    }
  };

  if (status === "loading" || isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className={styles.main}>
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      
      {/* Lightbox */}
      {lightboxImage && (
        <div className={styles.lightbox} onClick={() => setLightboxImage(null)}>
          <button className={styles.closeButton} onClick={() => setLightboxImage(null)}>
            <X size={32} />
          </button>
          <img 
            src={lightboxImage} 
            alt="Full view" 
            className={styles.lightboxImage} 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      <header className={styles.header}>
        {/* ... (header content) ... */}
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
                <Gallery 
                  images={item.images} 
                  onDelete={(index) => handleDeleteImage(item.id, index)}
                  onImageClick={(src) => setLightboxImage(src)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
