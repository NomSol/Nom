import { AIAssistantButton } from '@/components/AIAssistantButton';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '寻宝游戏',
  description: '一个有趣的寻宝游戏平台',
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
          <AIAssistantButton />
          <Toaster />
        </Providers>
      </body>
    </html >
  )
}
