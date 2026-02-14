-- Create periods table
create table public.periods (
  id uuid not null default gen_random_uuid(),
  name text not null,
  type text,
  start_date date,
  end_date date,
  status text not null check (status in ('DRAFT', 'ACTIVE', 'LOCKED', 'ARCHIVED')),
  default_fare integer default 0,
  notes text,
  created_at timestamp with time zone not null default now(),
  constraint periods_pkey primary key (id)
);

-- Enable RLS for periods
alter table public.periods enable row level security;

-- Create policy for periods
create policy "Enable all access for all users" on public.periods
for all using (true) with check (true);

-- Insert Legacy Period (Migration Step 1)
-- We capture the ID of the new period to use it in the next steps
DO $$
DECLARE
  legacy_period_id uuid;
BEGIN
  insert into public.periods (name, status, notes)
  values ('Legacy Period', 'ACTIVE', 'Auto-generated for potential existing data')
  returning id into legacy_period_id;

  -- Alter buses table (Migration Step 2)
  -- Add period_id column, nullable first
  alter table public.buses add column if not exists period_id uuid references public.periods(id);
  
  -- Update existing records to link to legacy period
  update public.buses set period_id = legacy_period_id where period_id is null;
  
  -- Make period_id not null (Migration Step 3)
  alter table public.buses alter column period_id set not null;

  -- Alter passengers table (Migration Step 4)
  alter table public.passengers add column if not exists period_id uuid references public.periods(id);
  
  -- Update existing records to link to legacy period
  update public.passengers set period_id = legacy_period_id where period_id is null;
  
  -- Make period_id not null (Migration Step 5)
  alter table public.passengers alter column period_id set not null;
END $$;
