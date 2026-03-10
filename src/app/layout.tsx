import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Access Hub',
  description: 'Zentrale Registrierung und zeitlich gueltiger Zugang fuer kostenpflichtige Apps',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
