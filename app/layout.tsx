import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "냠킷 - 냠냠이의 먹킷리스트",
  description: "가성비 간식 큐레이션 플랫폼",
  icons: { icon: '/logo.svg' },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light" style={{ colorScheme: 'light' }}>
      <body className={`${geist.className} min-h-screen bg-orange-50`}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
