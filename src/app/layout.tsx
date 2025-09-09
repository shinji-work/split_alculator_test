import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PWARegistration } from '@/components/PWARegistration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '割り勘計算アプリ',
  description: 'スマート割り勘計算機 - 簡単、正確、共有可能',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '割り勘計算'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: '/favicon.ico'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <PWARegistration />
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
} 