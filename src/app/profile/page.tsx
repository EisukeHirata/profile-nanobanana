"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Download, Trash2 } from "lucide-react";

import { GeneratedItem } from "@/utils/storage";
import Gallery from "@/components/Gallery/Gallery";
import PricingModal from "@/components/Pricing/PricingModal";
import HistoryItem from "@/components/HistoryItem/HistoryItem";
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
  const [isCreditsLoading, setIsCreditsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[], currentIndex: number } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ generationId: string, imageIndex: number } | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'deleting' | 'success'>('idle');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'loading' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'loading') => {
    setToast({ message, type });
    if (type !== 'loading') {
      setTimeout(() => setToast(null), 3000);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      // Fetch Credits (Critical)
      fetch("/api/user/credits")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setProfile({
              credits: data.credits,
              subscription_tier: data.subscription_tier || "Free",
              subscription_status: data.subscription_status || "active"
            });
          }
        })
        .catch(err => console.error("Error fetching credits:", err))
        .finally(() => setIsCreditsLoading(false));

      // Fetch History (Non-critical)
      fetch("/api/history")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.history) {
            setHistory(data.history);
          }
        })
        .catch(err => console.error("Error fetching history:", err))
        .finally(() => setIsHistoryLoading(false));
    }
  }, [status, router]);

  const handleDeleteImage = (generationId: string, imageIndex: number) => {
    setDeleteConfirmation({ generationId, imageIndex });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { generationId } = deleteConfirmation;

    try {
      setDeleteStatus('deleting');
      const res = await fetch("/api/generations/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId, deleteAll: true }),
      });

      if (!res.ok) throw new Error("Failed to delete image");

      const data = await res.json();

      // Remove the entire generation from local state
      setHistory((prev) => prev.filter((item) => item.id !== generationId));
      
      setDeleteStatus('success');
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setDeleteConfirmation(null);
        setDeleteStatus('idle');
      }, 1500);

    } catch (error) {
      console.error("Delete failed", error);
      showToast("Failed to delete image", "error");
      setDeleteStatus('idle');
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

  if (status === "loading" || isCreditsLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className={styles.main}>
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 500
        }}>
          {toast.type === 'loading' && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid white',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {deleteStatus === 'idle' && (
              <>
                <h3>Delete Images?</h3>
                <p>Are you sure you want to delete all images in this generation? This action cannot be undone.</p>
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
              </>
            )}

            {deleteStatus === 'deleting' && (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid var(--primary)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }} />
                <p>Deleting image...</p>
              </div>
            )}

            {deleteStatus === 'success' && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#10b981' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✓</div>
                <p style={{ fontWeight: 600 }}>Deleted!</p>
              </div>
            )}
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
              src={
                lightbox.images[lightbox.currentIndex].startsWith("http") || 
                lightbox.images[lightbox.currentIndex].startsWith("data:image") 
                  ? lightbox.images[lightbox.currentIndex] 
                  : `data:image/jpeg;base64,${lightbox.images[lightbox.currentIndex]}`
              } 
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
              onClick={() => router.push('/manage-plan')}
            >
              Manage Plan / Buy Credits
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>History</h2>
        {isHistoryLoading ? (
          <div className={styles.loading}>Loading history...</div>
        ) : history.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No generated images yet.</p>
            <button onClick={() => router.push("/")} className={styles.createButton}>
              Create your first photo
            </button>
          </div>
        ) : (
          <div className={styles.historyGrid}>
            {history.map((item) => (
              <HistoryItem 
                key={item.id} 
                item={item} 
                onDelete={(id) => handleDeleteImage(id, 0)}
                onImageClick={(images, index) => setLightbox({ images, currentIndex: index })}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
