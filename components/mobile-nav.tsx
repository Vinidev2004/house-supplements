"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  User,
  Settings,
} from "lucide-react"
import Image from "next/image"
import { logout } from "@/lib/auth"
import { useUser } from "@/lib/user-context"
import { Badge } from "@/components/ui/badge"

const allNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, adminOnly: true },
  { name: "Painel", href: "/funcionario", icon: LayoutDashboard, funcionarioOnly: true },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Vendas", href: "/vendas", icon: ShoppingCart },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Revendas", href: "/revendas", icon: Store },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign, adminOnly: true },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3, adminOnly: true },
  { name: "Configurações", href: "/configuracoes", icon: Settings, adminOnly: true },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, isAdmin } = useUser()

  const navigation = allNavigation.filter((item) => {
    if (item.adminOnly && !isAdmin) return false
    if (item.funcionarioOnly && isAdmin) return false
    return true
  })

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
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-3 border-b px-6">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-black">
              <Image src="/logo.png" alt="House Supplements Logo" fill className="object-cover" priority />
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
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4 space-y-3">
            {user && (
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-accent/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                    {isAdmin ? "Admin" : "Funcionário"}
                  </Badge>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-accent-foreground"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </Button>
            <p className="text-xs text-muted-foreground">Sistema de Gestão v1.0</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
