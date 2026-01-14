"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import type { User } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const SESSION_COOKIE = "session"
const USER_COOKIE = "user_data"

function hashPassword(password: string): string {
  // This should match the hash_password function in SQL
  // Using simple SHA-256 with salt - in production use bcrypt
  return require("crypto")
    .createHash("sha256")
    .update(password + "house_salt")
    .digest("hex")
}

export async function login(username: string, password: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Hash the password
    const passwordHash = hashPassword(password)

    // Query user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password_hash", passwordHash)
      .eq("active", true)
      .single()

    if (error || !user) {
      return { success: false, error: "Usuário ou senha incorretos" }
    }

    // Create session
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Store user data
    cookieStore.set(
      USER_COOKIE,
      JSON.stringify({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Erro ao processar login" }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(USER_COOKIE)
  return { success: true }
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.has(SESSION_COOKIE)
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userData = cookieStore.get(USER_COOKIE)

  if (!userData) {
    return null
  }

  try {
    return JSON.parse(userData.value)
  } catch {
    return null
  }
}
