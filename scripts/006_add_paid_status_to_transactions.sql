-- Adicionar coluna paid (pago) na tabela transactions
ALTER TABLE transactions
ADD COLUMN paid BOOLEAN DEFAULT false;

-- Atualizar todas as receitas para paid = true (receitas são sempre pagas)
UPDATE transactions
SET paid = true
WHERE type = 'receita';

-- Comentário: Despesas começam como não pagas (paid = false)
