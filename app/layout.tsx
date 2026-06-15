import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mushen · 赛博半仙",
  description: "AI 解读你的紫微斗数 / 奇门遁甲 / 四柱八字。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}