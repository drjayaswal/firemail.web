import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import Loading from "./loading";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              width: "fit-content",
              background: "#000000",
              border: "1px solid #000000",
              borderRadius: "15px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#d7df23",
              boxShadow: "0 0px 0px rgba(0, 0, 0, 0.05)",
            },
            actionButtonStyle: {
              background: "#d7df23",
              color: "#000000",
              borderRadius: "7px",
              fontSize: "12px",
              marginLeft: "10px"
            }
          }} />
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
