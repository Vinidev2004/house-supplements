"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2, AlertTriangle, Package, TrendingUp } from 'lucide-react'
import type { Product } from "@/lib/types"
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/database"
import { ProductForm } from "@/components/product-form"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter])

  const loadProducts = async () => {
    setIsLoading(true)
    const data = await getProducts()
    setProducts(data)
    setIsLoading(false)
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter)
    }

    setFilteredProducts(filtered)
  }

  const handleAddProduct = async (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const newProduct = await addProduct(data)
    if (newProduct) {
      await loadProducts()
      setIsDialogOpen(false)
      toast({
        title: "Produto adicionado!",
        description: `${data.name} foi adicionado ao estoque com sucesso.`,
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao adicionar produto",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProduct = async (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, data)
      if (updated) {
        await loadProducts()
        setIsDialogOpen(false)
        setEditingProduct(null)
        toast({
          title: "Produto atualizado!",
          description: `${data.name} foi atualizado com sucesso.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Erro ao atualizar produto",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteProduct = async (id: string) => {
    setProductToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    const success = await deleteProduct(productToDelete)
    if (success) {
      await loadProducts()
      toast({
        title: "Produto excluído!",
        description: "O produto foi removido do estoque.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao excluir produto",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  const openAddDialog = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { label: "Sem estoque", variant: "destructive" as const }
    }
    if (product.stock <= product.minStock) {
      return { label: "Estoque baixo", variant: "warning" as const }
    }
    return { label: "Em estoque", variant: "default" as const }
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))

  const totalCostValue = filteredProducts.reduce((sum, product) => sum + product.cost * product.stock, 0)
  const totalSaleValue = filteredProducts.reduce((sum, product) => sum + product.price * product.stock, 0)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Estoque</h1>
          <p className="text-sm text-muted-foreground md:text-base">Gerencie seus produtos e controle de estoque</p>
        </div>
        <Button onClick={openAddDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Estoque (Custo)</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCostValue)}</div>
            <p className="text-xs text-muted-foreground">Valor total baseado no preço de custo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Estoque (Venda)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalSaleValue)}</div>
            <p className="text-xs text-muted-foreground">Valor total baseado no preço de venda</p>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Filtros</CardTitle>
          <CardDescription className="text-xs md:text-sm">Busque e filtre seus produtos</CardDescription>
        </CardHeader>
        <CardContent className="max-w-full overflow-hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Produtos</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {filteredProducts.length === 0
              ? "Nenhum produto encontrado"
              : `${filteredProducts.length} ${filteredProducts.length === 1 ? "produto" : "produtos"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-full overflow-x-hidden">
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {searchTerm || categoryFilter !== "all"
                  ? "Nenhum produto encontrado com os filtros aplicados"
                  : "Nenhum produto cadastrado"}
              </p>
            ) : (
              filteredProducts.map((product) => {
                const status = getStockStatus(product)
                return (
                  <div
                    key={product.id}
                    className="rounded-lg border p-3 md:p-4 max-w-full hover:bg-muted/50 transition-colors"
                  >
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate md:text-base">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 break-words">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          <Badge variant={status.variant} className="text-xs">
                            {status.label}
                          </Badge>
                          {product.stock <= product.minStock && (
                            <Badge variant="warning" className="text-xs flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Atenção
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <div className="flex-1 sm:flex-none">
                          <p className="text-xs text-muted-foreground sm:text-right">Preço de Venda</p>
                          <p className="text-lg font-bold text-success md:text-xl">{formatCurrency(product.price)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-3 text-sm sm:grid-cols-4">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Fornecedor</p>
                        <p className="font-medium truncate">{product.supplier}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Estoque Atual</p>
                        <p className="font-medium truncate">{product.stock} un.</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Estoque Mínimo</p>
                        <p className="font-medium truncate">{product.minStock} un.</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Custo</p>
                        <p className="font-medium truncate">{formatCurrency(product.cost)}</p>
                      </div>
                    </div>

                    {product.estimatedConsumptionDays && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Badge variant="secondary" className="text-xs">
                          ⏱️ Consumo estimado: {product.estimatedConsumptionDays} dias
                        </Badge>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 border-t pt-3">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} className="flex-1">
                        <Pencil className="mr-2 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-full overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Atualize as informações do produto" : "Preencha os dados do novo produto"}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct || undefined}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingProduct(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
