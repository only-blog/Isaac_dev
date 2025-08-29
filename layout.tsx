import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/hooks/use-auth"
import { InviteProcessor } from "@/components/invite-processor"
import { Toaster } from "sonner"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "600"],
})

export const metadata: Metadata = {
  title: "Isaac Muaco Dev - Desenvolvedor Full Stack",
  description:
    "Portfólio profissional de Isaac Muaco - Desenvolvedor apaixonado por tecnologia e inovação, especializado em desenvolvimento web, apps mobile e soluções criativas em TI.",
  generator: "v0.app",
  keywords: ["desenvolvedor", "full stack", "web development", "mobile apps", "Isaac Muaco"],
  authors: [{ name: "Isaac Muaco" }],
  openGraph: {
    title: "Isaac Muaco Dev - Desenvolvedor Full Stack",
    description: "Transformo ideias em projetos reais, funcionais e esteticamente impressionantes.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${playfairDisplay.variable} ${sourceSans.variable} antialiased`}>
        <AuthProvider>
          <InviteProcessor />
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster position="top-right" richColors />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
