import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trail Hub Engine',
  description: '专业越野跑装备评分系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
