import type { Metadata } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _dmSerif = DM_Serif_Display({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-dm-serif' 
})

export const metadata: Metadata = {
  title: 'Calculadora Hipotecaria Madrid',
  description: 'Calcula y desglosa la compra de tu vivienda en Madrid. Simula hipoteca, gastos iniciales, tabla de amortizacion y mas.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${_inter.variable} ${_dmSerif.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
