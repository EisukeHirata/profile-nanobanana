"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import styles from "./Generator.module.css";

interface GeneratorProps {
  onGenerate: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
}

export default function Generator({ onGenerate, isGenerating, isDisabled }: GeneratorProps) {
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
            <span>Generate Photos</span>
          </>
        )}
      </button>
      
      {isGenerating && (
        <div className={styles.loadingContainer}>
          <p>This usually takes about 10-15 seconds.</p>
        </div>
      )}
    </div>
  );
}
