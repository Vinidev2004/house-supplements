-- Adiciona coluna de desconto aos itens de venda
ALTER TABLE sale_items 
ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;

-- Adiciona comentário explicativo
COMMENT ON COLUMN sale_items.discount IS 'Desconto aplicado ao item (em reais)';
