"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import styles from "./Generator.module.css";
import { useLocale } from "@/contexts/LocaleContext";

interface GeneratorProps {
  onGenerate: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
  cost: number;
}

export default function Generator({ onGenerate, isGenerating, isDisabled, cost }: GeneratorProps) {
  const { t } = useLocale();
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
            <span>{t("generator.magic")}</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>
              {t("generator.button")} ({cost} {t("pricing.features.credits").split(" ")[0]})
            </span>
          </>
        )}
      </button>
    </div>
  );
}
