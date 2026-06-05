import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PartSelect Parts Assistant',
  description: 'Find the right refrigerator and dishwasher parts with Patsy, your AI parts expert.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
