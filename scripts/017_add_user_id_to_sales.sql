-- Adicionar coluna user_id na tabela sales para rastrear quem fez a venda
ALTER TABLE sales ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);

-- Criar índice para melhorar performance das consultas por usuário
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- Criar índice composto para consultas de vendas por usuário e data
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, created_at DESC);
