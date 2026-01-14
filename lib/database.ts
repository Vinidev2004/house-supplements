import { createClient } from "./supabase/client"
import type { Product, Sale, Transaction, Customer, ResaleStore, ResaleSale, ResaleSaleItem } from "./types"
import { DB_TRANSACTION_TYPES, ERROR_MESSAGES } from "./constants"

// Tipos do banco de dados
export interface DbProduct {
  id: string
  name: string
  category: string
  supplier: string
  description: string | null
  price: number
  cost: number
  stock: number
  min_stock: number
  estimated_consumption_days: number | null
  created_at: string
  updated_at: string
}

export interface DbSale {
  id: string
  total: number
  payment_method: string
  customer_id?: string
  created_at: string
}

export interface DbSaleItem {
  id: string
  sale_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  discount: number | null
  subtotal: number
  created_at: string
}

export interface DbTransaction {
  id: string
  type: string
  category: string
  description: string
  amount: number
  sale_id: string | null
  created_at: string
  paid: boolean
  due_date: string | null
}

export interface DbCustomer {
  id: string
  name: string
  phone: string
  created_at: string
  updated_at: string
}

export interface DbResaleStore {
  id: string
  name: string
  cnpj: string | null
  contact_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface DbResaleSale {
  id: string
  store_id: string
  sale_date: string
  total_cost: number
  total_sale: number
  profit: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DbResaleSaleItem {
  id: string
  resale_sale_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_cost: number
  unit_price: number
  total_cost: number
  total_sale: number
  profit: number
  created_at: string
}

// Funções de conversão
function dbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    price: Number(dbProduct.price),
    cost: Number(dbProduct.cost),
    stock: dbProduct.stock,
    minStock: dbProduct.min_stock,
    supplier: dbProduct.supplier,
    description: dbProduct.description || undefined,
    estimatedConsumptionDays: dbProduct.estimated_consumption_days || undefined,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  }
}

function dbSaleToSale(dbSale: DbSale & { customer_id?: string }, items: DbSaleItem[], customerName?: string): Sale {
  return {
    id: dbSale.id,
    date: dbSale.created_at,
    products: items.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      price: Number(item.unit_price),
      discount: item.discount ? Number(item.discount) : undefined,
      subtotal: Number(item.subtotal),
    })),
    total: Number(dbSale.total),
    paymentMethod: dbSale.payment_method as any,
    status: "completed",
    customerId: dbSale.customer_id,
    customerName,
  }
}

function dbTransactionToTransaction(dbTransaction: DbTransaction): Transaction {
  const type = dbTransaction.type.toLowerCase() === "receita" ? "income" : "expense"

  return {
    id: dbTransaction.id,
    date: dbTransaction.created_at,
    type: type,
    category: dbTransaction.category,
    amount: Number(dbTransaction.amount),
    description: dbTransaction.description,
    relatedSaleId: dbTransaction.sale_id || undefined,
    paid: dbTransaction.paid,
    createdAt: dbTransaction.created_at,
    dueDate: dbTransaction.due_date || undefined,
  }
}

function dbCustomerToCustomer(dbCustomer: DbCustomer): Customer {
  return {
    id: dbCustomer.id,
    name: dbCustomer.name,
    phone: dbCustomer.phone,
    createdAt: dbCustomer.created_at,
    updatedAt: dbCustomer.updated_at,
  }
}

function dbResaleStoreToResaleStore(dbStore: DbResaleStore): ResaleStore {
  return {
    id: dbStore.id,
    name: dbStore.name,
    cnpj: dbStore.cnpj || undefined,
    contactName: dbStore.contact_name || undefined,
    phone: dbStore.phone || undefined,
    email: dbStore.email || undefined,
    address: dbStore.address || undefined,
    createdAt: dbStore.created_at,
    updatedAt: dbStore.updated_at,
  }
}

function dbResaleSaleToResaleSale(dbSale: DbResaleSale, storeName?: string, items?: DbResaleSaleItem[]): ResaleSale {
  return {
    id: dbSale.id,
    storeId: dbSale.store_id,
    storeName,
    saleDate: dbSale.sale_date,
    totalCost: Number(dbSale.total_cost),
    totalSale: Number(dbSale.total_sale),
    profit: Number(dbSale.profit),
    notes: dbSale.notes || undefined,
    items: items?.map(dbResaleSaleItemToResaleSaleItem),
    createdAt: dbSale.created_at,
    updatedAt: dbSale.updated_at,
  }
}

