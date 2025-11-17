"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Customer } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface CustomerFormProps {
  customer?: Customer
  onSubmit: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, "")
    
    // Ensure it starts with +55
    if (!value.startsWith("+")) {
      value = "+" + value
    }
    if (!value.startsWith("+55")) {
      value = "+55" + value.replace(/^\+/, "")
    }
    
    // Limit to +55 (2) + 11 digits = 14 characters
    if (value.length > 14) {
      value = value.slice(0, 14)
    }
    
    setFormData({ ...formData, phone: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha o nome completo do cliente.",
        variant: "destructive",
      })
      return
    }
    if (!formData.phone.trim()) {
      toast({
        title: "WhatsApp obrigatório",
        description: "Por favor, preencha o número de WhatsApp.",
        variant: "destructive",
      })
      return
    }
    
    const phoneRegex = /^\+55\d{11}$/
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Formato de telefone inválido",
        description: "O telefone deve estar no formato internacional: +555193699424 (+55 + DDD + 9 dígitos)",
        variant: "destructive",
      })
      return
    }
    
    onSubmit({ ...formData })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Digite o nome completo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="+555193699424"
            required
          />
          <p className="text-xs text-muted-foreground">
            Formato: +55 + DDD (2 dígitos) + número (9 dígitos)
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {customer ? "Atualizar" : "Adicionar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
