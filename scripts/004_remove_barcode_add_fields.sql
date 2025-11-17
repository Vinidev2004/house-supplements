-- Remove coluna de código de barras e adiciona campos faltantes
ALTER TABLE products DROP COLUMN IF EXISTS barcode;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier TEXT NOT NULL DEFAULT 'N/A';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
