CREATE OR REPLACE FUNCTION hash_password(password text) 
RETURNS text AS $$
BEGIN
  -- Simple hash for demonstration - in production use bcrypt
  RETURN encode(digest(password || 'house_salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Add admin user (house/100620)
INSERT INTO users (id, username, name, password_hash, role, active)
VALUES (
  gen_random_uuid(),
  'house',
  'Administrador',
  hash_password('100620'),
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Add employee user (func/1234)
INSERT INTO users (id, username, name, password_hash, role, active)
VALUES (
  gen_random_uuid(),
  'func',
  'Funcionário',
  hash_password('1234'),
  'funcionario',
  true
)
ON CONFLICT (username) DO NOTHING;
