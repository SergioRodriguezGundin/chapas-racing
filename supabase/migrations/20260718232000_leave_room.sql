-- F03-C fix: leave_room — durable membership DELETE (not just Presence / connected=false)
-- Host leave: transfer host_id to remaining member with lowest slot_index.
-- Last member leave: DELETE room (cascade cleans any leftover members).

create or replace function public.leave_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  was_host boolean;
  remaining integer;
  new_host uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_room_id is null then
    raise exception 'room_id required';
  end if;

  -- Lock room row so host transfer / empty delete stay consistent under concurrency
  select (r.host_id = uid) into was_host
  from public.rooms r
  where r.id = p_room_id
  for update;

  if not found then
    -- Idempotent: room already gone (or never existed)
    return;
  end if;

  delete from public.room_members m
  where m.room_id = p_room_id
    and m.user_id = uid;

  if not found then
    -- Not a member — idempotent no-op
    return;
  end if;

  select count(*)::integer into remaining
  from public.room_members m
  where m.room_id = p_room_id;

  if remaining = 0 then
    delete from public.rooms r
    where r.id = p_room_id;
    return;
  end if;

  if was_host then
    select m.user_id into new_host
    from public.room_members m
    where m.room_id = p_room_id
    order by m.slot_index asc
    limit 1;

    update public.rooms r
    set host_id = new_host
    where r.id = p_room_id;
  end if;
end;
$$;

comment on function public.leave_room(uuid) is
  'Authenticated leave: DELETE own room_members row; transfer host to lowest slot_index if host left; DELETE room if empty.';

grant execute on function public.leave_room(uuid) to authenticated;
