-- 002_snapshot_access.sql
--
-- The base schema (001) only grants INSERT on public.iperc_snapshots to anon,
-- so the app could save but never list, load, update or delete saved projects.
--
-- This app has no authentication layer: it is a single, public IPERC tool.
-- To make "Mis proyectos" (list / load / update / delete) usable we open
-- read+write access to the iperc_snapshots table ONLY. Every other operational
-- table keeps its locked-down `using (false)` policy from 001 -- RLS is NOT
-- weakened on companies, areas, tasks, risk_assessments, evidence, etc.
--
-- The WITH CHECK constraints keep the same validation the insert policy had
-- (valid RUC, known sector, allowed status, JSON payload), so anonymous writes
-- cannot store arbitrary garbage.

-- Allow listing / loading saved snapshots.
create policy "anon_select_iperc_snapshots" on public.iperc_snapshots
  for select to anon, authenticated
  using (true);

-- Allow updating an existing snapshot (status promotion + payload edits).
create policy "anon_update_iperc_snapshots" on public.iperc_snapshots
  for update to anon, authenticated
  using (true)
  with check (
    char_length(company_name) between 1 and 180
    and (ruc is null or ruc ~ '^[0-9]{11}$')
    and sector in ('public', 'construction', 'mining', 'hydrocarbons', 'health', 'manufacturing', 'offices', 'transport_logistics', 'warehouses', 'maintenance_services')
    and status in ('draft', 'submitted', 'approved', 'archived')
    and jsonb_typeof(payload) = 'object'
  );

-- Allow deleting a saved snapshot.
create policy "anon_delete_iperc_snapshots" on public.iperc_snapshots
  for delete to anon, authenticated
  using (true);

-- The insert policy in 001 restricts status to draft/submitted. Broaden it so a
-- snapshot can also be inserted directly as approved/archived from the UI.
drop policy if exists "anon_insert_iperc_snapshots" on public.iperc_snapshots;
create policy "anon_insert_iperc_snapshots" on public.iperc_snapshots
  for insert to anon, authenticated
  with check (
    char_length(company_name) between 1 and 180
    and (ruc is null or ruc ~ '^[0-9]{11}$')
    and sector in ('public', 'construction', 'mining', 'hydrocarbons', 'health', 'manufacturing', 'offices', 'transport_logistics', 'warehouses', 'maintenance_services')
    and status in ('draft', 'submitted', 'approved', 'archived')
    and jsonb_typeof(payload) = 'object'
  );

grant select, update, delete on public.iperc_snapshots to anon, authenticated;
