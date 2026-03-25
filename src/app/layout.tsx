import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Access Hub',
  description: 'Zentrale Registrierung und zeitlich gueltiger Zugang fuer kostenpflichtige Apps',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <img src="/logo-dirk.jpg" alt="" aria-hidden="true" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'60vw',maxWidth:'600px',height:'auto',opacity:0.07,filter:'grayscale(1)',mixBlendMode:'multiply',pointerEvents:'none',zIndex:0,userSelect:'none'}} />
        {children}
      </body>
    </html>
  )
}
