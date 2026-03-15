import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trail Hub - Professional Trail Running Dashboard',
  description: 'Digital gear management and intelligent race recommendations for trail running enthusiasts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
