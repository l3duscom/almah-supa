import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NotificationProvider from "@/components/notification-provider";
import CelestialBackground from "@/components/celestial-background";
import RootLayoutClient from "@/components/root-layout-client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Almah",
  description: "Sua plataforma de bem-estar mental e diário pessoal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-20`}
      >
        <CelestialBackground />
        {children}
        <RootLayoutClient />
        <NotificationProvider />
      </body>
    </html>
  );
}
