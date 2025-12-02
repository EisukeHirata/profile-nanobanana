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

import { X, Maximize2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneId>("casual");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("3:4");
  const [shotType, setShotType] = useState<ShotType>("Upper body");
  const [eyeContact, setEyeContact] = useState<EyeContact>("Direct");
  const [imageCount, setImageCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [pricingMessage, setPricingMessage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Better loading state
  if (status === "loading") {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#09090b',
        color: '#e4e4e7'
      }}>
        <div className={styles.spinner} style={{ marginRight: '1rem' }} />
        <span>Loading NanoProfile...</span>
      </div>
    );
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
    setProgress(0);

    // Simulate progress
    const duration = 15000; // Estimated 15 seconds
    const step = 100;
    const increment = (step / duration) * 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Cap at 90% until complete
        return prev + increment;
      });
    }, step);
    
    try {
      // Convert images to base64 with mimeType
      const processedImages = await Promise.all(
        selectedImages.map(async (file) => {
          return new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
              const base64 = result.split(",")[1];
              resolve({
                data: base64,
                mimeType: file.type || "image/jpeg" // Default to jpeg if missing
              });
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
          images: processedImages,
          scene: selectedScene,
          prompt: customPrompt,
          aspectRatio,
          shotType,
          eyeContact,
          quality: "Pro", // Force Pro quality
          imageCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setPricingMessage("You don't have enough credits to generate these images. Please upgrade or top up.");
          setIsPricingOpen(true);
          return; // Don't throw error to avoid alert
        }
        throw new Error(data.error || data.message || "Failed to generate images");
      }

      if (data.images && Array.isArray(data.images)) {
        setGeneratedImages(data.images);
        setProgress(100);
      }
    } catch (error: any) {
      console.error("Generation failed", error);
      alert(error.message || "Failed to generate images. Please check your API key and quotas.");
    } finally {
      setIsGenerating(false);
      clearInterval(interval);
    }
  };

  const costPerImage = 5; // Always Pro quality
  const totalCost = imageCount * costPerImage;

  return (
    <main className={styles.main}>
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => {
          setIsPricingOpen(false);
          setPricingMessage(null);
        }}
        message={pricingMessage}
      />
      
      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className={styles.lightbox} 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'zoom-out'
          }}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <X size={32} />
          </button>
          <img 
            src={lightboxImage} 
            alt="Full view" 
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

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
              cost={totalCost}
            />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <h2 className={styles.sectionTitle}>Generated Results</h2>
          
          {isGenerating && (
            <div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              minHeight: '300px'
            }}>
              <div className={styles.progressBarContainer} style={{ 
                width: '80%', 
                maxWidth: '400px',
                height: '8px', 
                backgroundColor: '#27272a', 
                borderRadius: '4px', 
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  width: `${progress}%`, 
                  height: '100%', 
                  backgroundColor: '#8b5cf6', 
                  transition: 'width 0.1s ease' 
                }} />
              </div>
              <p style={{ color: '#a1a1aa', fontSize: '1rem', textAlign: 'center' }}>
                Creating your masterpiece... {Math.round(progress)}%
              </p>
            </div>
          )}

          {generatedImages.length > 0 ? (
            <Gallery 
              images={generatedImages} 
              onImageClick={(src) => setLightboxImage(src)}
            />
          ) : (
            !isGenerating && (
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
            )
          )}
        </div>
      </div>
    </main>
  );
}
