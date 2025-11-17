"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { DollarSign, TrendingUp, ShoppingCart, Package, AlertTriangle, Box } from "lucide-react"
import { calculateDashboardStats, getLowStockProducts, getSalesChartData } from "@/lib/dashboard-utils"
import type { DashboardStats, Product } from "@/lib/types"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    const [statsData, lowStockData, chartData] = await Promise.all([
      calculateDashboardStats(),
      getLowStockProducts(),
      getSalesChartData(7),
    ])
    setStats(statsData)
    setLowStockProducts(lowStockData)
    setSalesData(chartData)
    setIsLoading(false)
  }

  if (isLoading || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    )
  }

  const chartConfig = {
    vendas: {
      label: "Vendas",
      color: "hsl(217, 91%, 60%)",
    },
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground md:text-base">Visão geral do seu negócio</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        <StatCard
          title="Receita Total"
          value={formatCurrency(stats.totalRevenue)}
          description="Total de vendas realizadas"
          icon={DollarSign}
        />
        <StatCard
          title="Lucro Líquido"
          value={formatCurrency(stats.netProfit)}
          description="Receita - Despesas"
          icon={TrendingUp}
        />
        <StatCard
          title="Total de Vendas"
          value={stats.totalSales.toString()}
          description="Vendas concluídas"
          icon={ShoppingCart}
        />
        <StatCard
          title="Produtos em Estoque"
          value={stats.totalProducts.toString()}
          description="Total de produtos cadastrados"
          icon={Box}
        />
        <StatCard
          title="Estoque Baixo"
          value={stats.lowStockProducts.toString()}
          description="Produtos abaixo do mínimo"
          icon={AlertTriangle}
        />
        <StatCard
          title="Despesas Totais"
          value={formatCurrency(stats.totalExpenses)}
          description="Total de gastos"
          icon={Package}
        />
      </div>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Vendas dos Últimos 7 Dias</CardTitle>
          <CardDescription className="text-xs md:text-sm">Evolução diária das vendas</CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden max-w-full">
          <ChartContainer config={chartConfig} className="h-[250px] w-full md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={70}
                />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
                <Bar dataKey="vendas" fill="url(#colorVendas)" radius={[8, 8, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {lowStockProducts.length > 0 && (
        <Card className="max-w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <AlertTriangle className="h-4 w-4 text-warning md:h-5 md:w-5" />
              Produtos com Estoque Baixo
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Produtos que precisam de reposição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-bold text-warning">{product.stock} un.</p>
                    <p className="text-xs text-muted-foreground">Mín: {product.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
