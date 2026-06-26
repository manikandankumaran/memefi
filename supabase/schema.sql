-- MemeFi Supabase Schema
-- Run this in the Supabase SQL editor

-- Users table
create table if not exists public.users (
  id text primary key,                    -- Privy user DID
  wallet_address text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Watchlist
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) on delete cascade,
  token_address text not null,
  token_symbol text not null,
  token_name text not null,
  added_at timestamptz default now(),
  unique(user_id, token_address)
);

-- Trade history
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) on delete cascade,
  token_address text not null,
  token_symbol text not null,
  side text check (side in ('buy', 'sell')) not null,
  amount_in numeric not null,
  amount_out numeric not null,
  tx_signature text not null,
  network text not null default 'devnet',
  created_at timestamptz default now()
);

-- Indexes
create index if not exists watchlist_user_id_idx on public.watchlist(user_id);
create index if not exists trades_user_id_idx on public.trades(user_id);
create index if not exists trades_created_at_idx on public.trades(created_at desc);

-- Row Level Security
alter table public.users enable row level security;
alter table public.watchlist enable row level security;
alter table public.trades enable row level security;

-- RLS policies (users can only read/write their own data)
create policy "users_own" on public.users
  for all using (id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "watchlist_own" on public.watchlist
  for all using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "trades_own" on public.trades
  for all using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
