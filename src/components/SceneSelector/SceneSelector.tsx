"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./SceneSelector.module.css";

export type SceneId = "casual" | "professional" | "outdoor" | "travel" | "nightout";

interface Scene {
  id: SceneId;
  label: string;
  emoji: string;
  description: string;
}

const scenes: Scene[] = [
  { id: "casual", label: "Casual Dating", emoji: "☕", description: "Relaxed coffee shop vibe" },
  { id: "professional", label: "Professional", emoji: "💼", description: "Clean & confident look" },
  { id: "outdoor", label: "Outdoor Adventure", emoji: "🌲", description: "Nature & hiking style" },
  { id: "travel", label: "Travel", emoji: "✈️", description: "Iconic landmarks background" },
  { id: "nightout", label: "Night Out", emoji: "🍸", description: "Stylish evening atmosphere" },
];

interface SceneSelectorProps {
  selectedScene: SceneId;
  onSelectScene: (id: SceneId) => void;
}

export default function SceneSelector({ selectedScene, onSelectScene }: SceneSelectorProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Choose a Vibe</h3>
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
            <div className={styles.label}>{scene.label}</div>
            <div className={styles.description}>{scene.description}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
