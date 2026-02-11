import Cart from '@/components/Cart'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { CartProvider } from '@/lib/cartContext'
import { ThemeProvider } from '@/lib/ThemeProvider'
import { WishlistProvider } from '@/lib/wishlistContext'
import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const CookieConsent = dynamic(() => import('@/components/CookieConsent'), {
  ssr: false,
})
const NewsletterPopup = dynamic(() => import('@/components/NewsletterPopup'), {
  ssr: false,
})

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
  metadataBase: new URL('https://olelemalele.com'),
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
    url: '/',
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


import AdminOverlay from '@/components/admin/AdminOverlay'
import LoadingScreenWrapper from './LoadingScreenWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} dark`}>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for third parties */}
        <link rel="dns-prefetch" href="https://gelato.com" />
        <link rel="dns-prefetch" href="https://printify.com" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LoadingScreenWrapper />
          <WishlistProvider>
            <CartProvider>
              <Header />
              <main id="main">
                {children}
              </main>
              <Footer />
              <Cart />
              <CookieConsent />
              <NewsletterPopup />
              <AdminOverlay />
            </CartProvider>
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
