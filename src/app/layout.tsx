import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "universal-skeleton — docs, guides and playground",
  description:
    "Framework-agnostic skeleton loader that auto-generates skeletons from your real UI. 8 effects, zero dependencies, one Web Component for React, Vue, Angular, Svelte, plain HTML and everything in between.",
  keywords: [
    "universal-skeleton", "skeleton loader", "skeleton screen", "shimmer",
    "web component", "framework agnostic", "react", "vue", "angular", "svelte",
  ],
  openGraph: {
    title: "universal-skeleton — skeletons that look like your real UI",
    description: "Auto-generate skeletons from your real DOM. 8 effects, zero dependencies, works in every framework.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
