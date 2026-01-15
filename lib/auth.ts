"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

const SESSION_COOKIE = "session"
const USER_DATA_COOKIE = "user_data"

export async function login(username: string, password: string) {
  try {
    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("active", true)
      .single()

    if (error || !user) {
      return { success: false, error: "Usuário ou senha incorretos" }
    }

    // Verificação de senha (hardcoded para desenvolvimento)
    // TODO: Implementar bcrypt em produção
    const isPasswordValid =
      (username === "house" && password === "100620") || (username === "func" && password === "1234")

    if (!isPasswordValid) {
      return { success: false, error: "Usuário ou senha incorretos" }
    }

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
      maxAge: 60 * 60 * 24 * 7,
    })

    cookieStore.set(USER_DATA_COOKIE, JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
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
  const userDataCookie = cookieStore.get(USER_DATA_COOKIE)

  if (!userDataCookie) {
    return null
  }

  try {
    return JSON.parse(userDataCookie.value)
  } catch {
    return null
  }
}
