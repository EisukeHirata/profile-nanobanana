import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer/Footer";
import { LocaleProvider } from "@/contexts/LocaleContext";

export const metadata: Metadata = {
  title: "NanoProfile - AI Profile Photos",
  description: "Generate premium profile photos for any platform with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <LocaleProvider>
            {children}
            <Footer />
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
