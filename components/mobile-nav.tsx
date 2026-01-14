"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Users,
  LogOut,
  Store,
  Settings,
} from "lucide-react"
import Image from "next/image"
import { logout } from "@/lib/auth"
import { useUser } from "@/lib/user-context"

const allNavigation = [
  { name: "Painel", href: "/", icon: LayoutDashboard, roles: ["admin", "funcionario"] },
  { name: "Estoque", href: "/estoque", icon: Package, roles: ["admin", "funcionario"] },
  { name: "Vendas", href: "/vendas", icon: ShoppingCart, roles: ["admin", "funcionario"] },
  { name: "Clientes", href: "/clientes", icon: Users, roles: ["admin", "funcionario"] },
  { name: "Revendas", href: "/revendas", icon: Store, roles: ["admin", "funcionario"] },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign, roles: ["admin"] },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3, roles: ["admin"] },
  { name: "Configurações", href: "/configuracoes", icon: Settings, roles: ["admin"] },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user } = useUser()

  const navigation = allNavigation.filter((item) => user && item.roles.includes(user.role))

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setOpen(false)
    try {
      await logout()
      router.replace("/login")
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-zinc-400">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-zinc-900 border-zinc-800">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-6">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-black">
              <Image src="/logo.webp" alt="House Supplements Logo" fill className="object-contain p-1" priority />
            </div>
            <h1 className="text-lg font-bold text-red-500">House Supplements</h1>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-red-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-zinc-800 p-4 space-y-3">
            {user && (
              <div className="space-y-1 px-3 py-2 rounded-lg bg-zinc-800">
                <p className="text-sm font-medium text-zinc-100">{user.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                    {user.role === "admin" ? "Administrador" : "Funcionário"}
                  </Badge>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </Button>
            <p className="text-xs text-zinc-500 px-3">Sistema de Gestão v1.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
