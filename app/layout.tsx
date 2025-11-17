import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"
import { isAuthenticated } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "House Supplements - Sistema de Gestão",
  description: "Sistema de gerenciamento de estoque e financeiro para House Supplements",
    generator: 'v0.app'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticated = await isAuthenticated()

  return (
    <html lang="pt-BR">
      <link rel="icon" href="/favicon.ico" />
      <body className={`${inter.className} overflow-x-hidden max-w-screen`}>
        {authenticated ? (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-black">
                    <Image src="/logo.png" alt="House Supplements Logo" fill className="object-cover" priority />
                  </div>
                  <h1 className="text-lg font-bold text-red-500">House Supplements</h1>
                </div>
                <MobileNav />
              </header>
              <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background max-w-full">{children}</main>
            </div>
          </div>
        ) : (
          <main className="min-h-screen bg-background">{children}</main>
        )}
        <Toaster />
      </body>
    </html>
  )
}
