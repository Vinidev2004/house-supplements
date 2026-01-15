"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, XCircle, Plus, Trash2, ShoppingCart, History } from "lucide-react"
import type { Sale, Product, Customer } from "@/lib/types"
import { getSales, cancelSale, getProducts, addSale, getCustomers } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  product: Product
  quantity: number
  discount: number
}

interface CurrentUser {
  id: string
  username: string
  name: string
  role: "admin" | "funcionario"
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  // PDV states
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [searchProduct, setSearchProduct] = useState<string>("")
  const [isProcessingSale, setIsProcessingSale] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)

    const response = await fetch("/api/auth/me")
    const userData = response.ok ? (await response.json()).user : null
    setCurrentUser(userData)

    const userId = userData?.role === "funcionario" ? userData.id : undefined

    const [salesData, productsData, customersData] = await Promise.all([
      getSales(userId),
      getProducts(),
      getCustomers(),
    ])

    setSales(salesData)
    setFilteredSales(salesData)
    setProducts(productsData)
    setCustomers(customersData)
    setIsLoading(false)
  }

  const filterSales = () => {
    if (!selectedDate) {
      setFilteredSales(sales)
      return
    }

    const filtered = sales.filter((sale) => {
      const saleDate = new Date(sale.date).toISOString().split("T")[0]
      return saleDate === selectedDate
    })

    setFilteredSales(filtered)
  }

  const handleCancelSale = async (saleId: string) => {
    const success = await cancelSale(saleId)
    if (success) {
      await loadData()
      toast({
        title: "Venda cancelada!",
        description: "Os produtos foram devolvidos ao estoque.",
        variant: "default",
      })
    } else {
      toast({
        title: "Erro ao cancelar venda",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const addToCart = () => {
    if (!selectedProductId || quantity <= 0) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    if (product.stock < quantity) {
      toast({
        title: "Estoque insuficiente!",
        description: `Disponível: ${product.stock} unidades`,
        variant: "destructive",
      })
      return
    }

    const existingItem = cart.find((item) => item.product.id === selectedProductId)

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (product.stock < newQuantity) {
        toast({
          title: "Estoque insuficiente!",
          description: `Disponível: ${product.stock} unidades`,
          variant: "destructive",
        })
        return
      }
      setCart(cart.map((item) => (item.product.id === selectedProductId ? { ...item, quantity: newQuantity } : item)))
    } else {
      setCart([...cart, { product, quantity, discount: 0 }])
    }

    setSelectedProductId("")
    setQuantity(1)
    setSearchProduct("")
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity - item.discount, 0)
  }

  const calculateItemSubtotal = (item: CartItem) => {
    return item.product.price * item.quantity - item.discount
  }

  const finalizeSale = async () => {
    if (isProcessingSale) {
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio!",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
        variant: "destructive",
      })
      return
    }

    setIsProcessingSale(true)

    try {
      const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

      const sale: Omit<Sale, "id"> = {
        date: new Date().toISOString(),
        products: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          discount: item.discount > 0 ? item.discount : undefined,
          subtotal: calculateItemSubtotal(item),
        })),
        total: calculateTotal(),
        paymentMethod: paymentMethod as any,
        status: "completed",
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomer?.name,
      }

      const result = await addSale(sale, currentUser?.id)
      if (result) {
        toast({
          title: "Venda realizada com sucesso!",
          description: `Total: ${formatCurrency(sale.total)}`,
          variant: "default",
        })
        setCart([])
        setPaymentMethod("cash")
        setSelectedCustomerId("")
        await loadData()
      } else {
        toast({
          title: "Erro ao realizar venda",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
    } finally {
      setIsProcessingSale(false)
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Dinheiro",
      credit: "Crédito",
      debit: "Débito",
      pix: "PIX",
    }
    return labels[method] || method
  }

  const clearFilter = () => {
    setSelectedDate("")
  }

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchProduct.toLowerCase()))

  const updateDiscount = (productId: string, value: string) => {
    const discount = value === "" ? 0 : Number(value)
    setCart(cart.map((item) => (item.product.id === productId ? { ...item, discount: Math.max(0, discount) } : item)))
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vendas</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {currentUser?.role === "funcionario"
            ? "Registre novas vendas"
            : "Registre novas vendas e consulte o histórico completo"}
        </p>
        {currentUser && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={currentUser.role === "admin" ? "default" : "secondary"}>
              {currentUser.role === "admin" ? "Administrador" : "Funcionário"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              • <span className="font-medium">{currentUser.name}</span>
            </span>
          </div>
        )}
      </div>

      {currentUser?.role === "funcionario" ? (
        // Employee view - only PDV, no tabs
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Adicionar Produtos */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Adicionar Produtos</CardTitle>
                <CardDescription className="text-xs md:text-sm">Selecione os produtos para venda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search-product">Buscar Produto</Label>
                  <Input
                    id="search-product"
                    placeholder="Digite o nome do produto..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)} (Estoque: {product.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>

                <Button onClick={addToCart} className="w-full" disabled={!selectedProductId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar ao Carrinho
                </Button>
              </CardContent>
            </Card>

            {/* Carrinho */}
            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Carrinho</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {cart.length} {cart.length === 1 ? "item" : "itens"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Carrinho vazio</p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex flex-col p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-2">
                              <p className="font-medium text-sm truncate">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity}x {formatCurrency(item.product.price)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                {item.discount > 0 && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(item.product.price * item.quantity)}
                                  </p>
                                )}
                                <p className="font-bold text-sm">{formatCurrency(calculateItemSubtotal(item))}</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`discount-${item.product.id}`} className="text-xs whitespace-nowrap">
                              Desconto:
                            </Label>
                            <Input
                              id={`discount-${item.product.id}`}
                              type="number"
                              min="0"
                              max={item.product.price * item.quantity}
                              step="0.01"
                              value={item.discount === 0 ? "" : item.discount}
                              onChange={(e) => updateDiscount(item.product.id, e.target.value)}
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

                    <div className="border-t pt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer">Cliente (Opcional)</Label>
                        <div className="flex gap-2">
                          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                            <SelectTrigger id="customer" className="flex-1">
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedCustomerId && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedCustomerId("")}
                              title="Remover cliente"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment">Forma de Pagamento</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger id="payment">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Dinheiro</SelectItem>
                            <SelectItem value="credit">Crédito</SelectItem>
                            <SelectItem value="debit">Débito</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <span className="font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-success">{formatCurrency(calculateTotal())}</span>
                      </div>

                      <Button
                        onClick={finalizeSale}
                        className="w-full"
                        size="lg"
                        disabled={isProcessingSale || cart.length === 0}
                      >
                        {isProcessingSale ? "Processando..." : "Finalizar Venda"}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Admin view - with tabs for PDV and History
        <Tabs defaultValue="pdv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="pdv" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Venda</span>
              <span className="sm:hidden">PDV</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdv" className="space-y-4 mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Adicionar Produtos */}
              <Card className="max-w-full overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Adicionar Produtos</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Selecione os produtos para venda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-product">Buscar Produto</Label>
                    <Input
                      id="search-product"
                      placeholder="Digite o nome do produto..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product">Produto</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger id="product">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.price)} (Estoque: {product.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>

                  <Button onClick={addToCart} className="w-full" disabled={!selectedProductId}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar ao Carrinho
                  </Button>
                </CardContent>
              </Card>

              {/* Carrinho */}
              <Card className="max-w-full overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Carrinho</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {cart.length} {cart.length === 1 ? "item" : "itens"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">Carrinho vazio</p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex flex-col p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0 mr-2">
                                <p className="font-medium text-sm truncate">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity}x {formatCurrency(item.product.price)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  {item.discount > 0 && (
                                    <p className="text-xs text-muted-foreground line-through">
                                      {formatCurrency(item.product.price * item.quantity)}
                                    </p>
                                  )}
                                  <p className="font-bold text-sm">{formatCurrency(calculateItemSubtotal(item))}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`discount-${item.product.id}`} className="text-xs whitespace-nowrap">
                                Desconto:
                              </Label>
                              <Input
                                id={`discount-${item.product.id}`}
                                type="number"
                                min="0"
                                max={item.product.price * item.quantity}
                                step="0.01"
                                value={item.discount === 0 ? "" : item.discount}
                                onChange={(e) => updateDiscount(item.product.id, e.target.value)}
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

                      <div className="border-t pt-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer">Cliente (Opcional)</Label>
                          <div className="flex gap-2">
                            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                              <SelectTrigger id="customer" className="flex-1">
                                <SelectValue placeholder="Selecione um cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {customers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {selectedCustomerId && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedCustomerId("")}
                                title="Remover cliente"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="payment">Forma de Pagamento</Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger id="payment">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Dinheiro</SelectItem>
                              <SelectItem value="credit">Crédito</SelectItem>
                              <SelectItem value="debit">Débito</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <span className="font-semibold">Total:</span>
                          <span className="text-2xl font-bold text-success">{formatCurrency(calculateTotal())}</span>
                        </div>

                        <Button
                          onClick={finalizeSale}
                          className="w-full"
                          size="lg"
                          disabled={isProcessingSale || cart.length === 0}
                        >
                          {isProcessingSale ? "Processando..." : "Finalizar Venda"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="space-y-4 mt-4">
            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Filtros</CardTitle>
                <CardDescription className="text-xs md:text-sm">Filtre as vendas por data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="date">Data</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    {selectedDate && (
                      <Button variant="outline" onClick={clearFilter} className="w-full sm:w-auto bg-transparent">
                        Limpar Filtro
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  {currentUser?.role === "funcionario" ? "Minhas Vendas" : "Histórico de Vendas"}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {filteredSales.length === 0
                    ? "Nenhuma venda encontrada"
                    : `${filteredSales.length} ${filteredSales.length === 1 ? "venda" : "vendas"}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="max-w-full overflow-x-hidden">
                <div className="space-y-3">
                  {filteredSales.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      {selectedDate ? "Nenhuma venda encontrada nesta data" : "Nenhuma venda registrada"}
                    </p>
                  ) : (
                    filteredSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="rounded-lg border p-3 md:p-4 max-w-full hover:bg-muted/50 transition-colors"
                      >
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 min-w-0">
                            {sale.customerName && (
                              <p className="text-sm font-semibold truncate md:text-base">{sale.customerName}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(sale.date).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {getPaymentMethodLabel(sale.paymentMethod)}
                              </Badge>
                              <Badge variant="default" className="text-xs">
                                {sale.products.length} {sale.products.length === 1 ? "item" : "itens"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                            <div className="flex-1 sm:flex-none">
                              <p className="text-xs text-muted-foreground sm:text-right">Total</p>
                              <p className="text-lg font-bold text-success md:text-xl">{formatCurrency(sale.total)}</p>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Cancelar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancelar Venda</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja cancelar esta venda? Os produtos serão devolvidos ao estoque
                                    e a transação financeira será removida. Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Não, manter venda</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelSale(sale.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Sim, cancelar venda
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          {sale.products.map((item, index) => (
                            <div key={index} className="flex items-start justify-between text-sm border-l-2 pl-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity}x {formatCurrency(item.price)}
                                </p>
                                {item.discount && item.discount > 0 && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    Desconto: {formatCurrency(item.discount)}
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium ml-2">{formatCurrency(item.subtotal)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
