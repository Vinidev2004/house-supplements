"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Building2, Calendar, DollarSign, TrendingUp, ChevronDown, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  getResaleStores,
  getResaleSales,
  addResaleStore,
  addResaleSale,
  deleteResaleStore,
  deleteResaleSale,
  getProducts,
} from "@/lib/database"
import type { ResaleStore, ResaleSale, ResaleSaleItem, Product } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export default function RevendasPage() {
  const [stores, setStores] = useState<ResaleStore[]>([])
  const [sales, setSales] = useState<ResaleSale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [storeDialogOpen, setStoreDialogOpen] = useState(false)
  const [saleDialogOpen, setSaleDialogOpen] = useState(false)
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set())

  const [newStore, setNewStore] = useState({
    name: "",
    cnpj: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
  })

  const [newSale, setNewSale] = useState({
    storeId: "",
    saleDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [saleItems, setSaleItems] = useState<
    Array<{
      productId: string
      productName: string
      quantity: number
      unitCost: number
      unitPrice: number
    }>
  >([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [storesData, salesData, productsData] = await Promise.all([
      getResaleStores(),
      getResaleSales(),
      getProducts(),
    ])
    setStores(storesData)
    setSales(salesData)
    setProducts(productsData)
    setLoading(false)
  }

  async function handleAddStore() {
    if (!newStore.name.trim()) {
      toast.error("Nome da loja é obrigatório")
      return
    }

    const store = await addResaleStore(newStore)
    if (store) {
      setStores([...stores, store])
      setNewStore({ name: "", cnpj: "", contactName: "", phone: "", email: "", address: "" })
      setStoreDialogOpen(false)
      toast.success("Loja adicionada com sucesso!")
    } else {
      toast.error("Erro ao adicionar loja")
    }
  }

  async function handleDeleteStore(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta loja?")) return

    const success = await deleteResaleStore(id)
    if (success) {
      setStores(stores.filter((s) => s.id !== id))
      toast.success("Loja excluída com sucesso!")
    } else {
      toast.error("Erro ao excluir loja")
    }
  }

  function addSaleItem() {
    setSaleItems([...saleItems, { productId: "", productName: "", quantity: 1, unitCost: 0, unitPrice: 0 }])
  }

  function removeSaleItem(index: number) {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  function updateSaleItem(index: number, field: string, value: any) {
    const updated = [...saleItems]
    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].productId = value
        updated[index].productName = product.name
        updated[index].unitCost = product.cost
        updated[index].unitPrice = product.price
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setSaleItems(updated)
  }

  async function handleAddSale() {
    if (!newSale.storeId) {
      toast.error("Selecione uma loja")
      return
    }

    if (saleItems.length === 0) {
      toast.error("Adicione pelo menos um produto")
      return
    }

    const items: ResaleSaleItem[] = saleItems.map((item) => ({
      id: "",
      resaleSaleId: "",
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitCost: item.unitCost,
      unitPrice: item.unitPrice,
      totalCost: item.quantity * item.unitCost,
      totalSale: item.quantity * item.unitPrice,
      profit: item.quantity * (item.unitPrice - item.unitCost),
      createdAt: "",
    }))

    const storeName = stores.find((s) => s.id === newSale.storeId)?.name

    const sale = await addResaleSale({
      storeId: newSale.storeId,
      storeName,
      saleDate: newSale.saleDate,
      notes: newSale.notes,
      totalCost: 0,
      totalSale: 0,
      profit: 0,
      items,
    })

    if (sale) {
      setSales([sale, ...sales])
      setNewSale({ storeId: "", saleDate: new Date().toISOString().split("T")[0], notes: "" })
      setSaleItems([])
      setSaleDialogOpen(false)
      toast.success("Venda registrada com sucesso!")
    } else {
      toast.error("Erro ao registrar venda")
    }
  }

  async function handleDeleteSale(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) return

    const success = await deleteResaleSale(id)
    if (success) {
      setSales(sales.filter((s) => s.id !== id))
      toast.success("Venda excluída com sucesso!")
    } else {
      toast.error("Erro ao excluir venda")
    }
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalSale, 0)
  const totalCost = sales.reduce((sum, sale) => sum + sale.totalCost, 0)
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)

  const toggleStore = (storeId: string) => {
    const newExpanded = new Set(expandedStores)
    if (newExpanded.has(storeId)) {
      newExpanded.delete(storeId)
    } else {
      newExpanded.add(storeId)
    }
    setExpandedStores(newExpanded)
  }

  const getSalesForStore = (storeId: string) => {
    return sales.filter((sale) => sale.storeId === storeId)
  }

  const getStoreTotals = (storeId: string) => {
    const storeSales = getSalesForStore(storeId)
    return {
      totalRevenue: storeSales.reduce((sum, sale) => sum + sale.totalSale, 0),
      totalCost: storeSales.reduce((sum, sale) => sum + sale.totalCost, 0),
      totalProfit: storeSales.reduce((sum, sale) => sum + sale.profit, 0),
      salesCount: storeSales.length,
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando revendas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revendas B2B</h1>
        <p className="text-muted-foreground">Gerencie vendas para outras lojas e parceiros</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stores with Expandable Sales History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lojas Parceiras</CardTitle>
              <CardDescription>Clique em uma loja para ver seu histórico de vendas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Loja
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Loja Parceira</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="storeName">Nome da Loja *</Label>
                      <Input
                        id="storeName"
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        placeholder="Ex: Loja Fitness Center"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={newStore.cnpj}
                        onChange={(e) => setNewStore({ ...newStore, cnpj: e.target.value })}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactName">Nome do Contato</Label>
                      <Input
                        id="contactName"
                        value={newStore.contactName}
                        onChange={(e) => setNewStore({ ...newStore, contactName: e.target.value })}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newStore.phone}
                        onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                        placeholder="(51) 99999-9999"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStore.email}
                        onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                        placeholder="contato@loja.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Textarea
                        id="address"
                        value={newStore.address}
                        onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                        placeholder="Rua, número, bairro, cidade"
                      />
                    </div>
                    <Button onClick={handleAddStore} className="w-full">
                      Adicionar Loja
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={stores.length === 0} variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Nova Venda
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Venda B2B</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="saleStore">Loja *</Label>
                        <Select
                          value={newSale.storeId}
                          onValueChange={(value) => setNewSale({ ...newSale, storeId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a loja" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="saleDate">Data da Venda</Label>
                        <Input
                          id="saleDate"
                          type="date"
                          value={newSale.saleDate}
                          onChange={(e) => setNewSale({ ...newSale, saleDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Produtos</Label>
                        <Button variant="outline" size="sm" onClick={addSaleItem}>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Produto
                        </Button>
                      </div>
                      {saleItems.map((item, index) => (
                        <div key={index} className="grid gap-2 md:grid-cols-6 mb-2 items-end">
                          <div className="md:col-span-2">
                            <Select
                              value={item.productId}
                              onValueChange={(value) => updateSaleItem(index, "productId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Qtd"
                              value={item.quantity}
                              onChange={(e) => updateSaleItem(index, "quantity", Number.parseInt(e.target.value) || 0)}
                              min="1"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Custo"
                              value={item.unitCost}
                              onChange={(e) =>
                                updateSaleItem(index, "unitCost", Number.parseFloat(e.target.value) || 0)
                              }
                              step="0.01"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Preço"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateSaleItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)
                              }
                              step="0.01"
                            />
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeSaleItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={newSale.notes}
                        onChange={(e) => setNewSale({ ...newSale, notes: e.target.value })}
                        placeholder="Observações sobre a venda"
                      />
                    </div>

                    <Button onClick={handleAddSale} className="w-full">
                      Registrar Venda
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Nenhuma loja cadastrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((store) => {
                const storeTotals = getStoreTotals(store.id)
                const storeSales = getSalesForStore(store.id)
                const isExpanded = expandedStores.has(store.id)

                return (
                  <Collapsible key={store.id} open={isExpanded} onOpenChange={() => toggleStore(store.id)}>
                    <Card className="overflow-hidden">
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-5 w-5 text-primary" />
                              <div className="text-left">
                                <CardTitle className="text-lg">{store.name}</CardTitle>
                                {store.cnpj && (
                                  <CardDescription className="text-xs">CNPJ: {store.cnpj}</CardDescription>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm">
                                <Badge variant="secondary" className="mb-1">
                                  {storeTotals.salesCount} {storeTotals.salesCount === 1 ? "venda" : "vendas"}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  Lucro:{" "}
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(storeTotals.totalProfit)}
                                  </span>
                                </p>
                              </div>
                              <ChevronDown
                                className={`h-5 w-5 text-muted-foreground transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                          {/* Store Contact Info */}
                          <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                            {store.contactName && (
                              <p>
                                <strong>Contato:</strong> {store.contactName}
                              </p>
                            )}
                            {store.phone && (
                              <p>
                                <strong>Telefone:</strong> {store.phone}
                              </p>
                            )}
                            {store.email && (
                              <p>
                                <strong>E-mail:</strong> {store.email}
                              </p>
                            )}
                            {store.address && (
                              <p>
                                <strong>Endereço:</strong> {store.address}
                              </p>
                            )}
                            <div className="pt-2 border-t border-border mt-3">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteStore(store.id)
                                }}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Excluir Loja
                              </Button>
                            </div>
                          </div>

                          {/* Store Sales History */}
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Histórico de Vendas
                            </h3>
                            {storeSales.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-lg">
                                <p className="text-sm">Nenhuma venda registrada para esta loja</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {storeSales.map((sale) => (
                                  <Card key={sale.id} className="bg-muted/20">
                                    <CardHeader className="pb-3">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <CardTitle className="text-base">
                                            {new Date(sale.saleDate).toLocaleDateString("pt-BR")}
                                          </CardTitle>
                                          {sale.notes && (
                                            <CardDescription className="text-xs mt-1">{sale.notes}</CardDescription>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteSale(sale.id)
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      {/* Sale Items */}
                                      {sale.items && sale.items.length > 0 && (
                                        <div className="space-y-2">
                                          {sale.items.map((item) => (
                                            <div
                                              key={item.id}
                                              className="bg-background rounded-lg p-3 space-y-1 text-sm"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="font-medium">{item.productName}</span>
                                                <Badge variant="outline">{item.quantity}x</Badge>
                                              </div>
                                              <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                  <span className="text-muted-foreground">Custo:</span>{" "}
                                                  {formatCurrency(item.totalCost)}
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">Venda:</span>{" "}
                                                  {formatCurrency(item.totalSale)}
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">Lucro:</span>{" "}
                                                  <span className="text-green-600 font-semibold">
                                                    {formatCurrency(item.profit)}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Sale Totals */}
                                      <div className="border-t border-border pt-3 grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                          <p className="text-muted-foreground text-xs">Custo Total</p>
                                          <p className="font-semibold">{formatCurrency(sale.totalCost)}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground text-xs">Valor Total</p>
                                          <p className="font-semibold">{formatCurrency(sale.totalSale)}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground text-xs">Lucro</p>
                                          <p className="font-semibold text-green-600">{formatCurrency(sale.profit)}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
