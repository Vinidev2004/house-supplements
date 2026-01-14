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
  discount?: number
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
  b2bRevenue: number
  totalExpenses: number
  netProfit: number
  totalSales: number
  b2bSales: number
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

export interface ResaleStore {
  id: string
  name: string
  cnpj?: string
  contactName?: string
  phone?: string
  email?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface ResaleSale {
  id: string
  storeId: string
  storeName?: string
  saleDate: string
  totalCost: number
  totalSale: number
  profit: number
  notes?: string
  items?: ResaleSaleItem[]
  createdAt: string
  updatedAt: string
}

export interface ResaleSaleItem {
  id: string
  resaleSaleId: string
  productId: string
  productName: string
  quantity: number
  unitCost: number
  unitPrice: number
  totalCost: number
  totalSale: number
  profit: number
  createdAt: string
}

export type UserRole = "admin" | "funcionario"

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  userId: string
  username: string
  name: string
  role: UserRole
}
