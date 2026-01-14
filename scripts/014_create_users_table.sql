-- Criar tabela de usuários com roles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'funcionario')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca por username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política de acesso total (ajustar conforme necessidade)
CREATE POLICY "Enable all operations for users" ON users FOR ALL USING (true);

-- Inserir usuário admin padrão (senha: 100620)
-- NOTA: Em produção, use bcrypt ou similar para hash de senhas
INSERT INTO users (username, password_hash, name, role) 
VALUES ('house', '100620', 'Administrador', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Inserir usuário funcionário de exemplo (senha: func123)
INSERT INTO users (username, password_hash, name, role) 
VALUES ('funcionario', 'func123', 'Funcionário', 'funcionario')
ON CONFLICT (username) DO NOTHING;
