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
    if (userData) {
      try {
        const user = JSON.parse(userData.value)
        // Redirect based on role
        if (user.role === "funcionario") {
          return NextResponse.redirect(new URL("/", request.url))
        }
      } catch (e) {
        // If parsing fails, redirect to home
      }
    }
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Role-based access control
  if (session && userData) {
    try {
      const user = JSON.parse(userData.value)
      const path = request.nextUrl.pathname

      // Admin-only routes
      const adminOnlyRoutes = ["/financeiro", "/relatorios", "/configuracoes"]

      if (user.role === "funcionario" && adminOnlyRoutes.some((route) => path.startsWith(route))) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (e) {
      // If parsing fails, allow access
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.webp).*)"],
}
