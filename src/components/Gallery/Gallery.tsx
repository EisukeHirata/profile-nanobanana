"use client";

import React from "react";
import { Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Gallery.module.css";

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  if (images.length === 0) return null;

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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your New Look</h2>
      <div className={styles.grid}>
        {images.map((image, index) => {
          const src = image.startsWith("data:image") 
            ? image 
            : `data:image/jpeg;base64,${image}`;
            
          return (
          <motion.div 
            key={index} 
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.imageWrapper}>
              <img src={src} alt={`Generated ${index}`} className={styles.image} />
            </div>
            <div className={styles.actions}>
              <button 
                className={styles.downloadButton} 
                title="Download"
                onClick={() => handleDownload(src, index)}
              >
                <Download size={20} />
              </button>
              <button className={styles.downloadButton} title="Share">
                <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        );
        })}
      </div>
    </div>
  );
}
