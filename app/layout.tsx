import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/navbar'

export const metadata: Metadata = {
  title: 'SEAPEDIA - Marketplace Indonesia',
  description: 'Platform marketplace multi-peran: Buyer, Seller, Driver, dan Admin.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}