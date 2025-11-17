export const QUERY_LIMITS = {
  DASHBOARD_LOW_STOCK: 10,
  RECENT_SALES: 5,
  PRODUCTS_PER_PAGE: 50,
  SALES_PER_PAGE: 50,
  TRANSACTIONS_PER_PAGE: 50,
} as const

export const PAYMENT_METHODS = {
  CASH: "cash",
  CREDIT: "credit",
  DEBIT: "debit",
  PIX: "pix",
} as const

export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
} as const

export const DB_TRANSACTION_TYPES = {
  INCOME: "receita",
  EXPENSE: "despesa",
} as const

export const SALE_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  CANCELLED: "cancelled",
} as const

export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: "Produto não encontrado",
  INSUFFICIENT_STOCK: "Estoque insuficiente",
  SALE_NOT_FOUND: "Venda não encontrada",
  CUSTOMER_HAS_SALES: "Cliente possui vendas associadas",
  TRANSACTION_LINKED_TO_SALE: "Transação vinculada a uma venda não pode ser excluída",
  GENERIC_ERROR: "Ocorreu um erro. Tente novamente.",
} as const
