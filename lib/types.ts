export interface Product {
  id: string
  name: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  supplier: string
  description?: string
  estimatedConsumptionDays?: number
  createdAt: string
  updatedAt: string
}

export interface Sale {
  id: string
  date: string
  products: SaleItem[]
  total: number
  paymentMethod: "cash" | "credit" | "debit" | "pix"
  status: "completed" | "pending" | "cancelled"
  customerId?: string
  customerName?: string
  notes?: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface Transaction {
  id: string
  date: string
  type: "income" | "expense"
  category: string
  amount: number
  description: string
  paymentMethod?: string
  relatedSaleId?: string
  paid?: boolean
  createdAt?: string
  dueDate?: string
}

export interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalSales: number
  lowStockProducts: number
  totalProducts: number
}

export interface Customer {
  id: string
  name: string
  phone: string // WhatsApp - agora obrigatório
  createdAt: string
  updatedAt: string
}

export type Category =
  | "Proteínas"
  | "Creatinas"
  | "Pré-Treino"
  | "Aminoácidos"
  | "Vitaminas"
  | "Barras e Snacks"
  | "Acessórios"
  | "Outros"

export type ExpenseCategory =
  | "Fornecedores"
  | "Aluguel"
  | "Salários"
  | "Energia"
  | "Marketing"
  | "Impostos"
  | "Manutenção"
  | "Outros"
