import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { LayoutContent } from "@/components/layout-content"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "House Supplements - Sistema de Gestão",
  description: "Sistema de gerenciamento de estoque e financeiro para House Supplements",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} overflow-x-hidden max-w-screen bg-zinc-950 text-zinc-50`}>
        <LayoutContent>{children}</LayoutContent>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
