"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { AuthSession, UserRole } from "@/lib/types"

const SESSION_COOKIE = "session"

export async function login(username: string, password: string) {
  const supabase = await createClient()

  // Buscar usuário no banco de dados
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, password_hash, name, role, active")
    .eq("username", username)
    .single()

  if (error || !user) {
    return { success: false, error: "Usuário não encontrado" }
  }

  if (!user.active) {
    return { success: false, error: "Usuário desativado" }
  }

  // Verificar senha (em produção, use bcrypt.compare)
  if (user.password_hash !== password) {
    return { success: false, error: "Senha incorreta" }
  }

  // Criar sessão com informações do usuário
  const session: AuthSession = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return { success: true, user: session }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return { success: true }
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.has(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as AuthSession
  } catch {
    return null
  }
}

export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  // Admin tem acesso a tudo
  if (user.role === "admin") return true

  return user.role === requiredRole
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "admin"
}
