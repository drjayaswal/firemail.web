import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import "./globals.css";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://unmail.io"),
  title: {
    default: "unmail",
    template: "%s | unmail",
  },
  description: "Secure, AI-powered Gmail analysis and local vault encryption. Trim the noise and keep your voice.",
  applicationName: "unmail",
  authors: [{ name: "Unmail Team" }],
  keywords: ["email analysis", "privacy", "gmail", "encryption", "ai mail"],
  icons: {
    icon: [
      { url: "/icons/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/icons/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/icons/favicon-light.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "unmail",
    description: "Trimming the noise, keeping the voice.",
    url: "https://unmail.io",
    siteName: "unmail",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "unmail",
    description: "Trimming the noise, keeping the voice.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col selection:bg-black selection:text-white">
        <Toaster />
        <Suspense fallback={<Loading />}>
          <main className="flex-1">
            {children}
          </main>
        </Suspense>
      </body>
    </html>
  );
}