function dbResaleSaleItemToResaleSaleItem(dbItem: DbResaleSaleItem): ResaleSaleItem {
  return {
    id: dbItem.id,
    resaleSaleId: dbItem.resale_sale_id,
    productId: dbItem.product_id,
    productName: dbItem.product_name,
    quantity: dbItem.quantity,
    unitCost: Number(dbItem.unit_cost),
    unitPrice: Number(dbItem.unit_price),
    totalCost: Number(dbItem.total_cost),
    totalSale: Number(dbItem.total_sale),
    profit: Number(dbItem.profit),
    createdAt: dbItem.created_at,
  }
}

// PRODUTOS
export async function getProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("products").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching products:", error)
    return []
  }

  return (data || []).map(dbProductToProduct)
}

export async function addProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      category: product.category,
      supplier: product.supplier,
      description: product.description || null,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      min_stock: product.minStock,
      estimated_consumption_days: product.estimatedConsumptionDays || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error adding product:", error)
    return null
  }

  return dbProductToProduct(data)
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const supabase = createClient()
  const dbUpdates: any = {}

  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier
  if (updates.description !== undefined) dbUpdates.description = updates.description || null
  if (updates.price !== undefined) dbUpdates.price = updates.price
  if (updates.cost !== undefined) dbUpdates.cost = updates.cost
  if (updates.stock !== undefined) dbUpdates.stock = updates.stock
  if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock
  if (updates.estimatedConsumptionDays !== undefined)
    dbUpdates.estimated_consumption_days = updates.estimatedConsumptionDays || null

  dbUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("products").update(dbUpdates).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating product:", error)
    return null
  }

  return dbProductToProduct(data)
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting product:", error)
    return false
  }

  return true
}

// VENDAS
export async function getSales(): Promise<Sale[]> {
  const supabase = createClient()

  // Fetch sales with customer data in a single query
  const { data: salesData, error: salesError } = await supabase
    .from("sales")
    .select(`
      *,
      customers(name),
      sale_items(*)
    `)
    .order("created_at", { ascending: false })

  if (salesError) {
    console.error("[v0] Error fetching sales:", salesError)
    return []
  }

  // Transform data
  return (salesData || []).map((sale) => {
    const customerName = (sale as any).customers?.name
    const items = (sale as any).sale_items || []
    return dbSaleToSale(sale, items, customerName)
  })
}

