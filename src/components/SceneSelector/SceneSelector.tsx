"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./SceneSelector.module.css";
import { useLocale } from "@/contexts/LocaleContext";

export type SceneId = "casual" | "professional" | "outdoor" | "travel" | "nightout";

interface Scene {
  id: SceneId;
  emoji: string;
}

const scenes: Scene[] = [
  { id: "casual", emoji: "☕" },
  { id: "professional", emoji: "💼" },
  { id: "outdoor", emoji: "🌲" },
  { id: "travel", emoji: "✈️" },
  { id: "nightout", emoji: "🍸" },
];

interface SceneSelectorProps {
  selectedScene: SceneId;
  onSelectScene: (id: SceneId) => void;
}

export default function SceneSelector({ selectedScene, onSelectScene }: SceneSelectorProps) {
  const { t } = useLocale();
  
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t("scene.title")}</h3>
      <div className={styles.grid}>
        {scenes.map((scene) => (
          <motion.div
            key={scene.id}
            className={`${styles.card} ${selectedScene === scene.id ? styles.cardSelected : ""}`}
            onClick={() => onSelectScene(scene.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={styles.icon}>{scene.emoji}</div>
            <div className={styles.label}>{t(`scene.${scene.id}`)}</div>
            <div className={styles.description}>{t(`scene.${scene.id}.desc`)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
