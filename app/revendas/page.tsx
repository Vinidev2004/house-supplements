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

interface ResaleCartItem {
  product: Product
  quantity: number
  discount: number
}

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

  const [resaleCart, setResaleCart] = useState<ResaleCartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [productQuantity, setProductQuantity] = useState<number>(1)
  const [searchProduct, setSearchProduct] = useState<string>("")

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

  const addToResaleCart = () => {
    if (!selectedProductId || productQuantity <= 0) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    if (product.quantity < productQuantity) {
      toast.error(`Estoque insuficiente! Disponível: ${product.quantity} unidades`)
      return
    }

    const existingItem = resaleCart.find((item) => item.product.id === selectedProductId)

    if (existingItem) {
      const newQuantity = existingItem.quantity + productQuantity
      if (product.quantity < newQuantity) {
        toast.error(`Estoque insuficiente! Disponível: ${product.quantity} unidades`)
        return
      }
      setResaleCart(
        resaleCart.map((item) => (item.product.id === selectedProductId ? { ...item, quantity: newQuantity } : item)),
      )
    } else {
      setResaleCart([...resaleCart, { product, quantity: productQuantity, discount: 0 }])
    }

    setSelectedProductId("")
    setProductQuantity(1)
    setSearchProduct("")
    toast.success("Produto adicionado ao carrinho!")
  }

  const removeFromResaleCart = (productId: string) => {
    setResaleCart(resaleCart.filter((item) => item.product.id !== productId))
  }

  const updateResaleDiscount = (productId: string, value: string) => {
    const discount = value === "" ? 0 : Number(value)
    setResaleCart(
      resaleCart.map((item) => (item.product.id === productId ? { ...item, discount: Math.max(0, discount) } : item)),
    )
  }

  const calculateResaleItemSubtotal = (item: ResaleCartItem) => {
    return item.product.price * item.quantity - item.discount
  }

  const calculateResaleTotal = () => {
    return resaleCart.reduce((sum, item) => sum + calculateResaleItemSubtotal(item), 0)
  }

  const calculateResaleCost = () => {
    return resaleCart.reduce((sum, item) => sum + item.product.cost * item.quantity, 0)
  }

  const calculateResaleProfit = () => {
    return calculateResaleTotal() - calculateResaleCost()
  }

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchProduct.toLowerCase()))

  async function handleAddSale() {
    if (!newSale.storeId) {
      toast.error("Selecione uma loja")
      return
    }

    if (resaleCart.length === 0) {
      toast.error("Adicione pelo menos um produto ao carrinho")
      return
    }

    const items: ResaleSaleItem[] = resaleCart.map((item) => ({
      id: "",
      resaleSaleId: "",
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitCost: item.product.cost,
      unitPrice: item.product.price,
      discount: item.discount,
      totalCost: item.quantity * item.product.cost,
      totalSale: calculateResaleItemSubtotal(item),
      profit: calculateResaleItemSubtotal(item) - item.quantity * item.product.cost,
      createdAt: "",
    }))

    const storeName = stores.find((s) => s.id === newSale.storeId)?.name

    const sale = await addResaleSale({
      storeId: newSale.storeId,
      storeName,
      saleDate: newSale.saleDate,
      notes: newSale.notes,
      totalCost: calculateResaleCost(),
      totalSale: calculateResaleTotal(),
      profit: calculateResaleProfit(),
      items,
    })

    if (sale) {
      setSales([sale, ...sales])
      setNewSale({ storeId: "", saleDate: new Date().toISOString().split("T")[0], notes: "" })
      setResaleCart([])
      setSaleDialogOpen(false)
      toast.success("Venda B2B registrada com sucesso!")
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
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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

                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* Add Products Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Adicionar Produtos</CardTitle>
                          <CardDescription className="text-xs">Selecione os produtos para venda B2B</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="search-resale-product">Buscar Produto</Label>
                            <Input
                              id="search-resale-product"
                              placeholder="Digite o nome do produto..."
                              value={searchProduct}
                              onChange={(e) => setSearchProduct(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="resale-product">Produto</Label>
                            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                              <SelectTrigger id="resale-product">
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} - {formatCurrency(product.price)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="resale-quantity">Quantidade</Label>
                            <Input
                              id="resale-quantity"
                              type="number"
                              min="1"
                              value={productQuantity}
                              onChange={(e) => setProductQuantity(Number(e.target.value))}
                            />
                          </div>

                          <Button onClick={addToResaleCart} className="w-full" disabled={!selectedProductId}>
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar ao Carrinho
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Cart Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Carrinho</CardTitle>
                          <CardDescription className="text-xs">
                            {resaleCart.length} {resaleCart.length === 1 ? "item" : "itens"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {resaleCart.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-8">Carrinho vazio</p>
                          ) : (
                            <>
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {resaleCart.map((item) => (
                                  <div key={item.product.id} className="flex flex-col p-3 border rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0 mr-2">
                                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {item.quantity}x {formatCurrency(item.product.price)} (Custo:{" "}
                                          {formatCurrency(item.product.cost)})
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-right">
                                          {item.discount > 0 && (
                                            <p className="text-xs text-muted-foreground line-through">
                                              {formatCurrency(item.product.price * item.quantity)}
                                            </p>
                                          )}
                                          <p className="font-bold text-sm">
                                            {formatCurrency(calculateResaleItemSubtotal(item))}
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeFromResaleCart(item.product.id)}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label
                                        htmlFor={`resale-discount-${item.product.id}`}
                                        className="text-xs whitespace-nowrap"
                                      >
                                        Desconto:
                                      </Label>
                                      <Input
                                        id={`resale-discount-${item.product.id}`}
                                        type="number"
                                        min="0"
                                        max={item.product.price * item.quantity}
                                        step="0.01"
                                        value={item.discount === 0 ? "" : item.discount}
                                        onChange={(e) => updateResaleDiscount(item.product.id, e.target.value)}
                                        className="h-8 text-sm"
                                        placeholder="R$ 0,00"
                                      />
                                      {item.discount > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                          -{formatCurrency(item.discount)}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Custo Total:</span>
                                  <span className="font-medium">{formatCurrency(calculateResaleCost())}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Venda Total:</span>
                                  <span className="font-medium">{formatCurrency(calculateResaleTotal())}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-semibold">Lucro:</span>
                                  <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(calculateResaleProfit())}
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
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

                    <Button onClick={handleAddSale} className="w-full" size="lg" disabled={resaleCart.length === 0}>
                      Finalizar Venda B2B
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