export async function addSale(sale: Omit<Sale, "id">): Promise<Sale | null> {
  const supabase = createClient()

  try {
    // Validate stock before starting transaction
    for (const item of sale.products) {
      const { data: product, error } = await supabase
        .from("products")
        .select("stock, name")
        .eq("id", item.productId)
        .single()

      if (error || !product) {
        console.error("[v0] Product not found:", item.productId)
        throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND)
      }

      if (product.stock < item.quantity) {
        console.error("[v0] Insufficient stock for product:", product.name)
        throw new Error(`${ERROR_MESSAGES.INSUFFICIENT_STOCK}: ${product.name}`)
      }
    }

    // Insert sale
    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .insert({
        total: sale.total,
        payment_method: sale.paymentMethod,
        customer_id: sale.customerId || null,
      })
      .select()
      .single()

    if (saleError) throw saleError

    const items = sale.products.map((item) => ({
      sale_id: saleData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.price,
      discount: item.discount || 0,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase.from("sale_items").insert(items)
    if (itemsError) throw itemsError

    const stockUpdates = items.map(async (item) => {
      const { data: product } = await supabase.from("products").select("stock").eq("id", item.productId).single()

      if (product) {
        return supabase
          .from("products")
          .update({ stock: product.stock - item.quantity, updated_at: new Date().toISOString() })
          .eq("id", item.productId)
      }
    })

    await Promise.all(stockUpdates)

    // Add transaction
    await supabase.from("transactions").insert({
      type: DB_TRANSACTION_TYPES.INCOME,
      category: "Vendas",
      description: `Venda #${saleData.id.substring(0, 8)} - ${sale.paymentMethod.toUpperCase()}`,
      amount: sale.total,
      sale_id: saleData.id,
      paid: true,
    })

    // Fetch complete sale data
    const { data: itemsData } = await supabase.from("sale_items").select("*").eq("sale_id", saleData.id)

    return dbSaleToSale(saleData, itemsData || [], sale.customerName)
  } catch (error) {
    console.error("[v0] Error adding sale:", error)
    return null
  }
}

export async function cancelSale(saleId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Fetch sale items
    const { data: items, error: itemsError } = await supabase.from("sale_items").select("*").eq("sale_id", saleId)

    if (itemsError || !items) {
      throw new Error(ERROR_MESSAGES.SALE_NOT_FOUND)
    }

    // Restore stock for all products in parallel
    const stockRestores = items.map(async (item) => {
      const { data: product } = await supabase.from("products").select("stock").eq("id", item.product_id).single()

      if (product) {
        return supabase
          .from("products")
          .update({ stock: product.stock + item.quantity, updated_at: new Date().toISOString() })
          .eq("id", item.product_id)
      }
    })

    await Promise.all(stockRestores)

    // Delete related data in parallel
    await Promise.all([
      supabase.from("transactions").delete().eq("sale_id", saleId),
      supabase.from("sale_items").delete().eq("sale_id", saleId),
    ])

    // Delete sale
    const { error: deleteError } = await supabase.from("sales").delete().eq("id", saleId)
    if (deleteError) throw deleteError

    return true
  } catch (error) {
    console.error("[v0] Error cancelling sale:", error)
    return false
  }
}

// TRANSAÇÕES
export async function getTransactions(): Promise<Transaction[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching transactions:", error)
    return []
  }

  return (data || []).map(dbTransactionToTransaction)
}

export async function addTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction | null> {
  const supabase = createClient()

  // Validate amount
  if (transaction.amount <= 0) {
    console.error("[v0] Transaction amount must be positive")
    return null
  }

  const dbType = transaction.type === "income" ? DB_TRANSACTION_TYPES.INCOME : DB_TRANSACTION_TYPES.EXPENSE

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type: dbType,
      category: transaction.category,
      description: transaction.description || "Sem descrição",
      amount: transaction.amount,
      sale_id: transaction.relatedSaleId || null,
      paid: transaction.type === "income" ? true : false,
      due_date: transaction.dueDate || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error adding transaction:", error)
    return null
  }

  return dbTransactionToTransaction(data)
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Check if transaction is linked to a sale
  const { data: transaction } = await supabase.from("transactions").select("sale_id").eq("id", id).single()

  if (transaction?.sale_id) {
    return { success: false, error: ERROR_MESSAGES.TRANSACTION_LINKED_TO_SALE }
  }

  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting transaction:", error)
    return { success: false, error: ERROR_MESSAGES.GENERIC_ERROR }
  }

  return { success: true }
}

export async function updateTransactionPaidStatus(id: string, paid: boolean): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("transactions").update({ paid }).eq("id", id)

  if (error) {
    console.error("[v0] Error updating transaction paid status:", error)
    return false
  }

  return true
}

// CLIENTES
export async function getCustomers(): Promise<Customer[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("customers").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching customers:", error)
    return []
  }

  return (data || []).map(dbCustomerToCustomer)
}

export async function addCustomer(
  customer: Omit<Customer, "id" | "createdAt" | "updatedAt">,
): Promise<Customer | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: customer.name,
      phone: customer.phone,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error adding customer:", error)
    return null
  }

  return dbCustomerToCustomer(data)
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  const supabase = createClient()
  const dbUpdates: any = {}

  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone

  dbUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("customers").update(dbUpdates).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating customer:", error)
    return null
  }

  return dbCustomerToCustomer(data)
}

export async function deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Check if customer has associated sales
  const { data: sales } = await supabase.from("sales").select("id").eq("customer_id", id).limit(1)

  if (sales && sales.length > 0) {
    return { success: false, error: ERROR_MESSAGES.CUSTOMER_HAS_SALES }
  }

  const { error } = await supabase.from("customers").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting customer:", error)
    return { success: false, error: ERROR_MESSAGES.GENERIC_ERROR }
  }

  return { success: true }
}

