import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "물한잔똥한번 | Poopflow",
  description: "배변일기 & 물마시기 통합 장 건강 관리 앱 — 오늘 얼마나 마셨고, 얼마나 건강하게 배출했는지 기록하세요",
  keywords: ["배변일기", "물마시기", "장건강", "변비", "IBS", "건강관리"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "물한잔똥한번",
  },
};

export const viewport: Viewport = {
  themeColor: "#4FC3F7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0, background: '#FFF8E7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
