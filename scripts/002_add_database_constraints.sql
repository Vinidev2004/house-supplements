-- Adding constraints for data validation
-- Products constraints
ALTER TABLE products
  ADD CONSTRAINT check_price_positive CHECK (price >= 0),
  ADD CONSTRAINT check_cost_positive CHECK (cost >= 0),
  ADD CONSTRAINT check_stock_non_negative CHECK (stock >= 0),
  ADD CONSTRAINT check_min_stock_non_negative CHECK (min_stock >= 0);

-- Sales constraints
ALTER TABLE sales
  ADD CONSTRAINT check_total_positive CHECK (total > 0);

-- Sale items constraints
ALTER TABLE sale_items
  ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT check_unit_price_positive CHECK (unit_price >= 0),
  ADD CONSTRAINT check_subtotal_positive CHECK (subtotal >= 0);

-- Transactions constraints
ALTER TABLE transactions
  ADD CONSTRAINT check_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT check_type_valid CHECK (type IN ('receita', 'despesa'));

-- Add NOT NULL constraints to critical fields
ALTER TABLE products
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN cost SET NOT NULL,
  ALTER COLUMN stock SET NOT NULL,
  ALTER COLUMN min_stock SET NOT NULL;

ALTER TABLE sales
  ALTER COLUMN total SET NOT NULL,
  ALTER COLUMN payment_method SET NOT NULL;

ALTER TABLE customers
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL;

ALTER TABLE transactions
  ALTER COLUMN type SET NOT NULL,
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN amount SET NOT NULL,
  ALTER COLUMN paid SET NOT NULL;
