import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { UserProvider } from "@/lib/user-context"
import { LayoutContent } from "@/components/layout-content"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "House Supplements - Sistema de Gestão",
  description: "Sistema de gerenciamento de estoque e financeiro para House Supplements",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.png/favicon.ico" },
      { url: "/favicon.png/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.png/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon.png/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ url: "/favicon.png/site.webmanifest", rel: "manifest" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.png/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.png/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="House Supplements" />
        <link rel="manifest" href="/favicon.png/site.webmanifest" />
      </head>
      <body className={`${inter.className} overflow-x-hidden max-w-screen`}>
        <UserProvider>
          <LayoutContent>{children}</LayoutContent>
          <Toaster position="top-right" richColors />
        </UserProvider>
      </body>
    </html>
  )
}
