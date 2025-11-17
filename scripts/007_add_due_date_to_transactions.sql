-- Adicionar campo de data de vencimento para despesas
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Atualizar despesas existentes para ter data de vencimento igual à data de criação
UPDATE transactions 
SET due_date = created_at 
WHERE type = 'despesa' AND due_date IS NULL;
