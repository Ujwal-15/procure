-- ============================================================
-- 4Brains Procure — Complete Supabase Schema
-- Run in Supabase SQL Editor (Project: procure)
-- ============================================================

-- vendors
create table if not exists vendors (
  id                   text primary key,
  name                 text not null,
  category             text not null default 'Other',
  contact_name         text not null,
  phone                text not null,
  email                text,
  address              text,
  notes                text,
  -- Banking (accountant / developer only)
  bank_name            text,
  account_holder_name  text,
  account_number       text,
  ifsc_code            text,
  account_type         text,
  upi_id               text,
  -- GST (accountant / developer only)
  gstin                text,
  gst_registration_name text,
  gst_type             text default 'Unregistered',
  -- Meta
  is_active            boolean default true,
  total_spend          numeric(12,2) default 0,
  last_activity_at     timestamptz,
  created_at           timestamptz default now()
);

-- procurement_requests
create table if not exists procurement_requests (
  id                  text primary key,
  request_number      text unique not null,
  title               text not null,
  category            text not null,
  vendor_id           text references vendors(id) on delete set null,
  vendor_name         text,
  project_name        text,
  description         text,
  quantity            numeric,
  total_amount        numeric(12,2) not null,
  payment_terms       text,
  payment_due_date    date,
  expected_delivery   date,
  attachment_url      text,
  notes               text,
  -- Status
  status              text not null default 'draft',
  -- draft | pending_approval | approved | rejected | in_progress | completed | cancelled
  rejection_reason    text,
  -- Payment (managed by Jigar)
  payment_status      text not null default 'unpaid',
  -- unpaid | advance_paid | partially_paid | fully_paid | on_hold
  amount_paid         numeric(12,2) default 0,
  -- Ownership
  requester_id        text not null,
  requester_name      text not null,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- payment_logs (each payment update by Jigar)
create table if not exists payment_logs (
  id               text primary key,
  procurement_id   text not null references procurement_requests(id) on delete cascade,
  payment_status   text not null,
  amount_paid      numeric(12,2) not null,
  payment_date     date not null,
  payment_mode     text,
  transaction_ref  text,
  proof_url        text,
  notes            text,
  logged_by_id     text not null,
  logged_by_name   text not null,
  created_at       timestamptz default now()
);

-- audit_log (every create / edit / status change)
create table if not exists audit_log (
  id               text primary key,
  procurement_id   text references procurement_requests(id) on delete set null,
  user_id          text not null,
  user_name        text not null,
  action           text not null,
  details          jsonb,
  created_at       timestamptz default now()
);

-- email_log
create table if not exists email_log (
  id               text primary key,
  recipient_email  text not null,
  recipient_name   text not null,
  subject          text not null,
  email_type       text not null,
  procurement_id   text references procurement_requests(id) on delete set null,
  sent_at          timestamptz default now(),
  sent_by          text
);

-- notifications (system events for the notifications page)
create table if not exists notifications (
  id               text primary key,
  user_id          text not null,
  title            text not null,
  body             text,
  type             text not null,
  procurement_id   text,
  read             boolean default false,
  created_at       timestamptz default now()
);

-- ── Row-level security (open for anon key — internal app) ──
do $$
declare t text;
begin
  foreach t in array array[
    'vendors','procurement_requests','payment_logs',
    'audit_log','email_log','notifications'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'do $inner$ begin
         if not exists (
           select 1 from pg_policies where tablename = %L and policyname = %L
         ) then
           create policy allow_all on %I for all using (true) with check (true);
         end if;
       end $inner$',
      t, 'allow_all', t
    );
  end loop;
end $$;
