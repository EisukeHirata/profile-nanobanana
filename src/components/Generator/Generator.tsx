"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import styles from "./Generator.module.css";

interface GeneratorProps {
  onGenerate: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
  cost: number;
}

export default function Generator({ onGenerate, isGenerating, isDisabled, cost }: GeneratorProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      const duration = 15000; // Estimated 15 seconds
      const step = 100;
      const increment = (step / duration) * 100;

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev; // Cap at 90% until complete
          return prev + increment;
        });
      }, step);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className={styles.container}>
      <button 
        className={styles.button}
        onClick={onGenerate}
        disabled={isDisabled || isGenerating}
      >
        {isGenerating ? (
          <>
            <div className={styles.spinner} />
            <span>Magic in progress...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>Generate Photos ({cost} Credits)</span>
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className={styles.loadingContainer}>
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={styles.progressText}>Creating your masterpiece... {Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}
