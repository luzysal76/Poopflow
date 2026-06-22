import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "물한잔똥한번 | Poopflow",
  description: "배변일기 & 물마시기 통합 장 건강 관리 앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-cream min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
