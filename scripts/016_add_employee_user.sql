-- Criar usuário funcionário
-- Username: func
-- Password: 1234
-- Role: funcionario

INSERT INTO users (id, username, password_hash, name, role, active)
VALUES (
  gen_random_uuid(),
  'func',
  '$2a$10$YourHashedPasswordHere', -- Hash bcrypt da senha '1234'
  'Funcionário',
  'funcionario',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Nota: O hash acima é um placeholder. Na prática, você deve gerar o hash real
-- usando bcrypt com a senha '1234'. Para simplificação, o sistema está
-- configurado para aceitar a senha em texto plano durante desenvolvimento.
