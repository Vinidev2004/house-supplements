"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { login } from "@/lib/auth"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(username, password)

      if (result.success && result.user) {
        toast.success("Login realizado com sucesso!")

        if (result.user.role === "funcionario") {
          router.replace("/")
        } else {
          router.replace("/")
        }
      } else {
        toast.error(result.error || "Usuário ou senha incorretos")
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-black p-4">
            <Image
              src="/logo.webp"
              alt="House Supplements Logo"
              width={128}
              height={128}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-red-500">House Supplements</CardTitle>
            <CardDescription className="text-zinc-400">Sistema de Gestão</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-200">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-200">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
