"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Product, Category } from "@/lib/types"

const categories: Category[] = [
  "Proteínas",
  "Creatinas",
  "Pré-Treino",
  "Aminoácidos",
  "Vitaminas",
  "Barras e Snacks",
  "Acessórios",
  "Outros",
]

interface ProductFormProps {
  product?: Product
  onSubmit: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "Proteínas",
    price: product?.price?.toString() || "",
    cost: product?.cost?.toString() || "",
    stock: product?.stock?.toString() || "",
    minStock: product?.minStock?.toString() || "",
    supplier: product?.supplier || "",
    description: product?.description || "",
    estimatedConsumptionDays: product?.estimatedConsumptionDays?.toString() || "",
  })

  console.log("[v0] ProductForm mounted with product:", product)
  console.log("[v0] estimatedConsumptionDays field value:", formData.estimatedConsumptionDays)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      category: formData.category as Category,
      price: Number.parseFloat(formData.price),
      cost: Number.parseFloat(formData.cost),
      stock: Number.parseInt(formData.stock),
      minStock: Number.parseInt(formData.minStock),
      supplier: formData.supplier,
      description: formData.description || undefined,
      estimatedConsumptionDays: formData.estimatedConsumptionDays ? Number.parseInt(formData.estimatedConsumptionDays) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Fornecedor *</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço de Venda (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Custo (R$) *</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Quantidade em Estoque *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStock">Estoque Mínimo *</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="estimatedConsumptionDays">Tempo Estimado de Consumo (dias)</Label>
          <Input
            id="estimatedConsumptionDays"
            type="number"
            min="1"
            value={formData.estimatedConsumptionDays}
            onChange={(e) => setFormData({ ...formData, estimatedConsumptionDays: e.target.value })}
            placeholder="Ex: 30 dias para um pote de whey"
          />
          <p className="text-sm text-muted-foreground">
            Quantos dias o cliente leva para consumir este produto? (Exemplo: whey de 1kg = 30 dias)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Informações adicionais sobre o produto..."
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto bg-transparent">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {product ? "Atualizar" : "Adicionar"} Produto
        </Button>
      </div>
    </form>
  )
}
