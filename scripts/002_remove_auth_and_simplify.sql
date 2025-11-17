-- Remove todas as políticas RLS existentes
drop policy if exists "Users can view their own products" on public.products;
drop policy if exists "Users can insert their own products" on public.products;
drop policy if exists "Users can update their own products" on public.products;
drop policy if exists "Users can delete their own products" on public.products;
drop policy if exists "Users can view their own sales" on public.sales;
drop policy if exists "Users can insert their own sales" on public.sales;
drop policy if exists "Users can delete their own sales" on public.sales;
drop policy if exists "Users can view sale items from their sales" on public.sale_items;
drop policy if exists "Users can insert sale items for their sales" on public.sale_items;
drop policy if exists "Users can delete sale items from their sales" on public.sale_items;
drop policy if exists "Users can view their own transactions" on public.transactions;
drop policy if exists "Users can insert their own transactions" on public.transactions;
drop policy if exists "Users can update their own transactions" on public.transactions;
drop policy if exists "Users can delete their own transactions" on public.transactions;

-- Remove a coluna user_id das tabelas
alter table public.products drop column if exists user_id;
alter table public.sales drop column if exists user_id;
alter table public.transactions drop column if exists user_id;

-- Desabilita RLS (Row Level Security) para acesso público
alter table public.products disable row level security;
alter table public.sales disable row level security;
alter table public.sale_items disable row level security;
alter table public.transactions disable row level security;

-- Cria políticas públicas para permitir todas as operações
create policy "Enable all operations for products"
  on public.products for all
  using (true)
  with check (true);

create policy "Enable all operations for sales"
  on public.sales for all
  using (true)
  with check (true);

create policy "Enable all operations for sale_items"
  on public.sale_items for all
  using (true)
  with check (true);

create policy "Enable all operations for transactions"
  on public.transactions for all
  using (true)
  with check (true);

-- Reabilita RLS com as novas políticas públicas
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.transactions enable row level security;

-- Insere dados de exemplo
insert into public.products (name, category, barcode, price, cost, stock, min_stock) values
  ('Whey Protein 1kg', 'Proteínas', '7891234567890', 120.00, 80.00, 50, 10),
  ('Creatina 300g', 'Suplementos', '7891234567891', 80.00, 50.00, 30, 10),
  ('BCAA 120 caps', 'Aminoácidos', '7891234567892', 60.00, 35.00, 25, 10),
  ('Multivitamínico', 'Vitaminas', '7891234567893', 45.00, 25.00, 40, 10),
  ('Ômega 3', 'Vitaminas', '7891234567894', 55.00, 30.00, 35, 10)
on conflict do nothing;
