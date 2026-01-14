import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { AuthSession } from "@/lib/types"

const ADMIN_ONLY_ROUTES = ["/financeiro", "/relatorios", "/revendas", "/configuracoes"]

const FUNCIONARIO_ROUTES = ["/funcionario", "/vendas", "/estoque", "/clientes"]

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")
  const isLoginPage = request.nextUrl.pathname === "/login"
  const pathname = request.nextUrl.pathname

  // Se não autenticado e não está na página de login, redireciona para login
  if (!sessionCookie && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se autenticado
  if (sessionCookie) {
    try {
      const session: AuthSession = JSON.parse(sessionCookie.value)

      // Se está na página de login, redireciona com base na role
      if (isLoginPage) {
        if (session.role === "funcionario") {
          return NextResponse.redirect(new URL("/funcionario", request.url))
        }
        return NextResponse.redirect(new URL("/", request.url))
      }

      const isAdminOnlyRoute = ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))
      if (isAdminOnlyRoute && session.role !== "admin") {
        return NextResponse.redirect(new URL("/funcionario", request.url))
      }

      if (pathname === "/" && session.role === "funcionario") {
        return NextResponse.redirect(new URL("/funcionario", request.url))
      }
    } catch {
      // Cookie inválido, limpa e redireciona para login
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)"],
}
