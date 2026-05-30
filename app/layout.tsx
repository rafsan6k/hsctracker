import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AppShell from "@/components/AppShell";
import { GoogleAnalytics } from "@next/third-parties/google";
import InstallButton from "@/components/InstallButton";
import InstallBottomSheet from "@/components/InstallBottomSheet";



export const metadata: Metadata = {
  title: "StudyFlow",
  description: "StudyFlow",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f0d15",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0f0d15" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Rounded" rel="stylesheet" />
   
  
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta
      name="apple-mobile-web-app-status-bar-style"
      content="black"
    />
  
  
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <GoogleAnalytics gaId="G-PJLNM14C58"/>
        <InstallBottomSheet />
        <InstallButton />
      </body>
    </html>
  );
}
