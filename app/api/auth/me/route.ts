import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    console.log("[v0] /api/auth/me called")
    const user = await getCurrentUser()
    console.log("[v0] getCurrentUser returned:", user)

    if (!user) {
      console.log("[v0] No user found, returning null")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    console.log("[v0] Returning user:", user)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
