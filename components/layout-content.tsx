"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { UserProvider } from "@/lib/user-context"
import Image from "next/image"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  if (isLoginPage) {
    return <main className="min-h-screen bg-zinc-950">{children}</main>
  }

  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden bg-zinc-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 md:hidden">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-black">
                <Image src="/logo.webp" alt="House Supplements Logo" fill className="object-cover" priority />
              </div>
              <h1 className="text-lg font-bold text-red-500">House Supplements</h1>
            </div>
            <MobileNav />
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-950 max-w-full">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
}
