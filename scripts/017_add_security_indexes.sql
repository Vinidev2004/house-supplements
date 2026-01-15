-- Adding security and performance indexes
-- Índices para melhorar performance de queries de autenticação e segurança

-- Índice único para username na tabela users (previne duplicatas e acelera login)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Índice para role (acelera filtros por tipo de usuário)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE active = true;

-- Índice para user_id em sales (acelera busca de vendas por funcionário)
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);

-- Índice composto para vendas por usuário e data
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, created_at DESC);

-- Índice para resale_sales por data (acelera relatórios B2B)
CREATE INDEX IF NOT EXISTS idx_resale_sales_date ON resale_sales(sale_date DESC);

-- Índice composto para transações por tipo e data
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date DESC);

-- Comentário sobre segurança
COMMENT ON TABLE users IS 'Tabela de usuários com autenticação. TODO: Implementar bcrypt para password_hash em produção';
