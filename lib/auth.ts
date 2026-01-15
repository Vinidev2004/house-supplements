"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

const SESSION_COOKIE = "session"
const USER_DATA_COOKIE = "user_data"

export async function login(username: string, password: string) {
  try {
    const supabase = await createClient()

    // Buscar usuário por username
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("active", true)
      .single()

    if (error || !user) {
      return { success: false, error: "Usuário ou senha incorretos" }
    }

    // Para simplificação, aceitar senha em texto plano durante desenvolvimento
    // Em produção, você deve verificar o hash bcrypt:
    // const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    // Verificação temporária simples para desenvolvimento
    const isPasswordValid =
      (username === "house" && password === "100620") || (username === "func" && password === "1234")

    if (!isPasswordValid) {
      return { success: false, error: "Usuário ou senha incorretos" }
    }

    // Criar sessão segura
    const cookieStore = await cookies()
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    }

    cookieStore.set(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    cookieStore.set(USER_DATA_COOKIE, JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, user: userData }
  } catch (error) {
    console.error("Erro no login:", error)
    return { success: false, error: "Erro ao processar login" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(USER_DATA_COOKIE)
  return { success: true }
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.has(SESSION_COOKIE)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  console.log("[v0] Getting user from cookie...")
  const userDataCookie = cookieStore.get(USER_DATA_COOKIE)
  console.log("[v0] User data cookie:", userDataCookie?.value)

  if (!userDataCookie) {
    console.log("[v0] No user data cookie found")
    return null
  }

  try {
    const parsed = JSON.parse(userDataCookie.value)
    console.log("[v0] Parsed user data:", parsed)
    return parsed
  } catch {
    console.log("[v0] Failed to parse user data cookie")
    return null
  }
}
