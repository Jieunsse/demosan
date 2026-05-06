import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from './components/Header'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: '배달파티 — 기숙사 배달 같이 시켜요',
  description: '최소 주문 금액, 혼자 채우기 힘들 때. 기숙사 파티원 모집 플랫폼.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50 min-h-screen`}>
        <Header />
        {children}
      </body>
    </html>
  )
}
