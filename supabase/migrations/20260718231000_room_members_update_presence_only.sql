-- F03-B post-review (CA3): narrow room_members UPDATE to presence columns.
-- Remote already had rooms_schema_rls with table-level UPDATE; this corrects it.
-- Option A: REVOKE broad UPDATE + GRANT UPDATE (connected, last_seen_at) + RLS policy.

revoke update on table public.room_members from anon, authenticated;
grant update (connected, last_seen_at) on table public.room_members to authenticated;

-- Recreate policy so USING/WITH CHECK still require own row (idempotent drop+create).
drop policy if exists "Members can update own membership" on public.room_members;

create policy "Members can update own membership"
  on public.room_members
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
