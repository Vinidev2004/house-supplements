"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProducts, getSales, getTransactions } from "@/lib/database"
import type { Product, Sale, Transaction } from "@/lib/types"
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart,
} from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ReportStatCard } from "@/components/report-stat-card"
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

type PeriodFilter = "7d" | "30d" | "90d" | "all" | "custom"

export default function RelatoriosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [period, setPeriod] = useState<PeriodFilter>("30d")
  const [customDays, setCustomDays] = useState<string>("")
  const [customMonths, setCustomMonths] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDataPoint, setSelectedDataPoint] = useState<{
    date: string
    receitas: number
    despesas: number
    lucro: number
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const [productsData, salesData, transactionsData] = await Promise.all([
      getProducts(),
      getSales(),
      getTransactions(),
    ])
    setProducts(productsData)
    setSales(salesData)
    setTransactions(transactionsData)
    setIsLoading(false)
  }

  const filterByPeriod = <T extends { date: string }>(items: T[]): T[] => {
    if (period === "all") return items

    const now = new Date()
    let days = 0

    if (period === "custom") {
      if (customDays) {
        days = Number.parseInt(customDays)
      } else if (customMonths) {
        days = Number.parseInt(customMonths) * 30
      } else {
        return items
      }
    } else {
      days = period === "7d" ? 7 : period === "30d" ? 30 : 90
    }

    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return items.filter((item) => new Date(item.date) >= cutoffDate)
  }

  const filteredSales = filterByPeriod(sales)
  const filteredTransactions = filterByPeriod(transactions)

  const totalRevenue = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalSalesCount = filteredSales.filter((s) => s.status === "completed").length

  const averageTicket = totalSalesCount > 0 ? filteredSales.reduce((sum, s) => sum + s.total, 0) / totalSalesCount : 0

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length

  const categoryData = products.reduce(
    (acc, product) => {
      const existing = acc.find((item) => item.name === product.category)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: product.category, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  const topProducts = products
    .map((product) => {
      const productSales = filteredSales.reduce((sum, sale) => {
        const saleItem = sale.products.find((p) => p.productId === product.id)
        return sum + (saleItem?.quantity || 0)
      }, 0)
      const revenue = productSales * product.price
      return { name: product.name, vendas: productSales, faturamento: revenue }
    })
    .filter((p) => p.vendas > 0)
    .sort((a, b) => b.vendas - a.vendas)
    .slice(0, 5)

  const expensesByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, transaction) => {
        const existing = acc.find((item) => item.name === transaction.category)
        if (existing) {
          existing.value += transaction.amount
        } else {
          acc.push({ name: transaction.category, value: transaction.amount })
        }
        return acc
      },
      [] as { name: string; value: number }[],
    )

  const financialEvolution = (() => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 30
    const data: { date: string; receitas: number; despesas: number; lucro: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayRevenue = filteredTransactions
        .filter((t) => t.type === "income" && t.date.startsWith(dateStr))
        .reduce((sum, t) => sum + t.amount, 0)

      const dayExpenses = filteredTransactions
        .filter((t) => t.type === "expense" && t.date.startsWith(dateStr))
        .reduce((sum, t) => sum + t.amount, 0)

      data.push({
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        receitas: dayRevenue,
        despesas: dayExpenses,
        lucro: dayRevenue - dayExpenses,
      })
    }

    const filteredData = data.filter((item) => item.receitas !== 0 || item.despesas !== 0)

    // Add a zero starting point before the first data point
    if (filteredData.length > 0) {
      return [
        {
          date: "Início",
          receitas: 0,
          despesas: 0,
          lucro: 0,
        },
        ...filteredData,
      ]
    }

    return filteredData
  })()

  const COLORS = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
    "#06b6d4", // cyan
    "#84cc16", // lime
  ]

  console.log("[v0] Category data:", categoryData)
  console.log("[v0] Colors being used:", COLORS)

  const chartConfig = {
    vendas: {
      label: "Vendas",
      color: "hsl(217, 91%, 60%)",
    },
  }

  const renderLegend = (props: any) => {
    const { payload } = props
    const total = payload.reduce((sum: number, entry: any) => sum + entry.payload.value, 0)

    return (
      <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-full">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / total) * 100).toFixed(1)
          return (
            <div key={`legend-${index}`} className="flex items-center gap-1.5 text-xs">
              <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground truncate">
                {entry.value} ({percentage}%)
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const handleApplyCustomPeriod = () => {
    if (customDays || customMonths) {
      setPeriod("custom")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Carregando relatórios...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Relatórios</h1>
          <p className="text-sm text-muted-foreground md:text-base">Análises e insights do seu negócio</p>
        </div>

        <Card className="max-w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filtros de Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={period === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPeriod("7d")
                  setCustomDays("")
                  setCustomMonths("")
                }}
                className="whitespace-nowrap flex-shrink-0"
              >
                7 dias
              </Button>
              <Button
                variant={period === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPeriod("30d")
                  setCustomDays("")
                  setCustomMonths("")
                }}
                className="whitespace-nowrap flex-shrink-0"
              >
                30 dias
              </Button>
              <Button
                variant={period === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPeriod("90d")
                  setCustomDays("")
                  setCustomMonths("")
                }}
                className="whitespace-nowrap flex-shrink-0"
              >
                90 dias
              </Button>
              <Button
                variant={period === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPeriod("all")
                  setCustomDays("")
                  setCustomMonths("")
                }}
                className="whitespace-nowrap flex-shrink-0"
              >
                Tudo
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="customDays" className="text-sm">
                  Últimos X dias
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="customDays"
                    type="number"
                    min="1"
                    placeholder="Ex: 15"
                    value={customDays}
                    onChange={(e) => {
                      setCustomDays(e.target.value)
                      setCustomMonths("")
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleApplyCustomPeriod} size="sm" className="whitespace-nowrap">
                    Aplicar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMonths" className="text-sm">
                  Últimos X meses
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="customMonths"
                    type="number"
                    min="1"
                    placeholder="Ex: 3"
                    value={customMonths}
                    onChange={(e) => {
                      setCustomMonths(e.target.value)
                      setCustomDays("")
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleApplyCustomPeriod} size="sm" className="whitespace-nowrap">
                    Aplicar
                  </Button>
                </div>
              </div>

              {period === "custom" && (customDays || customMonths) && (
                <div className="flex items-end">
                  <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm">
                    <span className="font-medium">Período ativo:</span>{" "}
                    {customDays ? `${customDays} dias` : `${customMonths} meses`}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-full">
        <ReportStatCard title="Receita Total" value={formatCurrency(totalRevenue)} icon={TrendingUp} />
        <ReportStatCard title="Total de Vendas" value={totalSalesCount} icon={ShoppingCart} />
        <ReportStatCard title="Ticket Médio" value={formatCurrency(averageTicket)} icon={TrendingUp} />
        <ReportStatCard
          title="Alertas de Estoque"
          value={lowStockCount + outOfStockCount}
          icon={AlertTriangle}
          className={lowStockCount + outOfStockCount > 0 ? "border-warning" : ""}
        />
      </div>

      <Tabs defaultValue="vendas" className="w-full max-w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendas" className="text-xs md:text-sm">
            Vendas
          </TabsTrigger>
          <TabsTrigger value="estoque" className="text-xs md:text-sm">
            Estoque
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="text-xs md:text-sm">
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="space-y-4 mt-4 max-w-full">
          <Card className="max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Produtos Mais Vendidos</CardTitle>
              <CardDescription className="text-xs md:text-sm">Top 5 produtos no período selecionado</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden max-w-full">
              {topProducts.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} margin={{ bottom: 60, left: 10, right: 10, top: 30 }}>
                      <defs>
                        <linearGradient id="colorTopProducts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        angle={-45}
                        textAnchor="end"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        height={70}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => formatCurrency(value)}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        width={80}
                        domain={[0, "auto"]}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="rounded-lg border bg-background p-3 shadow-lg">
                                <div className="flex flex-col gap-2">
                                  <span className="text-sm font-semibold">{data.name}</span>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">
                                      Vendas:{" "}
                                      <span className="font-medium text-foreground">{data.vendas} unidades</span>
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      Faturamento:{" "}
                                      <span className="font-medium text-primary">
                                        {formatCurrency(data.faturamento)}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                        cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                      />
                      <Bar
                        dataKey="vendas"
                        fill="url(#colorTopProducts)"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                        label={{
                          position: "top",
                          content: (props: any) => {
                            const { x, y, width, value, index } = props
                            const data = topProducts[index]
                            return (
                              <text
                                x={x + width / 2}
                                y={y - 5}
                                fill="hsl(var(--foreground))"
                                textAnchor="middle"
                                fontSize={11}
                                fontWeight={600}
                              >
                                {formatCurrency(data.faturamento)}
                              </text>
                            )
                          },
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                  Nenhuma venda no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4 mt-4 max-w-full">
          <div className="grid gap-4 lg:grid-cols-2 max-w-full">
            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Distribuição por Categoria</CardTitle>
                <CardDescription className="text-xs md:text-sm">Produtos cadastrados por categoria</CardDescription>
              </CardHeader>
              <CardContent className="overflow-hidden max-w-full">
                {categoryData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[380px] w-full md:h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="35%"
                          labelLine={false}
                          outerRadius={90}
                          innerRadius={40}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          paddingAngle={2}
                        >
                          {categoryData.map((entry, index) => {
                            const color = COLORS[index % COLORS.length]
                            return <Cell key={`cell-${index}`} fill={color} stroke="white" strokeWidth={2} />
                          })}
                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">{payload[0].name}</span>
                                    <span className="text-sm text-muted-foreground">{payload[0].value} produto(s)</span>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend content={renderLegend} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                    Nenhum produto cadastrado
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="max-w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Status do Estoque</CardTitle>
                <CardDescription className="text-xs md:text-sm">Situação atual dos produtos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3 md:p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 flex-shrink-0">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Estoque Normal</p>
                        <p className="text-xs text-muted-foreground">Produtos disponíveis</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold md:text-2xl flex-shrink-0">
                      {products.filter((p) => p.stock > p.minStock).length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-warning/50 bg-warning/5 p-3 md:p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Estoque Baixo</p>
                        <p className="text-xs text-muted-foreground">Requer atenção</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-warning md:text-2xl flex-shrink-0">{lowStockCount}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-3 md:p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 flex-shrink-0">
                        <Package className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Sem Estoque</p>
                        <p className="text-xs text-muted-foreground">Produtos esgotados</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-destructive md:text-2xl flex-shrink-0">
                      {outOfStockCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4 mt-4 max-w-full">
          <Card className="max-w-full overflow-hidden">
            <CardHeader>
              <div>
                <CardTitle className="text-base md:text-lg">Evolução Financeira</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Receitas, despesas e lucro ao longo do tempo
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden max-w-full">
              {financialEvolution.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <div
                      style={{
                        minWidth: financialEvolution.length > 10 ? `${financialEvolution.length * 40}px` : "100%",
                      }}
                    >
                      <ChartContainer config={chartConfig} className="h-[350px] w-full md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={financialEvolution} margin={{ bottom: 20, left: 10, right: 10, top: 20 }}>
                            <defs>
                              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                              </linearGradient>
                              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                              </linearGradient>
                              <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="hsl(var(--border))"
                              opacity={0.3}
                            />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                              interval={financialEvolution.length > 15 ? Math.floor(financialEvolution.length / 10) : 0}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => formatCurrency(value)}
                              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                              width={80}
                              domain={[0, "auto"]}
                            />
                            <ChartTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                                      <div className="flex flex-col gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          {payload[0].payload.date}
                                        </span>
                                        <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-xs">
                                              Receitas: {formatCurrency(payload[0].payload.receitas)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-red-500" />
                                            <span className="text-xs">
                                              Despesas: {formatCurrency(payload[0].payload.despesas)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <span className="text-xs">
                                              Lucro: {formatCurrency(payload[0].payload.lucro)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              }}
                              cursor={{
                                stroke: "hsl(var(--muted-foreground))",
                                strokeWidth: 1,
                                strokeDasharray: "5 5",
                              }}
                            />
                            <Legend
                              wrapperStyle={{ paddingTop: "20px" }}
                              content={() => (
                                <div className="flex justify-center gap-4 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-green-500" />
                                    <span>Receitas</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-red-500" />
                                    <span>Despesas</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-blue-500" />
                                    <span>Lucro</span>
                                  </div>
                                </div>
                              )}
                            />
                            <Line
                              type="monotone"
                              dataKey="receitas"
                              stroke="#10b981"
                              strokeWidth={3}
                              dot={{ fill: "#10b981", r: 5, cursor: "pointer" }}
                              activeDot={{
                                r: 7,
                                onClick: (e: any, payload: any) => setSelectedDataPoint(payload.payload),
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="despesas"
                              stroke="#ef4444"
                              strokeWidth={3}
                              dot={{ fill: "#ef4444", r: 5, cursor: "pointer" }}
                              activeDot={{
                                r: 7,
                                onClick: (e: any, payload: any) => setSelectedDataPoint(payload.payload),
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="lucro"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              dot={{ fill: "#3b82f6", r: 5, cursor: "pointer" }}
                              activeDot={{
                                r: 7,
                                onClick: (e: any, payload: any) => setSelectedDataPoint(payload.payload),
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>

                  {selectedDataPoint && (
                    <Card className="border-primary/50 bg-primary/5">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Detalhes do Dia - {selectedDataPoint.date}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDataPoint(null)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="flex flex-col gap-1 rounded-lg border bg-background p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-green-500" />
                              <span className="text-xs font-medium text-muted-foreground">Receitas</span>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(selectedDataPoint.receitas)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 rounded-lg border bg-background p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-red-500" />
                              <span className="text-xs font-medium text-muted-foreground">Despesas</span>
                            </div>
                            <span className="text-lg font-bold text-red-600">
                              {formatCurrency(selectedDataPoint.despesas)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 rounded-lg border bg-background p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full bg-blue-500" />
                              <span className="text-xs font-medium text-muted-foreground">Lucro</span>
                            </div>
                            <span
                              className={`text-lg font-bold ${selectedDataPoint.lucro >= 0 ? "text-blue-600" : "text-red-600"}`}
                            >
                              {formatCurrency(selectedDataPoint.lucro)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  Nenhum dado financeiro no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
