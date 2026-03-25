-- Minimal hotfix for:
-- 1) signup failures from duplicate auth bootstrap handlers
-- 2) stack depth recursion on invoice recalculation triggers
-- Non-destructive.

begin;

-- ------------------------------------------------------------
-- A) Ensure ONE auth.users bootstrap trigger path
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_org_name text;
begin
  v_org_name := coalesce(
    new.raw_user_meta_data ->> 'org_name',
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    'New Org'
  );

  insert into public.orgs (name)
  values (v_org_name)
  returning id into v_org_id;

  insert into public.profiles (id, org_id, email, role, full_name)
  values (
    new.id,
    v_org_id,
    new.email,
    'admin',
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, profiles.full_name);

  return new;
end;
$$;

do $$
declare
  r record;
begin
  -- Remove duplicate legacy triggers that call either bootstrap function.
  for r in
    select t.tgname
    from pg_trigger t
    join pg_proc p on p.oid = t.tgfoid
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'auth'
      and c.relname = 'users'
      and not t.tgisinternal
      and p.proname in ('handle_new_user', 'handle_new_user_create_org_and_profile')
  loop
    execute format('drop trigger if exists %I on auth.users', r.tgname);
  end loop;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- B) Stop invoice trigger recursion (stack depth overflow)
-- ------------------------------------------------------------
-- Root issue: handle_invoice_total_recalc() updates invoices inside
-- an AFTER UPDATE trigger on invoices (all updates), causing self-recursion.
-- Fix: trigger only on INSERT or UPDATE OF (total, due_date).

drop trigger if exists trg_invoices_recalculate_balance_due on public.invoices;
create trigger trg_invoices_recalculate_balance_due
after insert or update of total, due_date on public.invoices
for each row execute function public.handle_invoice_total_recalc();

-- Keep one payments recalculation trigger path.
drop trigger if exists payments_after_change on public.payments;
drop trigger if exists trg_payments_recalculate_invoice_totals on public.payments;
create trigger payments_after_change
after insert or update or delete on public.payments
for each row execute function public.handle_payment_invoice_recalc();

-- Remove duplicate line_total trigger implementation path.
drop trigger if exists trg_set_line_total on public.invoice_line_items;
drop trigger if exists trg_set_invoice_line_total on public.invoice_line_items;
create trigger trg_set_invoice_line_total
before insert or update on public.invoice_line_items
for each row execute function public.set_invoice_line_total();

commit;
