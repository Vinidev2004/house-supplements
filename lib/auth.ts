"use server"

import { cookies } from "next/headers"

const CREDENTIALS = {
  username: "house",
  password: "100620",
}

const SESSION_COOKIE = "session"

export async function login(username: string, password: string) {
  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return { success: true }
  }
  return { success: false, error: "Usuário ou senha incorretos" }
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
