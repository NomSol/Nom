import { Inter } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NOM',
  description: 'First Meme Coin Exit Gamified Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="zh">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html >
  )
}
