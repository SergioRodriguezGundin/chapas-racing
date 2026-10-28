-- F03-D: start_room (host → playing) + commit_room_settle (active_slot / turn_seq for F03-E reconnect)

create or replace function public.start_room(p_room_id uuid)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  target public.rooms;
  member_count integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_room_id is null then
    raise exception 'room_id required';
  end if;

  select * into target
  from public.rooms r
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if target.host_id is distinct from uid then
    raise exception 'only host can start';
  end if;

  if target.status is distinct from 'lobby' then
    raise exception 'room not startable';
  end if;

  select count(*)::integer into member_count
  from public.room_members m
  where m.room_id = p_room_id;

  if member_count < 2 then
    raise exception 'need at least 2 players';
  end if;

  update public.rooms r
  set
    status = 'playing',
    started_at = now(),
    active_slot = 0,
    turn_seq = 0,
    winner_id = null,
    finished_at = null
  where r.id = p_room_id
  returning * into target;

  return target;
end;
$$;

comment on function public.start_room(uuid) is
  'Host starts match: lobby → playing, active_slot=0, turn_seq=0. Requires ≥2 members.';

-- Any member may advance turn after a settle broadcast (client-gated in F03-D; server validate F03-E).
create or replace function public.commit_room_settle(
  p_room_id uuid,
  p_turn_seq integer,
  p_next_active_slot integer
)
returns public.rooms
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  target public.rooms;
  member_count integer;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_room_id is null then
    raise exception 'room_id required';
  end if;

  if p_turn_seq is null or p_turn_seq < 0 then
    raise exception 'turn_seq invalid';
  end if;

  if p_next_active_slot is null or p_next_active_slot < 0 then
    raise exception 'active_slot invalid';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'not a room member';
  end if;

  select * into target
  from public.rooms r
  where r.id = p_room_id
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if target.status is distinct from 'playing' then
    raise exception 'room not playing';
  end if;

  -- Idempotent / anti-replay: only the expected seq advances
  if target.turn_seq is distinct from p_turn_seq then
    return target;
  end if;

  select count(*)::integer into member_count
  from public.room_members m
  where m.room_id = p_room_id;

  if member_count = 0 or p_next_active_slot >= member_count then
    raise exception 'active_slot out of range';
  end if;

  update public.rooms r
  set
    active_slot = p_next_active_slot,
    turn_seq = p_turn_seq + 1
  where r.id = p_room_id
  returning * into target;

  return target;
end;
$$;

comment on function public.commit_room_settle(uuid, integer, integer) is
  'Advances rooms.active_slot and turn_seq after settle; no-op if turn_seq mismatch. active_slot is dense 0..member_count-1 (match playerIndex), not raw room_members.slot_index.';

grant execute on function public.start_room(uuid) to authenticated;
grant execute on function public.commit_room_settle(uuid, integer, integer) to authenticated;
