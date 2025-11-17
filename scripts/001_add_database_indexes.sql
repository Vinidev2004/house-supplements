-- Adding indexes for better query performance
-- Indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sale_id ON transactions(sale_id);

-- Indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_paid ON transactions(paid);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_stock_min_stock ON products(stock, min_stock) WHERE stock <= min_stock;
CREATE INDEX IF NOT EXISTS idx_transactions_type_created_at ON transactions(type, created_at DESC);
