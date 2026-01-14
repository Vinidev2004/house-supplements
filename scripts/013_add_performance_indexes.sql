-- Adding indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_sale_id ON transactions(sale_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_resale_sales_store_id ON resale_sales(store_id);
CREATE INDEX IF NOT EXISTS idx_resale_sales_date ON resale_sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_resale_sale_items_resale_sale_id ON resale_sale_items(resale_sale_id);

-- Adding composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sales_date_customer ON sales(created_at DESC, customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date DESC);
