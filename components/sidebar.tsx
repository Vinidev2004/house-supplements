"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
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
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { useState } from "react"
import { useUser } from "@/lib/user-context"
import { Badge } from "@/components/ui/badge"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin"] },
  { name: "Estoque", href: "/estoque", icon: Package, roles: ["admin", "funcionario"] },
  { name: "Vendas", href: "/vendas", icon: ShoppingCart, roles: ["admin", "funcionario"] },
  { name: "Clientes", href: "/clientes", icon: Users, roles: ["admin", "funcionario"] },
  { name: "Revendas", href: "/revendas", icon: Store, roles: ["admin", "funcionario"] },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign, roles: ["admin"] },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3, roles: ["admin"] },
  { name: "Configurações", href: "/configuracoes", icon: Settings, roles: ["admin"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, loading } = useUser()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.replace("/login")
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  const filteredNavigation = navigation.filter((item) => {
    if (!user) return false
    return item.roles.includes(user.role)
  })

  return (
    <div className="hidden h-full w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-black">
          <Image src="/logo.png" alt="House Supplements Logo" fill className="object-cover" priority />
        </div>
        <h1 className="text-lg font-bold text-red-500">House Supplements</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
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
      <div className="border-t p-4 space-y-2">
        {user && !loading && (
          <div className="mb-2 px-3 py-2">
            <p className="text-sm font-medium">{user.name}</p>
            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-1">
              {user.role === "admin" ? "Administrador" : "Funcionário"}
            </Badge>
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
  )
}
