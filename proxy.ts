import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")
  const userData = request.cookies.get("user_data")
  const isLoginPage = request.nextUrl.pathname === "/login"

  // If not authenticated and not on login page, redirect to login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If authenticated and on login page, redirect based on role
  if (session && isLoginPage) {
    try {
      const user = userData ? JSON.parse(userData.value) : null
      if (user?.role === "funcionario") {
        return NextResponse.redirect(new URL("/estoque", request.url))
      }
      return NextResponse.redirect(new URL("/", request.url))
    } catch {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (session && userData) {
    try {
      const user = JSON.parse(userData.value)
      const adminOnlyRoutes = ["/financeiro", "/relatorios", "/configuracoes"]
      const isAdminRoute = adminOnlyRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

      if (user.role === "funcionario" && isAdminRoute) {
        return NextResponse.redirect(new URL("/estoque", request.url))
      }
    } catch {
      // If error parsing user data, continue
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.webp).*)"],
}
