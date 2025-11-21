"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
}

export default function ImageUpload({ onImagesSelected }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (newFiles.length > 0) {
      setPreviews((prev) => [...prev, ...newPreviews]);
      onImagesSelected(newFiles);
    }
  }, [onImagesSelected]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeImage = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    // Note: In a real app, we'd also need to update the parent's file list
    // This simplified version just handles the visual preview for now
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          multiple
          accept="image/*"
          style={{ display: "none" }}
        />
        
        <div className={styles.iconWrapper}>
          <Upload size={32} />
        </div>
        
        <h3 className={styles.title}>Upload your photos</h3>
        <p className={styles.subtitle}>
          Drag & drop or click to select multiple face photos
        </p>
      </div>

      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div 
            className={styles.previewGrid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {previews.map((src, index) => (
              <motion.div 
                key={src} 
                className={styles.previewItem}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
              >
                <img src={src} alt={`Preview ${index}`} className={styles.previewImage} />
                <button 
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
