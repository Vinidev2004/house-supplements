-- Script para adicionar usuário funcionário
-- Login: func, Senha: 1234, Acesso: Estoque, Vendas, Revendas

-- Inserir usuário funcionário se não existir
INSERT INTO users (username, password_hash, name, role, active)
VALUES ('func', '1234', 'Funcionário', 'funcionario', true)
ON CONFLICT (username) DO UPDATE SET
  password_hash = '1234',
  name = 'Funcionário',
  role = 'funcionario',
  active = true;

-- Garantir que o admin também existe
INSERT INTO users (username, password_hash, name, role, active)
VALUES ('joao', 'joao123', 'João Admin', 'admin', true)
ON CONFLICT (username) DO NOTHING;
