import "./globals.css"; // 🌟 这就是最关键的“供水管线”，把你的暗黑配置输送给全站！
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trail Hub Engine",
  description: "基于地理数据的越野跑装备智能匹配系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      {/* 确保这里没有其他奇怪的类名干扰 */}
      <body>{children}</body>
    </html>
  );
}
