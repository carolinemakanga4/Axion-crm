-- Axion CRM live-alignment migration
-- Source of truth: supabase/live-shema/*
-- Non-destructive: avoids table/column drops.

begin;

-- ------------------------------------------------------------
-- 0) Helpers
-- ------------------------------------------------------------
create or replace function public.get_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(role = 'admin', false) from public.profiles where id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 1) Canonical invoice totals logic
-- tax_rate canonical = decimal (0.15 = 15%)
-- backward-compatible: if tax_rate > 1, treat as percent
-- ------------------------------------------------------------
create or replace function public.recalculate_invoice_totals(p_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric := 0;
  v_tax_rate numeric := 0;
  v_tax_amount numeric := 0;
  v_total numeric := 0;
begin
  select coalesce(sum(line_total), 0)
  into v_subtotal
  from public.invoice_line_items
  where invoice_id = p_invoice_id;

  select coalesce(tax_rate, 0)
  into v_tax_rate
  from public.invoices
  where id = p_invoice_id;

  if v_tax_rate > 1 then
    v_tax_rate := v_tax_rate / 100.0;
  end if;

  v_tax_amount := v_subtotal * v_tax_rate;
  v_total := v_subtotal + v_tax_amount;

  update public.invoices
  set subtotal = v_subtotal,
      tax_amount = v_tax_amount,
      total = v_total,
      updated_at = now()
  where id = p_invoice_id;
end;
$$;

create or replace function public.set_invoice_line_total()
returns trigger
language plpgsql
as $$
begin
  new.quantity := coalesce(new.quantity, 0);
  new.unit_price := coalesce(new.unit_price, 0);
  new.line_total := new.quantity * new.unit_price;
  return new;
end;
$$;

create or replace function public.touch_invoice_totals_from_line_items()
returns trigger
language plpgsql
as $$
declare
  v_old uuid;
  v_new uuid;
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_invoice_totals(old.invoice_id);
    return old;
  end if;

  v_new := new.invoice_id;

  if tg_op = 'UPDATE' then
    v_old := old.invoice_id;
    if v_old is distinct from v_new then
      perform public.recalculate_invoice_totals(v_old);
    end if;
  end if;

  perform public.recalculate_invoice_totals(v_new);
  return new;
end;
$$;

create or replace function public.touch_invoice_totals_from_invoice()
returns trigger
language plpgsql
as $$
begin
  perform public.recalculate_invoice_totals(new.id);
  return new;
end;
$$;

drop trigger if exists trg_set_line_total on public.invoice_line_items;
drop trigger if exists trg_set_invoice_line_total on public.invoice_line_items;
create trigger trg_set_invoice_line_total
before insert or update on public.invoice_line_items
for each row execute function public.set_invoice_line_total();

drop trigger if exists recalculate_invoice_totals on public.invoice_line_items;
drop trigger if exists trg_recalc_invoice_totals_from_line_items on public.invoice_line_items;
create trigger trg_recalc_invoice_totals_from_line_items
after insert or update or delete on public.invoice_line_items
for each row execute function public.touch_invoice_totals_from_line_items();

drop trigger if exists trg_recalc_invoice_totals_on_tax_rate on public.invoices;
create trigger trg_recalc_invoice_totals_on_tax_rate
after update of tax_rate on public.invoices
for each row execute function public.touch_invoice_totals_from_invoice();

-- ------------------------------------------------------------
-- 2) Canonical payment totals/status logic
-- ------------------------------------------------------------
create or replace function public.recalculate_invoice_payment_totals(p_invoice_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric(12,2) := 0;
  v_paid numeric(12,2) := 0;
  v_balance numeric(12,2) := 0;
  v_due_date date;
  v_status text := 'draft';
begin
  select coalesce(i.total, 0), i.due_date
  into v_total, v_due_date
  from public.invoices i
  where i.id = p_invoice_id;

  select coalesce(sum(p.amount), 0)
  into v_paid
  from public.payments p
  where p.invoice_id = p_invoice_id;

  v_balance := greatest(v_total - v_paid, 0);

  if v_total <= 0 then
    v_status := 'draft';
  elsif v_balance <= 0 then
    v_status := 'paid';
  elsif v_due_date is not null and v_due_date < current_date then
    v_status := 'overdue';
  else
    v_status := 'sent';
  end if;

  update public.invoices i
  set amount_paid = v_paid,
      balance_due = v_balance,
      status = v_status,
      updated_at = now()
  where i.id = p_invoice_id;
end;
$$;

create or replace function public.handle_payment_invoice_recalc()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_invoice_payment_totals(old.invoice_id);
    return old;
  end if;

  perform public.recalculate_invoice_payment_totals(new.invoice_id);

  if tg_op = 'UPDATE' and old.invoice_id is distinct from new.invoice_id then
    perform public.recalculate_invoice_payment_totals(old.invoice_id);
  end if;

  return new;
end;
$$;

create or replace function public.handle_invoice_total_recalc()
returns trigger
language plpgsql
as $$
begin
  perform public.recalculate_invoice_payment_totals(new.id);
  return new;
end;
$$;

drop trigger if exists payments_after_change on public.payments;
drop trigger if exists trg_payments_recalculate_invoice_totals on public.payments;
create trigger payments_after_change
after insert or update or delete on public.payments
for each row execute function public.handle_payment_invoice_recalc();

drop trigger if exists trg_invoices_recalculate_balance_due on public.invoices;
create trigger trg_invoices_recalculate_balance_due
after insert or update on public.invoices
for each row execute function public.handle_invoice_total_recalc();

update public.invoices i
set status = case
  when coalesce(i.total,0) <= 0 then 'draft'
  when coalesce(i.amount_paid,0) >= coalesce(i.total,0) then 'paid'
  when i.due_date is not null and i.due_date < current_date then 'overdue'
  else 'sent'
end
where i.status = 'partially_paid';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoices_status_allowed_chk'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_status_allowed_chk
      check (status in ('draft','sent','paid','overdue','cancelled')) not valid;
    alter table public.invoices validate constraint invoices_status_allowed_chk;
  end if;
end $$;

-- ------------------------------------------------------------
-- 3) RLS policy consolidation (focused tables)
-- ------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Users can view clients in their org" on public.clients;
drop policy if exists "Users can create clients in their org" on public.clients;
drop policy if exists "Admins can update clients in their org" on public.clients;
drop policy if exists "Admins can delete clients in their org" on public.clients;
drop policy if exists clients_select_own on public.clients;
drop policy if exists clients_insert_own on public.clients;
drop policy if exists clients_update_own on public.clients;
drop policy if exists clients_delete_own on public.clients;

drop policy if exists "Users can view invoices in their org" on public.invoices;
drop policy if exists "Users can create invoices in their org" on public.invoices;
drop policy if exists "Admins can update invoices in their org" on public.invoices;
drop policy if exists "Admins can delete invoices in their org" on public.invoices;
drop policy if exists invoices_select_own on public.invoices;
drop policy if exists invoices_insert_own on public.invoices;
drop policy if exists invoices_update_own on public.invoices;
drop policy if exists invoices_delete_own on public.invoices;

drop policy if exists "Users can view line items for invoices in their org" on public.invoice_line_items;
drop policy if exists "Users can create line items for invoices in their org" on public.invoice_line_items;
drop policy if exists "Admins can update line items for invoices in their org" on public.invoice_line_items;
drop policy if exists "Admins can delete line items for invoices in their org" on public.invoice_line_items;
drop policy if exists ili_select_own on public.invoice_line_items;
drop policy if exists ili_insert_own on public.invoice_line_items;
drop policy if exists ili_update_own on public.invoice_line_items;
drop policy if exists ili_delete_own on public.invoice_line_items;
drop policy if exists invoice_line_items_select_own on public.invoice_line_items;
drop policy if exists invoice_line_items_insert_own on public.invoice_line_items;
drop policy if exists invoice_line_items_update_own on public.invoice_line_items;
drop policy if exists invoice_line_items_delete_own on public.invoice_line_items;

drop policy if exists "Users can view profiles in their org" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can update any profile in their org" on public.profiles;
drop policy if exists profiles_select_own on public.profiles;

create policy clients_select_org
on public.clients
for select to authenticated
using (org_id = public.get_user_org_id());

create policy clients_insert_org
on public.clients
for insert to authenticated
with check (
  org_id = public.get_user_org_id()
  and coalesce(user_id, auth.uid()) = auth.uid()
);

create policy clients_update_org_admin_or_owner
on public.clients
for update to authenticated
using (org_id = public.get_user_org_id() and (public.is_admin() or user_id = auth.uid()))
with check (org_id = public.get_user_org_id() and (public.is_admin() or user_id = auth.uid()));

create policy clients_delete_org_admin_or_owner
on public.clients
for delete to authenticated
using (org_id = public.get_user_org_id() and (public.is_admin() or user_id = auth.uid()));

create policy invoices_select_org
on public.invoices
for select to authenticated
using (org_id = public.get_user_org_id());

create policy invoices_insert_org
on public.invoices
for insert to authenticated
with check (
  org_id = public.get_user_org_id()
  and coalesce(user_id, auth.uid()) = auth.uid()
);

create policy invoices_update_org_admin_or_owner
on public.invoices
for update to authenticated
using (org_id = public.get_user_org_id() and (public.is_admin() or user_id = auth.uid()))
with check (org_id = public.get_user_org_id() and (public.is_admin() or user_id = auth.uid()));

create policy invoices_delete_org_admin_or_owner
on public.invoices
for delete to authenticated
using (org_id = public.get_user_org_id() and (public.is_admin() or user_id = auth.uid()));

create policy ili_select_org
on public.invoice_line_items
for select to authenticated
using (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_line_items.invoice_id
      and i.org_id = public.get_user_org_id()
  )
);

create policy ili_insert_org
on public.invoice_line_items
for insert to authenticated
with check (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_line_items.invoice_id
      and i.org_id = public.get_user_org_id()
      and (public.is_admin() or i.user_id = auth.uid())
  )
);

create policy ili_update_org_admin_or_owner
on public.invoice_line_items
for update to authenticated
using (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_line_items.invoice_id
      and i.org_id = public.get_user_org_id()
      and (public.is_admin() or i.user_id = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_line_items.invoice_id
      and i.org_id = public.get_user_org_id()
      and (public.is_admin() or i.user_id = auth.uid())
  )
);

create policy ili_delete_org_admin_or_owner
on public.invoice_line_items
for delete to authenticated
using (
  exists (
    select 1
    from public.invoices i
    where i.id = invoice_line_items.invoice_id
      and i.org_id = public.get_user_org_id()
      and (public.is_admin() or i.user_id = auth.uid())
  )
);

create policy profiles_select_org
on public.profiles
for select to authenticated
using (org_id = public.get_user_org_id());

create policy profiles_update_self_or_admin
on public.profiles
for update to authenticated
using (id = auth.uid() or (org_id = public.get_user_org_id() and public.is_admin()))
with check (id = auth.uid() or (org_id = public.get_user_org_id() and public.is_admin()));

-- ------------------------------------------------------------
-- 4) Performance indexes
-- ------------------------------------------------------------
create index if not exists idx_clients_org_created_at on public.clients (org_id, created_at desc);
create index if not exists idx_clients_user_id on public.clients (user_id);

create index if not exists idx_invoices_org_created_at on public.invoices (org_id, created_at desc);
create index if not exists idx_invoices_user_id on public.invoices (user_id);
create index if not exists idx_invoices_client_id on public.invoices (client_id);

create index if not exists idx_ili_invoice_created_at on public.invoice_line_items (invoice_id, created_at);
create index if not exists idx_payments_invoice_id on public.payments (invoice_id);

commit;
