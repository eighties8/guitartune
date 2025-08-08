import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Guitar Tune App - Online Guitar Tuner',
  description: 'Online guitar tuner. Get perfect pitch with our advanced tuning tools.',
  keywords: 'guitar tuner, online guitar tuner, guitar tuner app, guiter tune, pitch detection, music tools',
  authors: [{ name: 'GuitarTune.app' }],
  creator: 'GuitarTune.app',
  publisher: 'GuitarTune.app',
  robots: 'index, follow',
  openGraph: {
    title: 'GuitarTune.app - Online Guitar Tuner',
    description: 'Professional onone guitar tuner. Get perfect pitch with our advanced tuning tools.',
    url: 'https://guitartune.app',
    siteName: 'Guitar Tune',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guitar Tune App - Online Guitar Tuner',
    description: 'guitar tuner made simple. Get perfect pitch with our advanced tuning tools.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="flex flex-col min-h-svh">
        <main className="sm:flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
