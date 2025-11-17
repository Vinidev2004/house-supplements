-- Criar tabela de clientes
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  cpf text,
  address text,
  city text,
  state text,
  zip_code text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Adicionar coluna customer_id na tabela sales
alter table public.sales add column if not exists customer_id uuid references public.customers(id);

-- Habilitar RLS
alter table public.customers enable row level security;

-- Criar política pública para clientes
create policy "Enable all operations for customers"
  on public.customers for all
  using (true)
  with check (true);

-- Inserir dados de exemplo
insert into public.customers (name, email, phone, cpf) values
  ('João Silva', 'joao@email.com', '(11) 98765-4321', '123.456.789-00'),
  ('Maria Santos', 'maria@email.com', '(11) 91234-5678', '987.654.321-00'),
  ('Pedro Oliveira', 'pedro@email.com', '(11) 99999-8888', '456.789.123-00')
on conflict do nothing;
