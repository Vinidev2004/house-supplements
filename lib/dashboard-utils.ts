import { getProducts, getSales, getTransactions } from "./database"
import type { DashboardStats } from "./types"
import { QUERY_LIMITS, SALE_STATUS } from "./constants"

export const calculateDashboardStats = async (): Promise<DashboardStats> => {
  const [products, sales, transactions] = await Promise.all([getProducts(), getSales(), getTransactions()])

  const totalRevenue = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalRevenue - totalExpenses

  const totalSales = sales.filter((s) => s.status === SALE_STATUS.COMPLETED).length

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock).length

  const totalProducts = products.length

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    totalSales,
    lowStockProducts,
    totalProducts,
  }
}

export const getRecentSales = async (limit = QUERY_LIMITS.RECENT_SALES) => {
  const sales = await getSales()
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}

export const getLowStockProducts = async () => {
  const products = await getProducts()
  return products
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, QUERY_LIMITS.DASHBOARD_LOW_STOCK)
}

export const getSalesChartData = async (days = 7) => {
  const sales = await getSales()
  const now = new Date()
  const chartData = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const daySales = sales.filter((s) => {
      const saleDate = new Date(s.date)
      return saleDate >= date && saleDate < nextDate && s.status === SALE_STATUS.COMPLETED
    })

    const total = daySales.reduce((sum, s) => sum + s.total, 0)

    chartData.push({
      date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      vendas: total,
    })
  }

  return chartData
}

export const getCategoryDistribution = async () => {
  const products = await getProducts()
  const categoryMap = new Map<string, number>()

  products.forEach((p) => {
    const current = categoryMap.get(p.category) || 0
    categoryMap.set(p.category, current + 1)
  })

  return Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  }))
}
