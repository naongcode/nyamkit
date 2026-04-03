import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "냠킷 - 냠냠이의 먹킷리스트",
  description: "가성비 간식 큐레이션 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.className} min-h-screen bg-orange-50`}>
        {children}
      </body>
    </html>
  );
}
