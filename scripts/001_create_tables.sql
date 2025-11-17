-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create products table
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  barcode text,
  price decimal(10, 2) not null,
  cost decimal(10, 2) not null,
  stock integer not null default 0,
  min_stock integer not null default 10,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create sales table
create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total decimal(10, 2) not null,
  payment_method text not null,
  created_at timestamp with time zone default now()
);

-- Create sale_items table
create table if not exists public.sale_items (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  quantity integer not null,
  unit_price decimal(10, 2) not null,
  subtotal decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('receita', 'despesa')),
  category text not null,
  description text not null,
  amount decimal(10, 2) not null,
  sale_id uuid references public.sales(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.transactions enable row level security;

-- Products policies
create policy "Users can view their own products"
  on public.products for select
  using (auth.uid() = user_id);

create policy "Users can insert their own products"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own products"
  on public.products for update
  using (auth.uid() = user_id);

create policy "Users can delete their own products"
  on public.products for delete
  using (auth.uid() = user_id);

-- Sales policies
create policy "Users can view their own sales"
  on public.sales for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sales"
  on public.sales for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own sales"
  on public.sales for delete
  using (auth.uid() = user_id);

-- Sale items policies
create policy "Users can view sale items from their sales"
  on public.sale_items for select
  using (exists (
    select 1 from public.sales
    where sales.id = sale_items.sale_id
    and sales.user_id = auth.uid()
  ));

create policy "Users can insert sale items for their sales"
  on public.sale_items for insert
  with check (exists (
    select 1 from public.sales
    where sales.id = sale_items.sale_id
    and sales.user_id = auth.uid()
  ));

create policy "Users can delete sale items from their sales"
  on public.sale_items for delete
  using (exists (
    select 1 from public.sales
    where sales.id = sale_items.sale_id
    and sales.user_id = auth.uid()
  ));

-- Transactions policies
create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists products_category_idx on public.products(category);
create index if not exists sales_user_id_idx on public.sales(user_id);
create index if not exists sales_created_at_idx on public.sales(created_at);
create index if not exists sale_items_sale_id_idx on public.sale_items(sale_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_type_idx on public.transactions(type);
