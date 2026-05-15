import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import "./globals.css";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  title: "fathom²ail",
  description: "Your email managed in a better way",
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon-32x32.png",
    apple: "/icons/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/icons/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/icons/favicon-16x16.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col select-none">
        <Toaster/>
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
