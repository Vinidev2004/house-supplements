-- Simplificar tabela de clientes para ter apenas campos essenciais
-- Remove campos desnecessários e torna phone obrigatório

-- Remover colunas não utilizadas
ALTER TABLE customers DROP COLUMN IF EXISTS email;
ALTER TABLE customers DROP COLUMN IF EXISTS cpf;
ALTER TABLE customers DROP COLUMN IF EXISTS address;
ALTER TABLE customers DROP COLUMN IF EXISTS city;
ALTER TABLE customers DROP COLUMN IF EXISTS state;
ALTER TABLE customers DROP COLUMN IF EXISTS zip_code;
ALTER TABLE customers DROP COLUMN IF EXISTS notes;

-- Tornar phone obrigatório (WhatsApp)
ALTER TABLE customers ALTER COLUMN phone SET NOT NULL;

-- Adicionar comentário para documentação
COMMENT ON COLUMN customers.phone IS 'WhatsApp do cliente';
