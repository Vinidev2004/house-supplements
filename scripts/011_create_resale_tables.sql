-- Criar tabela de lojas parceiras (revendedores)
CREATE TABLE IF NOT EXISTS resale_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de vendas para revendedores
CREATE TABLE IF NOT EXISTS resale_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES resale_stores(id) ON DELETE CASCADE,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_sale NUMERIC(10, 2) NOT NULL DEFAULT 0,
  profit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de itens de vendas para revendedores
CREATE TABLE IF NOT EXISTS resale_sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resale_sale_id UUID NOT NULL REFERENCES resale_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_cost NUMERIC(10, 2) NOT NULL,
  total_sale NUMERIC(10, 2) NOT NULL,
  profit NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE resale_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_sale_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS permissivas para desenvolvimento
CREATE POLICY "Enable all operations for resale_stores" ON resale_stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for resale_sales" ON resale_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for resale_sale_items" ON resale_sale_items FOR ALL USING (true) WITH CHECK (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_resale_sales_store_id ON resale_sales(store_id);
CREATE INDEX IF NOT EXISTS idx_resale_sales_date ON resale_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_resale_sale_items_sale_id ON resale_sale_items(resale_sale_id);
CREATE INDEX IF NOT EXISTS idx_resale_sale_items_product_id ON resale_sale_items(product_id);