// REVENDAS (B2B)
export async function getResaleStores(): Promise<ResaleStore[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("resale_stores").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching resale stores:", error)
    return []
  }

  return (data || []).map(dbResaleStoreToResaleStore)
}

export async function addResaleStore(
  store: Omit<ResaleStore, "id" | "createdAt" | "updatedAt">,
): Promise<ResaleStore | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("resale_stores")
    .insert({
      name: store.name,
      cnpj: store.cnpj || null,
      contact_name: store.contactName || null,
      phone: store.phone || null,
      email: store.email || null,
      address: store.address || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error adding resale store:", error)
    return null
  }

  return dbResaleStoreToResaleStore(data)
}

export async function updateResaleStore(id: string, updates: Partial<ResaleStore>): Promise<ResaleStore | null> {
  const supabase = createClient()
  const dbUpdates: any = { updated_at: new Date().toISOString() }

  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.cnpj !== undefined) dbUpdates.cnpj = updates.cnpj || null
  if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName || null
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null
  if (updates.email !== undefined) dbUpdates.email = updates.email || null
  if (updates.address !== undefined) dbUpdates.address = updates.address || null

  const { data, error } = await supabase.from("resale_stores").update(dbUpdates).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating resale store:", error)
    return null
  }

  return dbResaleStoreToResaleStore(data)
}

export async function deleteResaleStore(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("resale_stores").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting resale store:", error)
    return false
  }

  return true
}

export async function getResaleSales(): Promise<ResaleSale[]> {
  const supabase = createClient()

  const { data: salesData, error: salesError } = await supabase
    .from("resale_sales")
    .select(`
      *,
      resale_stores(name),
      resale_sale_items(*)
    `)
    .order("sale_date", { ascending: false })

  if (salesError) {
    console.error("[v0] Error fetching resale sales:", salesError)
    return []
  }

  return (salesData || []).map((sale) => {
    const storeName = (sale as any).resale_stores?.name
    const items = (sale as any).resale_sale_items || []
    return dbResaleSaleToResaleSale(sale, storeName, items)
  })
}

export async function addResaleSale(
  sale: Omit<ResaleSale, "id" | "createdAt" | "updatedAt">,
): Promise<ResaleSale | null> {
  const supabase = createClient()

  try {
    // Calculate totals
    let totalCost = 0
    let totalSale = 0

    const items = sale.items || []
    items.forEach((item) => {
      totalCost += item.totalCost
      totalSale += item.totalSale
    })

    const profit = totalSale - totalCost

    // Insert resale sale
    const { data: saleData, error: saleError } = await supabase
      .from("resale_sales")
      .insert({
        store_id: sale.storeId,
        sale_date: sale.saleDate,
        total_cost: totalCost,
        total_sale: totalSale,
        profit: profit,
        notes: sale.notes || null,
      })
      .select()
      .single()

    if (saleError) throw saleError

    // Insert resale sale items
    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        resale_sale_id: saleData.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_cost: item.unitCost,
        unit_price: item.unitPrice,
        total_cost: item.totalCost,
        total_sale: item.totalSale,
        profit: item.profit,
      }))

      const { error: itemsError } = await supabase.from("resale_sale_items").insert(itemsToInsert)
      if (itemsError) throw itemsError
    }

    const stockUpdates = items.map(async (item) => {
      const { data: product } = await supabase.from("products").select("stock").eq("id", item.productId).single()

      if (product) {
        return supabase
          .from("products")
          .update({ stock: product.stock - item.quantity, updated_at: new Date().toISOString() })
          .eq("id", item.productId)
      }
    })

    await Promise.all(stockUpdates)

    // Fetch complete sale data
    const { data: itemsData } = await supabase.from("resale_sale_items").select("*").eq("resale_sale_id", saleData.id)

    return dbResaleSaleToResaleSale(saleData, sale.storeName, itemsData || [])
  } catch (error) {
    console.error("[v0] Error adding resale sale:", error)
    return null
  }
}

export async function deleteResaleSale(saleId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Delete items first
    await supabase.from("resale_sale_items").delete().eq("resale_sale_id", saleId)

    // Delete sale
    const { error } = await supabase.from("resale_sales").delete().eq("id", saleId)
    if (error) throw error

    return true
  } catch (error) {
    console.error("[v0] Error deleting resale sale:", error)
    return false
  }
}
