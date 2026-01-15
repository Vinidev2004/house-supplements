-- Criar usuário comercial
-- Username: Comercial
-- Password: Housecomercial#26
-- Role: funcionario

INSERT INTO users (id, username, password_hash, name, role, active)
VALUES (
  gen_random_uuid(),
  'Comercial',
  '$2a$10$YourHashedPasswordHere', -- Hash bcrypt da senha 'Housecomercial#26'
  'Comercial',
  'funcionario',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Nota: O hash acima é um placeholder. Na prática, você deve gerar o hash real
-- usando bcrypt com a senha 'Housecomercial#26'. Para simplificação, o sistema está
-- configurado para aceitar a senha em texto plano durante desenvolvimento.
