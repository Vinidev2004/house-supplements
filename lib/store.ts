import type { Product, Sale, Transaction } from "./types"

const STORAGE_KEYS = {
  PRODUCTS: "supplement-store-products",
  SALES: "supplement-store-sales",
  TRANSACTIONS: "supplement-store-transactions",
}

// Initialize with sample data if empty
const initializeData = () => {
  if (typeof window === "undefined") return

  // Initialize products
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    const sampleProducts: Product[] = [
      {
        id: "1",
        name: "Whey Protein Concentrado 900g",
        category: "Proteínas",
        price: 89.9,
        cost: 55.0,
        stock: 45,
        minStock: 10,
        supplier: "Growth Supplements",
        barcode: "7891234567890",
        description: "Whey protein concentrado de alta qualidade",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Creatina Monohidratada 300g",
        category: "Creatinas",
        price: 69.9,
        cost: 42.0,
        stock: 8,
        minStock: 15,
        supplier: "Max Titanium",
        barcode: "7891234567891",
        description: "Creatina pura micronizada",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Pré-Treino Horus 300g",
        category: "Pré-Treino",
        price: 79.9,
        cost: 48.0,
        stock: 22,
        minStock: 10,
        supplier: "Iridium Labs",
        barcode: "7891234567892",
        description: "Pré-treino com cafeína e beta-alanina",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "4",
        name: "BCAA 2:1:1 120 caps",
        category: "Aminoácidos",
        price: 54.9,
        cost: 32.0,
        stock: 30,
        minStock: 12,
        supplier: "Integralmedica",
        barcode: "7891234567893",
        description: "Aminoácidos de cadeia ramificada",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "5",
        name: "Multivitamínico 60 caps",
        category: "Vitaminas",
        price: 39.9,
        cost: 22.0,
        stock: 5,
        minStock: 10,
        supplier: "Vitafor",
        barcode: "7891234567894",
        description: "Complexo vitamínico completo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(sampleProducts))
  }

  // Initialize sales
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    const sampleSales: Sale[] = [
      {
        id: "1",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          {
            productId: "1",
            productName: "Whey Protein Concentrado 900g",
            quantity: 2,
            price: 89.9,
            subtotal: 179.8,
          },
        ],
        total: 179.8,
        paymentMethod: "credit",
        status: "completed",
      },
      {
        id: "2",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        products: [
          {
            productId: "2",
            productName: "Creatina Monohidratada 300g",
            quantity: 1,
            price: 69.9,
            subtotal: 69.9,
          },
          {
            productId: "4",
            productName: "BCAA 2:1:1 120 caps",
            quantity: 1,
            price: 54.9,
            subtotal: 54.9,
          },
        ],
        total: 124.8,
        paymentMethod: "pix",
        status: "completed",
      },
    ]
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sampleSales))
  }

  // Initialize transactions
  if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
    const sampleTransactions: Transaction[] = [
      {
        id: "1",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: "expense",
        category: "Fornecedores",
        amount: 2500.0,
        description: "Compra de estoque - Growth Supplements",
        paymentMethod: "credit",
      },
      {
        id: "2",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        type: "expense",
        category: "Aluguel",
        amount: 1800.0,
        description: "Aluguel da loja - Março",
        paymentMethod: "debit",
      },
      {
        id: "3",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: "income",
        category: "Vendas",
        amount: 179.8,
        description: "Venda #1",
        relatedSaleId: "1",
      },
      {
        id: "4",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        type: "income",
        category: "Vendas",
        amount: 124.8,
        description: "Venda #2",
        relatedSaleId: "2",
      },
    ]
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sampleTransactions))
  }
}

// Products
export const getProducts = (): Product[] => {
  if (typeof window === "undefined") return []
  initializeData()
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  return data ? JSON.parse(data) : []
}

export const saveProducts = (products: Product[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
}

export const addProduct = (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
  const products = getProducts()
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Product>) => {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index !== -1) {
    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() }
    saveProducts(products)
    return products[index]
  }
  return null
}

export const deleteProduct = (id: string) => {
  const products = getProducts().filter((p) => p.id !== id)
  saveProducts(products)
}

// Sales
export const getSales = (): Sale[] => {
  if (typeof window === "undefined") return []
  initializeData()
  const data = localStorage.getItem(STORAGE_KEYS.SALES)
  return data ? JSON.parse(data) : []
}

export const saveSales = (sales: Sale[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales))
}

export const addSale = (sale: Omit<Sale, "id">) => {
  const sales = getSales()
  const newSale: Sale = {
    ...sale,
    id: Date.now().toString(),
  }
  sales.push(newSale)
  saveSales(sales)

  // Update product stock
  const products = getProducts()
  sale.products.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (product) {
      product.stock -= item.quantity
      product.updatedAt = new Date().toISOString()
    }
  })
  saveProducts(products)

  // Add transaction
  addTransaction({
    date: sale.date,
    type: "income",
    category: "Vendas",
    amount: sale.total,
    description: `Venda #${newSale.id}`,
    paymentMethod: sale.paymentMethod,
    relatedSaleId: newSale.id,
  })

  return newSale
}

// Transactions
export const getTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return []
  initializeData()
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
  return data ? JSON.parse(data) : []
}

export const saveTransactions = (transactions: Transaction[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
}

export const addTransaction = (transaction: Omit<Transaction, "id">) => {
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  }
  transactions.push(newTransaction)
  saveTransactions(transactions)
  return newTransaction
}

export const deleteTransaction = (id: string) => {
  const transactions = getTransactions().filter((t) => t.id !== id)
  saveTransactions(transactions)
}
