import Cart from '@/components/Cart'
import CookieConsent from '@/components/CookieConsent'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import LocoScroll from '@/components/LocoScroll'
import NewsletterPopup from '@/components/NewsletterPopup'
import { CartProvider } from '@/lib/cartContext'
import { WishlistProvider } from '@/lib/wishlistContext'
import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: 'Olelemalele — Premium Canvas Art Collection',
    template: '%s | Olelemalele',
  },
  description: 'Own the moment. Premium museum-quality canvas prints for the modern collector. Limited editions. Infinite statements.',
  keywords: ['canvas art', 'wall art', 'premium prints', 'art drops', 'limited edition', 'museum quality', 'modern art', 'home decor'],
  authors: [{ name: 'Olelemalele Studio' }],
  creator: 'Olelemalele',
  publisher: 'Olelemalele',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Olelemalele — Premium Canvas Art Collection',
    description: 'Own the moment. Premium museum-quality canvas prints for the modern collector.',
    url: 'https://olelemalele.com',
    siteName: 'Olelemalele',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Olelemalele — Premium Canvas Art',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olelemalele — Premium Canvas Art Collection',
    description: 'Own the moment. Premium museum-quality canvas prints.',
    images: ['/og-image.jpg'],
    creator: '@olelemalele',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

import ConsoleGuard from '@/components/ConsoleGuard'
import CustomCursor from '@/components/CustomCursor'
import MysticBaseline from '@/components/MysticBaseline'
import LoadingScreenWrapper from './LoadingScreenWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for third parties */}
        <link rel="dns-prefetch" href="https://gelato.com" />
        <link rel="dns-prefetch" href="https://printify.com" />
        {/* Preload hero video for faster LCP */}
        <link
          rel="preload"
          href="/WebGL_Fluid_Simulation_Video_Generation.mp4"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <LoadingScreenWrapper />
        <ConsoleGuard />
        <MysticBaseline />
        <CustomCursor />
        <WishlistProvider>
          <CartProvider>
            <LocoScroll>
              <Header />
              <main id="main">
                {children}
              </main>
              <Footer />
              <Cart />
              <CookieConsent />
              <NewsletterPopup />
            </LocoScroll>
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  )
}
