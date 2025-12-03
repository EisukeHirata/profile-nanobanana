"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";

type Locale = "en" | "ja";
type Currency = "USD" | "JPY";

interface LocaleContextType {
  locale: Locale;
  currency: Currency;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "pricing.title": "Upgrade Your Profile",
    "pricing.subtitle": "Choose a plan or top up credits as you go.",
    "pricing.subscribe": "Subscribe",
    "pricing.buy": "Buy",
    "pricing.mostPopular": "Most Popular",
    "pricing.loading": "Loading...",
    "pricing.orTopUp": "OR TOP UP CREDITS",
    "pricing.features.credits": "Credits / month",
    "pricing.features.speed.standard": "Standard Speed",
    "pricing.features.speed.fast": "Fast Generation",
    "pricing.features.speed.max": "Max Speed",
    "pricing.features.noWatermark": "No Watermark",
    "pricing.features.prioritySupport": "Priority Support",
    "pricing.features.earlyAccess": "Early Access Features",
    "pricing.month": "/mo",
    "home.title": "NanoProfile",
    "home.loading": "Loading NanoProfile...",
    "home.upload.title": "1. Upload Photos",
    "home.style.title": "2. Choose Style",
    "home.options.title": "3. Options",
    "home.prompt.placeholder":
      "Additional details (e.g., 'wearing a blue suit', 'smiling')...",
    "home.results.title": "Generated Results",
    "home.results.generating": "Creating your masterpiece...",
    "home.results.empty": "Generated images will appear here",
    "home.back": "← Back to Edit",
    "generator.button": "Generate Photos",
    "generator.magic": "Magic in progress...",
    "footer.tagline": "AI-powered profile photos for everyone",
    "footer.product": "Product",
    "footer.home": "Home",
    "footer.profile": "My Profile",
    "footer.support": "Support",
    "footer.contact": "Contact Us",
    "footer.refund": "Refund Policy",
    "footer.cancellation": "Cancellation Policy",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.rights": "All rights reserved.",
    "footer.powered": "Powered by Google Gemini 2.5",
    "profile.title": "My Profile",
    "profile.back": "← Back to Generator",
    "profile.plan": "Plan",
    "profile.credits": "Credits",
    "profile.manage": "Manage Plan / Buy Credits",
    "profile.history": "History",
    "profile.loading": "Loading...",
    "profile.noImages": "No generated images yet.",
    "profile.createFirst": "Create your first photo",
    "profile.delete.title": "Delete Images?",
    "profile.delete.message":
      "Are you sure you want to delete all images in this generation? This action cannot be undone.",
    "profile.delete.cancel": "Cancel",
    "profile.delete.confirm": "Delete",
    "profile.delete.deleting": "Deleting image...",
    "profile.delete.deleted": "Deleted!",
    "manage.title": "Manage Plan",
    "manage.back": "← Back to Profile",
    "manage.currentPlan": "Current Plan",
    "manage.availablePlans": "Available Plans",
    "manage.buyCredits": "Buy Credits",
    "manage.cancel": "Cancel Subscription",
    "manage.cancel.message":
      "Your subscription will automatically renew. You can cancel anytime, and you'll continue to have access until the end of your billing period.",
    "manage.cancel.button": "Cancel Subscription",
    "manage.cancel.canceling": "Canceling...",
    "manage.policy": "View Cancellation Policy",
    "manage.current": "Current Plan",
    "manage.subscribe": "Subscribe",
    "manage.buy": "Buy",
    "lp.hero.title": "Create Your Perfect",
    "lp.hero.title.highlight": "AI Profile Photos",
    "lp.hero.title.suffix": "in Seconds",
    "lp.hero.subtitle":
      "Transform your selfies into professional-quality photos for LinkedIn, Social Media, and Dating apps. No photographer needed.",
    "lp.cta.start": "Get Started Free",
    "lp.features.upload.title": "Upload Selfies",
    "lp.features.upload.desc": "Just upload a few casual photos of yourself.",
    "lp.features.ai.title": "AI Magic",
    "lp.features.ai.desc": "Our AI generates photorealistic scenes and styles.",
    "lp.features.standout.title": "Stand Out Everywhere",
    "lp.features.standout.desc":
      "Boost your presence on LinkedIn, Instagram, and more.",
    "lp.signin": "Sign In",
    "lp.signout": "Sign out",
    "options.size": "Image Size",
    "options.shot": "Shot Type",
    "options.eye": "Eye Contact",
    "options.count": "Number of Images",
    "options.images": "Images",
    "options.image": "Image",
    "upload.title": "Upload your photos",
    "upload.subtitle": "Drag & drop or click to select multiple face photos",
    "scene.title": "Choose a Vibe",
    "scene.casual": "Casual Lifestyle",
    "scene.casual.desc": "Relaxed coffee shop vibe",
    "scene.professional": "Professional",
    "scene.professional.desc": "Clean & confident look",
    "scene.outdoor": "Outdoor Adventure",
    "scene.outdoor.desc": "Nature & hiking style",
    "scene.travel": "Travel",
    "scene.travel.desc": "Iconic landmarks background",
    "scene.nightout": "Night Out",
    "scene.nightout.desc": "Stylish evening atmosphere",
  },
  ja: {
    "pricing.title": "プランをアップグレード",
    "pricing.subtitle":
      "プランを選択するか、クレジットを追加購入してください。",
    "pricing.subscribe": "登録する",
    "pricing.buy": "購入する",
    "pricing.mostPopular": "一番人気",
    "pricing.loading": "読み込み中...",
    "pricing.orTopUp": "またはクレジットを追加購入",
    "pricing.features.credits": "クレジット / 月",
    "pricing.features.speed.standard": "標準スピード",
    "pricing.features.speed.fast": "高速生成",
    "pricing.features.speed.max": "最高速生成",
    "pricing.features.noWatermark": "透かしなし",
    "pricing.features.prioritySupport": "優先サポート",
    "pricing.features.earlyAccess": "新機能への早期アクセス",
    "pricing.month": "/月",
    "home.title": "NanoProfile",
    "home.loading": "NanoProfileを読み込み中...",
    "home.upload.title": "1. 写真をアップロード",
    "home.style.title": "2. スタイルを選択",
    "home.options.title": "3. オプション",
    "home.prompt.placeholder":
      "追加の詳細 (例: '青いスーツを着ている', '笑っている')...",
    "home.results.title": "生成結果",
    "home.results.generating": "傑作を作成中...",
    "home.results.empty": "生成された画像はここに表示されます",
    "home.back": "← 編集に戻る",
    "generator.button": "写真を生成",
    "generator.magic": "魔法をかけています...",
    "footer.tagline": "AIで誰でもプロフェッショナルなプロフィール写真を",
    "footer.product": "プロダクト",
    "footer.home": "ホーム",
    "footer.profile": "マイプロフィール",
    "footer.support": "サポート",
    "footer.contact": "お問い合わせ",
    "footer.refund": "返金ポリシー",
    "footer.cancellation": "キャンセルポリシー",
    "footer.legal": "法務",
    "footer.privacy": "プライバシーポリシー",
    "footer.terms": "利用規約",
    "footer.rights": "All rights reserved.",
    "footer.powered": "Powered by Google Gemini 2.5",
    "profile.title": "マイプロフィール",
    "profile.back": "← ジェネレーターに戻る",
    "profile.plan": "プラン",
    "profile.credits": "クレジット",
    "profile.manage": "プラン管理 / クレジット購入",
    "profile.history": "履歴",
    "profile.loading": "読み込み中...",
    "profile.noImages": "まだ生成された画像はありません。",
    "profile.createFirst": "最初の写真を作成する",
    "profile.delete.title": "画像を削除しますか？",
    "profile.delete.message":
      "この生成のすべての画像を削除してもよろしいですか？この操作は取り消せません。",
    "profile.delete.cancel": "キャンセル",
    "profile.delete.confirm": "削除",
    "profile.delete.deleting": "削除中...",
    "profile.delete.deleted": "削除しました！",
    "manage.title": "プラン管理",
    "manage.back": "← プロフィールに戻る",
    "manage.currentPlan": "現在のプラン",
    "manage.availablePlans": "利用可能なプラン",
    "manage.buyCredits": "クレジット購入",
    "manage.cancel": "サブスクリプションをキャンセル",
    "manage.cancel.message":
      "サブスクリプションは自動更新されます。いつでもキャンセルでき、請求期間の終了までアクセス権は維持されます。",
    "manage.cancel.button": "サブスクリプションをキャンセル",
    "manage.cancel.canceling": "キャンセル中...",
    "manage.policy": "キャンセルポリシーを表示",
    "manage.current": "現在のプラン",
    "manage.subscribe": "登録する",
    "manage.buy": "購入する",
    "lp.hero.title": "完璧な",
    "lp.hero.title.highlight": "AIプロフィール写真",
    "lp.hero.title.suffix": "を数秒で作成",
    "lp.hero.subtitle":
      "自撮り写真を、LinkedIn、SNS、マッチングアプリ用のプロ品質の写真に変身させましょう。カメラマンは不要です。",
    "lp.cta.start": "無料で始める",
    "lp.features.upload.title": "自撮りをアップロード",
    "lp.features.upload.desc": "普段の自撮り写真を数枚アップロードするだけ。",
    "lp.features.ai.title": "AIの魔法",
    "lp.features.ai.desc": "AIがフォトリアルなシーンとスタイルを生成します。",
    "lp.features.standout.title": "どこでも際立つ",
    "lp.features.standout.desc":
      "LinkedInやInstagramなどで存在感を高めましょう。",
    "lp.signin": "ログイン",
    "lp.signout": "ログアウト",
    "options.size": "画像サイズ",
    "options.shot": "ショットタイプ",
    "options.eye": "目線",
    "options.count": "生成枚数",
    "options.images": "枚",
    "options.image": "枚",
    "upload.title": "写真をアップロード",
    "upload.subtitle": "ドラッグ&ドロップまたはクリックして顔写真を複数選択",
    "scene.title": "雰囲気を選択",
    "scene.casual": "カジュアル",
    "scene.casual.desc": "リラックスしたカフェの雰囲気",
    "scene.professional": "プロフェッショナル",
    "scene.professional.desc": "清潔で自信に満ちた印象",
    "scene.outdoor": "アウトドア",
    "scene.outdoor.desc": "自然とハイキングスタイル",
    "scene.travel": "旅行",
    "scene.travel.desc": "象徴的なランドマークを背景に",
    "scene.nightout": "ナイトアウト",
    "scene.nightout.desc": "スタイリッシュな夜の雰囲気",
  },
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // Try to get locale from cookie first
    const cookieLocale = getCookie("NEXT_LOCALE") as Locale;
    if (cookieLocale && (cookieLocale === "en" || cookieLocale === "ja")) {
      setLocaleState(cookieLocale);
    } else {
      // Fallback to browser language if no cookie (though middleware should handle this)
      const browserLang = navigator.language;
      if (browserLang.toLowerCase().includes("ja")) {
        setLocaleState("ja");
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setCookie("NEXT_LOCALE", newLocale);
  };

  const currency: Currency = locale === "ja" ? "JPY" : "USD";

  const t = (key: string) => {
    return translations[locale][key] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, currency, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
