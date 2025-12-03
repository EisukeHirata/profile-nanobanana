"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ImageUpload from "@/components/ImageUpload/ImageUpload";
import SceneSelector, {
  SceneId,
} from "@/components/SceneSelector/SceneSelector";
import Generator from "@/components/Generator/Generator";
import Gallery from "@/components/Gallery/Gallery";
import styles from "@/app/page.module.css";

import Options, {
  AspectRatio,
  ShotType,
  EyeContact,
} from "@/components/Options/Options";
import LoginButton from "@/components/LoginButton/LoginButton";

import PricingModal from "@/components/Pricing/PricingModal";

import { X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

export default function HomeClient() {
  const { t } = useLocale();
  const { data: session, update } = useSession();
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
  const [showMobileResults, setShowMobileResults] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);

  const handleImagesSelected = (files: File[]) => {
    setSelectedImages(files);
  };

  // Check if file is HEIC/HEIF format
  const isHeicFile = (file: File): boolean => {
    const heicTypes = [
      "image/heic",
      "image/heif",
      "image/heic-sequence",
      "image/heif-sequence",
    ];
    const heicExtensions = [".heic", ".heif"];
    const fileName = file.name.toLowerCase();
    return (
      heicTypes.includes(file.type.toLowerCase()) ||
      heicExtensions.some((ext) => fileName.endsWith(ext))
    );
  };

  // Convert HEIC file to JPEG
  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      // Dynamically import heic2any only on client side
      const heic2any = (await import("heic2any")).default;

      const result = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.92,
      });

      // heic2any can return Blob or Blob[]
      const convertedBlob = Array.isArray(result) ? result[0] : result;

      if (!(convertedBlob instanceof Blob)) {
        throw new Error("変換結果が不正です");
      }

      // Convert Blob to File
      return new File(
        [convertedBlob],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        {
          type: "image/jpeg",
          lastModified: file.lastModified,
        }
      );
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      throw new Error(
        "HEIC画像の変換に失敗しました。別の形式でお試しください。"
      );
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowMobileResults(true);
    setGenerationError(null);
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

    const handleHeicError = () => {
      setGenerationError(
        "画像が生成されませんでした。対応していない画像形式の可能性があります。クレジットは消費されていません。HEIC画像はJPEG/PNGに変換してから再試行してください。"
      );
      setProgress(0);
    };

    try {
      // Step 1: Convert HEIC files to JPEG if needed
      setIsConvertingHeic(true);
      const convertedImages = await Promise.all(
        selectedImages.map(async (file) => {
          if (isHeicFile(file)) {
            return await convertHeicToJpeg(file);
          }
          return file;
        })
      );
      setIsConvertingHeic(false);

      // Step 2: Convert images to base64 with mimeType
      const processedImages = await Promise.all(
        convertedImages.map(async (file) => {
          return new Promise<{ data: string; mimeType: string }>(
            (resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64 = result.split(",")[1];
                resolve({
                  data: base64,
                  mimeType: file.type || "image/jpeg", // Default to jpeg if missing
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }
          );
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
          setPricingMessage(
            "You don't have enough credits to generate these images. Please upgrade or top up."
          );
          setIsPricingOpen(true);
          return; // Don't throw error to avoid alert
        }
        if (
          typeof data.error === "string" &&
          data.error
            .toLowerCase()
            .includes("string did not match the expected pattern")
        ) {
          handleHeicError();
          return;
        }
        throw new Error(
          data.error || data.message || "Failed to generate images"
        );
      }

      if (data.images && Array.isArray(data.images)) {
        setGeneratedImages(data.images);
        setProgress(100);
        // Refresh session to update credits
        await update();
      } else if (
        data.error &&
        data.error
          .toLowerCase()
          .includes("string did not match the expected pattern")
      ) {
        handleHeicError();
      }
    } catch (error: any) {
      console.error("Generation failed", error);
      setIsConvertingHeic(false);
      if (
        typeof error.message === "string" &&
        error.message
          .toLowerCase()
          .includes("string did not match the expected pattern")
      ) {
        handleHeicError();
      } else if (
        typeof error.message === "string" &&
        error.message.includes("HEIC画像の変換に失敗")
      ) {
        setGenerationError(error.message + " クレジットは消費されていません。");
        setProgress(0);
      } else {
        alert(
          error.message ||
            "Failed to generate images. Please check your API key and quotas."
        );
      }
    } finally {
      setIsGenerating(false);
      clearInterval(interval);
    }
  };

  useEffect(() => {
    if (
      showMobileResults &&
      typeof window !== "undefined" &&
      window.innerWidth <= 768
    ) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [showMobileResults]);

  const costPerImage = 1; // Charge 1 credit per image regardless of quality
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
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "zoom-out",
          }}
        >
          <button
            onClick={() => setLightboxImage(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            <X size={32} />
          </button>
          <img
            src={lightboxImage}
            alt="Full view"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <header className={styles.header}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1 className={styles.title}>
            <span className="gradient-text">NanoProfile</span>
          </h1>
          <LoginButton onOpenPricing={() => setIsPricingOpen(true)} />
        </div>
      </header>

      <div className={styles.content}>
        <div
          className={`${styles.leftPanel} ${
            showMobileResults ? styles.mobileHidden : ""
          }`}
        >
          <div className={styles.scrollContent}>
            <section>
              <h2 className={styles.sectionTitle}>{t("home.upload.title")}</h2>
              <ImageUpload onImagesSelected={handleImagesSelected} />
            </section>

            <section>
              <h2 className={styles.sectionTitle}>{t("home.style.title")}</h2>
              <SceneSelector
                selectedScene={selectedScene}
                onSelectScene={setSelectedScene}
              />
            </section>

            <section>
              <h2 className={styles.sectionTitle}>{t("home.options.title")}</h2>
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
                placeholder={t("home.prompt.placeholder")}
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

        <div
          className={`${styles.rightPanel} ${
            showMobileResults ? styles.mobileVisible : styles.mobileHidden
          }`}
        >
          <div className={styles.mobileHeader}>
            <button
              className={styles.mobileBackButton}
              onClick={() => setShowMobileResults(false)}
            >
              {t("home.back")}
            </button>
          </div>

          <h2 className={styles.sectionTitle}>{t("home.results.title")}</h2>

          {isGenerating && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: "300px",
              }}
            >
              {isConvertingHeic ? (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      border: "4px solid #27272a",
                      borderTop: "4px solid #8b5cf6",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <p style={{ color: "#a1a1aa", fontSize: "1rem" }}>
                    HEIC画像を変換中...
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className={styles.progressBarContainer}
                    style={{
                      width: "80%",
                      maxWidth: "400px",
                      height: "8px",
                      backgroundColor: "#27272a",
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        backgroundColor: "#8b5cf6",
                        transition: "width 0.1s ease",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      color: "#a1a1aa",
                      fontSize: "1rem",
                      textAlign: "center",
                    }}
                  >
                    {t("home.results.generating")} {Math.round(progress)}%
                  </p>
                </>
              )}
            </div>
          )}

          {generatedImages.length > 0 ? (
            <Gallery
              images={generatedImages}
              onImageClick={(src) => setLightboxImage(src)}
            />
          ) : (
            !isGenerating && (
              <div style={{ width: "100%" }}>
                {generationError ? (
                  <div
                    style={{
                      padding: "1.25rem",
                      borderRadius: "1rem",
                      backgroundColor: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#fca5a5",
                      textAlign: "center",
                      lineHeight: 1.6,
                    }}
                  >
                    {generationError}
                  </div>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#52525b",
                      border: "2px dashed #27272a",
                      borderRadius: "1rem",
                      margin: "1rem 0",
                    }}
                  >
                    <p>{t("home.results.empty")}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
