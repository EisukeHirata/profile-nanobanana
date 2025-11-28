"use client";

import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import styles from "@/app/profile/profile.module.css"; // Reuse profile styles
import { GeneratedItem } from "@/utils/storage";

interface HistoryItemProps {
  item: GeneratedItem;
  onDelete: (id: string) => void;
  onImageClick: (images: string[], index: number) => void;
}

export default function HistoryItem({ item, onDelete, onImageClick }: HistoryItemProps) {
  const [fetchedImages, setFetchedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(!item.images || item.images.length === 0);

  // Use props if available (e.g. after delete), otherwise use fetched images
  const displayImages = (item.images && item.images.length > 0) ? item.images : fetchedImages;

  useEffect(() => {
    // If we already have images from props, no need to fetch
    if (item.images && item.images.length > 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/generations/${item.id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.generation?.images) {
            setFetchedImages(data.generation.images);
          }
        }
      } catch (error) {
        console.error("Failed to load images for generation", item.id, error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [item.id]); // Stable dependency

  return (
    <div className={styles.historyItem}>
      <div className={styles.itemHeader}>
        <span className={styles.date}>
          {new Date(item.timestamp).toLocaleDateString()}
        </span>
        <span className={styles.sceneBadge}>{item.scene}</span>
        <button 
          className={styles.deleteButton}
          onClick={() => onDelete(item.id)}
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      {loading ? (
        <div style={{ 
          width: '200px', 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          color: '#888'
        }}>
          Loading...
        </div>
      ) : (
        <div 
          className={styles.imageStack} 
          onClick={() => onImageClick(displayImages, 0)}
        >
          {displayImages.slice(0, 3).map((img, idx) => (
            <div 
              key={idx} 
              className={styles.stackItem}
              style={{ 
                transform: displayImages.length > 1 ? `translate(${idx * 5}px, ${idx * 5}px)` : 'none',
                zIndex: 3 - idx,
                width: '200px',
                height: '200px',
                position: displayImages.length > 1 ? 'absolute' : 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: '2px solid var(--surface-highlight)',
              }}
            >
              <img 
                src={
                  img.startsWith("http") || img.startsWith("data:image") 
                    ? img 
                    : `data:image/jpeg;base64,${img}`
                } 
                alt={`Stack ${idx}`}
              />
            </div>
          ))}
          {displayImages.length > 1 && (
            <div className={styles.stackCount}>+{displayImages.length}</div>
          )}
        </div>
      )}
    </div>
  );
}
