import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "냠킷 - 냠냠이의 먹킷리스트",
  description: "가성비 간식 큐레이션 플랫폼. 편의점·마트 간식 꿀조합, 혼밥 야식 추천, 가성비 간식 리스트를 모아봤어요.",
  keywords: ["냠킷", "간식 추천", "가성비 간식", "꿀조합", "야식 추천", "혼밥 간식", "편의점 간식", "먹킷리스트"],
  icons: { icon: '/logo.svg', apple: '/icons/icon-192.png' },
  manifest: '/manifest.json',
  verification: { other: { 'naver-site-verification': '683ab55dce626006711c6ac8936a8e3925fc66a9' } },
  openGraph: {
    title: "냠킷 - 냠냠이의 먹킷리스트",
    description: "가성비 간식 큐레이션 플랫폼. 꿀조합·야식·혼밥 간식을 모아봤어요.",
    url: "https://nyamkit.vercel.app",
    siteName: "냠킷",
    locale: "ko_KR",
    type: "website",
  },
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
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
