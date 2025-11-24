"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import ImageUpload from "@/components/ImageUpload/ImageUpload";
import SceneSelector, { SceneId } from "@/components/SceneSelector/SceneSelector";
import Generator from "@/components/Generator/Generator";
import Gallery from "@/components/Gallery/Gallery";
import styles from "./page.module.css";

import Options, { AspectRatio, ShotType, EyeContact } from "@/components/Options/Options";
import LoginButton from "@/components/LoginButton/LoginButton";

import LandingPage from "@/components/LandingPage/LandingPage";
import PricingModal from "@/components/Pricing/PricingModal";

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneId>("casual");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3:4");
  const [shotType, setShotType] = useState<ShotType>("Upper body");
  const [eyeContact, setEyeContact] = useState<EyeContact>("Direct");
  const [quality, setQuality] = useState<"Standard" | "Pro">("Standard");
  const [imageCount, setImageCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!session) {
    return <LandingPage />;
  }

  const handleImagesSelected = (files: File[]) => {
    setSelectedImages(files);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImages([]);
    
    try {
      // Convert images to base64
      const base64Images = await Promise.all(
        selectedImages.map(async (file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
              const base64 = result.split(",")[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: base64Images,
          scene: selectedScene,
          prompt: customPrompt,
          aspectRatio,
          shotType,
          eyeContact,
          quality, // Pass quality to API
          imageCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setIsPricingOpen(true);
          throw new Error("Insufficient credits. Please upgrade or top up.");
        }
        throw new Error(data.error || data.message || "Failed to generate images");
      }

      if (data.images && Array.isArray(data.images)) {
        setGeneratedImages(data.images);
      }
    } catch (error: any) {
      console.error("Generation failed", error);
      alert(error.message || "Failed to generate images. Please check your API key and quotas.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className={styles.main}>
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h1 className={styles.title}>
            <span className="gradient-text">NanoProfile</span>
          </h1>
          <LoginButton onOpenPricing={() => setIsPricingOpen(true)} />
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <div className={styles.scrollContent}>
            <section>
              <h2 className={styles.sectionTitle}>1. Upload Photos</h2>
              <ImageUpload onImagesSelected={handleImagesSelected} />
            </section>

            <section>
              <h2 className={styles.sectionTitle}>2. Choose Style</h2>
              <SceneSelector 
                selectedScene={selectedScene} 
                onSelectScene={setSelectedScene} 
              />
            </section>

            <section>
              <h2 className={styles.sectionTitle}>3. Options</h2>
              <Options 
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                shotType={shotType}
                setShotType={setShotType}
                eyeContact={eyeContact}
                setEyeContact={setEyeContact}
                quality={quality}
                setQuality={setQuality}
                imageCount={imageCount}
                setImageCount={setImageCount}
              />
              <textarea 
                className={styles.promptInput}
                placeholder="Additional details (e.g., 'wearing a blue suit', 'smiling')..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </section>

            <Generator 
              onGenerate={handleGenerate} 
              isGenerating={isGenerating}
              isDisabled={selectedImages.length === 0}
              cost={imageCount}
            />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <h2 className={styles.sectionTitle}>Generated Results</h2>
          {generatedImages.length > 0 ? (
            <Gallery images={generatedImages} />
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#52525b',
              border: '2px dashed #27272a',
              borderRadius: '1rem',
              margin: '1rem 0'
            }}>
              <p>Generated images will appear here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
