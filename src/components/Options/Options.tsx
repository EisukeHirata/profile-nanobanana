"use client";

import React from "react";
import styles from "./Options.module.css";

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export type ShotType = "Upper body" | "Full body" | "Close up";
export type EyeContact = "Direct" | "Looking away" | "Closed";

interface OptionsProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  shotType: ShotType;
  setShotType: (type: ShotType) => void;
  eyeContact: EyeContact;
  setEyeContact: (contact: EyeContact) => void;
  imageCount: number;
  setImageCount: (count: number) => void;
}

const ratios: { id: AspectRatio; label: string; width: number; height: number }[] = [
  { id: "1:1", label: "Square", width: 24, height: 24 },
  { id: "3:4", label: "Portrait", width: 18, height: 24 },
  { id: "4:3", label: "Landscape", width: 24, height: 18 },
  { id: "9:16", label: "Story", width: 14, height: 24 },
  { id: "16:9", label: "Cinema", width: 24, height: 14 },
];

const shotTypes: { id: ShotType; label: string; emoji: string }[] = [
  { id: "Close up", label: "Close Up", emoji: "🙂" },
  { id: "Upper body", label: "Upper Body", emoji: "👕" },
  { id: "Full body", label: "Full Body", emoji: "🚶" },
];

const eyeContacts: { id: EyeContact; label: string; emoji: string }[] = [
  { id: "Direct", label: "Direct", emoji: "👀" },
  { id: "Looking away", label: "Away", emoji: "🙄" },
  { id: "Closed", label: "Closed", emoji: "😌" },
];

export default function Options({ 
  aspectRatio, 
  setAspectRatio, 
  shotType, 
  setShotType,
  eyeContact,
  setEyeContact,
  imageCount,
  setImageCount
}: OptionsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.optionGroup}>
        <label className={styles.label}>Image Size</label>
        <div className={styles.grid}>
          {ratios.map((ratio) => (
            <div
              key={ratio.id}
              className={`${styles.card} ${aspectRatio === ratio.id ? styles.cardSelected : ""}`}
              onClick={() => setAspectRatio(ratio.id)}
            >
              <div 
                className={styles.ratioIcon} 
                style={{ width: ratio.width, height: ratio.height }} 
              />
              <span className={styles.cardLabel}>{ratio.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.optionGroup}>
        <label className={styles.label}>Shot Type</label>
        <div className={styles.grid}>
          {shotTypes.map((type) => (
            <div
              key={type.id}
              className={`${styles.card} ${shotType === type.id ? styles.cardSelected : ""}`}
              onClick={() => setShotType(type.id)}
            >
              <div className={styles.icon}>{type.emoji}</div>
              <span className={styles.cardLabel}>{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.optionGroup}>
        <label className={styles.label}>Eye Contact</label>
        <div className={styles.grid}>
          {eyeContacts.map((contact) => (
            <div
              key={contact.id}
              className={`${styles.card} ${eyeContact === contact.id ? styles.cardSelected : ""}`}
              onClick={() => setEyeContact(contact.id)}
            >
              <div className={styles.icon}>{contact.emoji}</div>
              <span className={styles.cardLabel}>{contact.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.optionGroup}>
        <label className={styles.label}>
          Number of Images
          <span style={{ color: "var(--primary)" }}>{imageCount}</span>
        </label>
        <select 
          className={styles.select}
          value={imageCount}
          onChange={(e) => setImageCount(Number(e.target.value))}
        >
          <option value={1}>1 Image</option>
          <option value={2}>2 Images</option>
          <option value={3}>3 Images</option>
          <option value={4}>4 Images</option>
        </select>
      </div>
    </div>
  );
}
