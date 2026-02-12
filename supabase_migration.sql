-- Create buses table
create table public.buses (
  id uuid not null default gen_random_uuid(),
  destination text not null,
  bus_number integer not null,
  max_passengers integer not null default 50,
  meal_count integer not null default 0,
  meal_price integer not null default 0,
  fare_per_passenger integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint buses_pkey primary key (id)
);

-- Create passengers table
create table public.passengers (
  id uuid not null default gen_random_uuid(),
  name text not null,
  gender text not null check (gender in ('L', 'P')),
  address text,
  phone text,
  destination text not null,
  status text not null,
  group_pondok text,
  bus_seat_number integer,
  meal_count integer not null default 0,
  meal_payment integer not null default 0,
  total_payment integer not null default 0,
  petugas text,
  bus_id uuid references public.buses(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  constraint passengers_pkey primary key (id)
);

-- Enable RLS
alter table public.buses enable row level security;
alter table public.passengers enable row level security;

-- Create policies
create policy "Enable all access for all users" on public.buses
for all using (true) with check (true);

create policy "Enable all access for all users" on public.passengers
for all using (true) with check (true);
