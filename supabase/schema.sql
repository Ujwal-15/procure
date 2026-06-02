-- ============================================================
-- Procure — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- procurement_requests
create table if not exists procurement_requests (
  id               text primary key,
  request_number   text not null unique,
  requester_id     text not null,
  requester_name   text not null,
  event_name       text,
  department       text not null,
  category         text not null,
  items            jsonb not null default '[]',
  estimated_total  numeric(12,2) not null,
  advance_paid     numeric(12,2) default 0,
  notes            text,
  status           text not null default 'draft',
  rejection_reason text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- approvals
create table if not exists approvals (
  id               text primary key,
  request_id       text not null,
  request_number   text not null,
  requester_name   text not null,
  department       text not null,
  event_name       text,
  items            jsonb not null default '[]',
  estimated_total  numeric(12,2) not null,
  advance_paid     numeric(12,2) default 0,
  approver_id      text,
  status           text not null default 'pending',
  notes            text,
  created_at       timestamptz default now()
);

-- vendors
create table if not exists vendors (
  id               text primary key,
  name             text not null,
  contact_name     text not null,
  phone            text not null,
  email            text,
  category         text not null,
  location         text not null,
  bank_name        text,
  account_number   text,
  ifsc_code        text,
  upi_id           text,
  notes            text,
  is_active        boolean default true,
  total_paid       numeric(12,2) default 0,
  total_pending    numeric(12,2) default 0,
  created_at       timestamptz default now()
);

-- events / projects
create table if not exists events (
  id               text primary key,
  name             text not null,
  location         text not null,
  event_date       date not null,
  end_date         date,
  estimated_budget numeric(12,2) default 0,
  status           text not null default 'upcoming',
  created_by       text not null,
  created_at       timestamptz default now()
);

-- invoices
create table if not exists invoices (
  id               text primary key,
  po_id            text,
  po_number        text,
  vendor_id        text not null,
  vendor_name      text not null,
  event_name       text,
  department       text not null,
  invoice_number   text not null,
  invoice_date     date not null,
  due_date         date not null,
  gross_amount     numeric(12,2) not null,
  advance_paid     numeric(12,2) default 0,
  balance_due      numeric(12,2) not null,
  file_url         text,
  status           text not null default 'pending',
  uploaded_by      text not null,
  created_at       timestamptz default now()
);

-- payments
create table if not exists payments (
  id               text primary key,
  invoice_id       text not null,
  vendor_name      text not null,
  amount           numeric(12,2) not null,
  payment_date     date not null,
  payment_mode     text not null,
  reference_number text not null,
  is_advance       boolean default false,
  paid_by          text not null,
  notes            text,
  created_at       timestamptz default now()
);

-- ── Row-level security (allow all for anon key — internal app) ──
alter table procurement_requests enable row level security;
alter table approvals             enable row level security;
alter table vendors               enable row level security;
alter table events                enable row level security;
alter table invoices              enable row level security;
alter table payments              enable row level security;

create policy "allow_all" on procurement_requests for all using (true) with check (true);
create policy "allow_all" on approvals             for all using (true) with check (true);
create policy "allow_all" on vendors               for all using (true) with check (true);
create policy "allow_all" on events                for all using (true) with check (true);
create policy "allow_all" on invoices              for all using (true) with check (true);
create policy "allow_all" on payments              for all using (true) with check (true);
