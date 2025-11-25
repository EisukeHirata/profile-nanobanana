"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Download, Trash2 } from "lucide-react";

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
  const [lightbox, setLightbox] = useState<{ images: string[], currentIndex: number } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ generationId: string, imageIndex: number } | null>(null);

  useEffect(() => {
    console.log("ProfilePage: status changed:", status);
    const fetchData = async () => {
      if (status === "authenticated") {
        console.log("ProfilePage: Starting fetch...");
        
        // Fetch Credits (Critical for UI)
        try {
          const creditsRes = await fetch("/api/user/credits");
          if (creditsRes.ok) {
            const creditsData = await creditsRes.json();
            console.log("ProfilePage: Credits fetched", creditsData);
            setProfile({
              credits: creditsData.credits,
              subscription_tier: creditsData.subscription_tier || "Free",
              subscription_status: creditsData.subscription_status || "active"
            });
          } else {
            console.error("ProfilePage: Failed to fetch credits", creditsRes.status);
          }
        } catch (error) {
          console.error("ProfilePage: Error fetching credits", error);
        }

        // Fetch History (Can fail without breaking page)
        try {
          const historyRes = await fetch("/api/history");
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            console.log("ProfilePage: History fetched", historyData.history?.length);
            if (historyData.history) {
              setHistory(historyData.history);
            }
          } else {
            console.error("ProfilePage: Failed to fetch history", historyRes.status);
          }
        } catch (error) {
          console.error("ProfilePage: Error fetching history", error);
        }

        console.log("ProfilePage: Setting isLoading to false");
        setIsLoading(false);

      } else if (status === "unauthenticated") {
          console.log("ProfilePage: Unauthenticated, redirecting...");
          setIsLoading(false);
      }
    };

    fetchData();
  }, [status]);

  const handleDeleteImage = (generationId: string, imageIndex: number) => {
    setDeleteConfirmation({ generationId, imageIndex });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { generationId, imageIndex } = deleteConfirmation;

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
      
      setDeleteConfirmation(null);

    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete image");
    }
  };

  const handleDownload = (src: string, index: number) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `nano-profile-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length
    });
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      currentIndex: (lightbox.currentIndex - 1 + lightbox.images.length) % lightbox.images.length
    });
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
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Delete Image?</h3>
            <p>Are you sure you want to delete this image? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton} 
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </button>
              <button 
                className={styles.deleteConfirmButton} 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxControls}>
             <button 
              className={styles.controlButton} 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(
                  lightbox.images[lightbox.currentIndex], 
                  lightbox.currentIndex
                );
              }}
              title="Download"
            >
              <Download size={24} />
            </button>
            <button className={styles.controlButton} onClick={() => setLightbox(null)}>
              <X size={24} />
            </button>
          </div>
          
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {lightbox.images.length > 1 && (
              <button className={styles.navButton} onClick={prevImage} style={{ left: '20px' }}>
                ←
              </button>
            )}
            
            <img 
              src={lightbox.images[lightbox.currentIndex].startsWith("data:image") 
                ? lightbox.images[lightbox.currentIndex] 
                : `data:image/jpeg;base64,${lightbox.images[lightbox.currentIndex]}`} 
              alt="Full view" 
              className={styles.lightboxImage} 
            />

            {lightbox.images.length > 1 && (
              <button className={styles.navButton} onClick={nextImage} style={{ right: '20px' }}>
                →
              </button>
            )}
            
            {lightbox.images.length > 1 && (
              <div className={styles.counter}>
                {lightbox.currentIndex + 1} / {lightbox.images.length}
              </div>
            )}
          </div>
        </div>
      )}

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
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteImage(item.id, 0)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {/* Unified Display */}
                <div 
                  className={styles.imageStack} 
                  onClick={() => setLightbox({ images: item.images, currentIndex: 0 })}
                >
                  {item.images.slice(0, 3).map((img, idx) => (
                    <div 
                      key={idx} 
                      className={styles.stackItem}
                      style={{ 
                        transform: item.images.length > 1 ? `translate(${idx * 5}px, ${idx * 5}px)` : 'none',
                        zIndex: 3 - idx,
                        width: '200px',
                        height: '200px',
                        position: item.images.length > 1 ? 'absolute' : 'relative',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        border: '2px solid var(--surface-highlight)',
                      }}
                    >
                      <img 
                        src={img.startsWith("data:image") ? img : `data:image/jpeg;base64,${img}`} 
                        alt={`Stack ${idx}`} 
                      />
                    </div>
                  ))}
                  {item.images.length > 1 && (
                    <div className={styles.stackCount}>+{item.images.length}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
