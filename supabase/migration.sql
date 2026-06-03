-- ============================================================
-- Migration — run this if the tables already exist from
-- the previous schema. Safe to run multiple times.
-- ============================================================

-- Add new columns to vendors
alter table vendors add column if not exists address              text;
alter table vendors add column if not exists account_holder_name  text;
alter table vendors add column if not exists account_type         text;
alter table vendors add column if not exists gstin                text;
alter table vendors add column if not exists gst_registration_name text;
alter table vendors add column if not exists gst_type             text default 'Unregistered';
alter table vendors add column if not exists total_spend          numeric(12,2) default 0;
alter table vendors add column if not exists last_activity_at     timestamptz;
alter table vendors add column if not exists category             text not null default 'Other';
alter table vendors add column if not exists contact_name         text not null default '';
alter table vendors add column if not exists phone                text not null default '';

-- Rename old columns in vendors (if they exist under old names)
do $$ begin
  if exists (select 1 from information_schema.columns where table_name='vendors' and column_name='contact_name_old') then
    alter table vendors rename column contact_name_old to contact_name;
  end if;
end $$;

-- Drop unused old vendor columns
alter table vendors drop column if exists total_paid;
alter table vendors drop column if exists total_pending;

-- Rebuild procurement_requests with new columns
alter table procurement_requests add column if not exists title               text;
alter table procurement_requests add column if not exists category            text not null default 'Other';
alter table procurement_requests add column if not exists vendor_id           text references vendors(id) on delete set null;
alter table procurement_requests add column if not exists vendor_name         text;
alter table procurement_requests add column if not exists project_name        text;
alter table procurement_requests add column if not exists description         text;
alter table procurement_requests add column if not exists quantity            numeric;
alter table procurement_requests add column if not exists total_amount        numeric(12,2);
alter table procurement_requests add column if not exists payment_terms       text;
alter table procurement_requests add column if not exists payment_due_date    date;
alter table procurement_requests add column if not exists expected_delivery   date;
alter table procurement_requests add column if not exists attachment_url      text;
alter table procurement_requests add column if not exists payment_status      text not null default 'unpaid';
alter table procurement_requests add column if not exists amount_paid         numeric(12,2) default 0;

-- Update status values (convert old statuses to new)
update procurement_requests set status = 'draft'            where status = 'draft';
update procurement_requests set status = 'pending_approval' where status = 'pending_approval';
update procurement_requests set status = 'approved'         where status = 'approved';
update procurement_requests set status = 'rejected'         where status = 'rejected';
update procurement_requests set status = 'in_progress'      where status in ('ordered','advance_paid','received');
update procurement_requests set status = 'completed'        where status in ('invoice_uploaded','partially_paid','closed');

-- Set title from old items data if title is null
update procurement_requests
set title = request_number
where title is null or title = '';

-- New tables
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

create table if not exists audit_log (
  id               text primary key,
  procurement_id   text references procurement_requests(id) on delete set null,
  user_id          text not null,
  user_name        text not null,
  action           text not null,
  details          jsonb,
  created_at       timestamptz default now()
);

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

-- Enable RLS + policies on new tables
do $$
declare t text;
begin
  foreach t in array array['payment_logs','audit_log','email_log'] loop
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

-- Delete old notifications (start clean)
delete from notifications where true;
